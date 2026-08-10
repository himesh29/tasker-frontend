"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { ChevronRight, PanelLeft } from "lucide-react";
import { TaskDetailHeader } from "@/components/tasks/task-detail/task-detail-header";
import { TaskProperties } from "@/components/tasks/task-detail/task-properties";
import { SubtasksTable } from "@/components/tasks/task-detail/subtasks-table";
import { CommentsSection } from "@/components/tasks/task-detail/comments-section";
import { DetailsPanel } from "@/components/tasks/task-detail/details-panel";
import { UpdatesPanel } from "@/components/tasks/task-detail/updates-panel";
import { useTaskDetail, useTasks } from "@/hooks/use-tasks";
import { useComments } from "@/hooks/use-comments";
import { useProjectMembers } from "@/hooks/use-project-members";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toBackendPriority, toBackendStatus } from "@/lib/adapters";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/providers/auth-provider";
import { useUsers } from "@/hooks/use-users";
import type { Member, Label, Attachment, Status, Priority, Task, Comment } from "@/lib/types";

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.taskId as string;

  const { user } = useAuth();
  const { users } = useUsers();
  const { watch, unwatch } = useTasks();
  const queryClient = useQueryClient();
  const { task, isLoading, updateTask } = useTaskDetail(taskId);
  const { data: projectMembers = [] } = useProjectMembers(task?.projectId);
  const {
    comments,
    addComment,
    updateComment,
    deleteComment,
    react,
    unreact,
    pin,
    unpin
  } = useComments(taskId);

  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const hasSetInitialPanelState = useRef(false);

  const { toggleSidebar } = useSidebar();

  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => {
      const desktop = window.innerWidth >= 1280;
      setIsDesktop(desktop);
      if (!hasSetInitialPanelState.current) {
        hasSetInitialPanelState.current = true;
        setRightPanelOpen(desktop);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isMounted || isLoading || !task || !user) return null;

  const taskData = task;
  const currentUserId = user.id;

  const availableUsers = taskData.projectId ? projectMembers : users;

  const watcherCount = taskData.watcherIds?.length || 0;

  const watchers = taskData.watcherIds
    ?.map((id: string) => users.find((u: Member) => u.id === id))
    .filter((u): u is Member => u !== undefined) || [];

  const handleToggleLock = () => updateTask.mutate({ isLocked: !taskData.isLocked });

  const isWatching = taskData.watcherIds?.includes(currentUserId) || false;
  const handleToggleWatch = () => {
    if (isWatching) {
      unwatch.mutate({ taskId });
    } else {
      watch.mutate({ taskId });
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + window.location.pathname);
    }
  };

  async function handleAddMember(member: Member) {
    await api.post(`/tasks/${taskData.id}/members`, { userIds: [member.id] });
    await queryClient.invalidateQueries({ queryKey: ["task", taskData.id] });
  }

  async function handleRemoveMember(memberId: string) {
    await api.delete(`/tasks/${taskData.id}/members/${memberId}`);
    await queryClient.invalidateQueries({ queryKey: ["task", taskData.id] });
  }

  async function handleAddAttachment(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    await api.post(`/tasks/${taskData.id}/attachments/file`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    await queryClient.invalidateQueries({ queryKey: ["task", taskData.id] });
  }

  async function handleAddLink(url: string, name: string) {
    await api.post(`/tasks/${taskData.id}/attachments/link`, { url, name: name || url });
    await queryClient.invalidateQueries({ queryKey: ["task", taskData.id] });
  }

  async function handleDeleteAttachment(attachmentId: string) {
    await api.delete(`/tasks/${taskData.id}/attachments/${attachmentId}`);
    await queryClient.invalidateQueries({ queryKey: ["task", taskData.id] });
  }

  async function handleAddSubtask(subtask: Task) {
    await api.post("/tasks", {
      title: subtask.title,
      summary: subtask.summary || subtask.title,
      priority: toBackendPriority(subtask.priority),
      parentTaskId: taskData.id,
    });
    await queryClient.invalidateQueries({ queryKey: ["task", taskData.id] });
  }

  async function handleUpdateSubtask(id: string, updates: Partial<Task>) {
    const payload: Record<string, unknown> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.summary !== undefined) payload.summary = updates.summary;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.status !== undefined) payload.status = toBackendStatus(updates.status);
    if (updates.priority !== undefined) payload.priority = toBackendPriority(updates.priority);
    if (updates.labels !== undefined) payload.tag = updates.labels.map((l) => l.name).join(",");
    if (updates.dueDate !== undefined) payload.dueDate = updates.dueDate;
    await api.patch(`/tasks/${id}`, payload);
    await queryClient.invalidateQueries({ queryKey: ["task", taskData.id] });
  }

  async function handleDeleteSubtask(id: string) {
    await api.delete(`/tasks/${id}`);
    await queryClient.invalidateQueries({ queryKey: ["task", taskData.id] });
  }

  function handleAddComment(text: string) {
    addComment.mutate(text);
  }

  function handleEditComment(commentId: string, text: string) {
    updateComment.mutate({ commentId, text });
  }

  function handleDeleteComment(commentId: string) {
    deleteComment.mutate(commentId);
  }

  function handleReact(commentId: string, emoji: string) {
    react.mutate({ commentId, emoji });
  }

  function handleUnreact(commentId: string, emoji: string) {
    unreact.mutate({ commentId, emoji });
  }

  function handlePin(commentId: string) {
    const comment = comments.find((c: Comment) => c.id === commentId);
    if (comment && comment.pinned) {
      unpin.mutate(commentId);
    } else {
      pin.mutate(commentId);
    }
  }

  function handleStatusChange(newStatus: Status) {
    updateTask.mutate({ status: newStatus });
  }

  function handlePriorityChange(newPriority: Priority) {
    updateTask.mutate({ priority: newPriority });
  }

  async function handleAssigneeChange(member: Member) {
    const currentAssignee = taskData.members[0];
    if (currentAssignee && currentAssignee.id !== member.id) {
      await api.delete(`/tasks/${taskData.id}/members/${currentAssignee.id}`);
    }
    if (!taskData.members.some((m: Member) => m.id === member.id)) {
      await api.post(`/tasks/${taskData.id}/members`, { userIds: [member.id] });
    }
    queryClient.invalidateQueries({ queryKey: ["task", taskData.id] });
  }

  function handleDueDateChange(date: string | null) {
    updateTask.mutate({ dueDate: (date ?? null) as any });
  }

  function handleDateRangeChange(range: { start?: string; end?: string }) {
    updateTask.mutate({
      dateRangeStart: (range.start || null) as any,
      dateRangeEnd: (range.end || null) as any
    });
  }

  function handleReporterChange(member: Member | null) {
    updateTask.mutate({ reporterId: member?.id ?? null });
  }

  function handleAddLabel(label: Label) {
    const next = [...taskData.labels, label];
    updateTask.mutate({ labels: next });
  }

  function handleRemoveLabel(labelId: string) {
    const next = taskData.labels.filter((l: Label) => l.id !== labelId);
    updateTask.mutate({ labels: next });
  }

  // NEW: Update description
  function handleUpdateDescription(newDescription: string) {
    updateTask.mutate({ description: newDescription });
  }

  const SidePanelContent = () => (
    <div className="flex flex-col gap-6 w-full h-full pb-8">
      <DetailsPanel
        availableUsers={availableUsers}
        status={taskData.status}
        priority={taskData.priority}
        reporter={taskData.reporter}
        members={taskData.members}
        labels={taskData.labels}
        dateRange={taskData.dateRange}
        onStatusChange={handleStatusChange}
        onPriorityChange={handlePriorityChange}
        onReporterChange={handleReporterChange}
        onAddMember={handleAddMember}
        onAddLabel={handleAddLabel}
        onRemoveLabel={handleRemoveLabel}
        onDateRangeChange={handleDateRangeChange}
      />
      <UpdatesPanel activities={taskData.activities || []} />
    </div>
  );

  return (
    <div className="flex flex-1 flex-col h-full min-h-0">
      <div className="flex shrink-0 sticky top-0 z-20 bg-background items-center gap-3 p-4 border-b border-border">
        <PanelLeft
          className="h-4 w-4 cursor-pointer text-muted-foreground"
          onClick={toggleSidebar}
        />
        <Separator orientation="vertical" className="h-4" />
      </div>

      <div className="flex flex-1 min-h-0 gap-8 p-6 md:p-8 overflow-y-auto">
        <div className="flex flex-1 min-w-0 flex-col gap-8">
          <TaskDetailHeader
            title={taskData.title}
            description={taskData.description}
            isLocked={taskData.isLocked}
            isWatching={isWatching}
            watcherCount={watcherCount}
            watchers={watchers}
            reporter={taskData.reporter}
            onToggleLock={handleToggleLock}
            onToggleWatch={handleToggleWatch}
            onShare={handleShare}
            onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
            onUpdateDescription={handleUpdateDescription}
          />

          <TaskProperties
            taskId={taskData.id}
            availableUsers={availableUsers}
            assignee={taskData.properties.assignee}
            dueDate={taskData.properties.dueDate}
            labels={taskData.labels}
            members={taskData.members}
            attachments={taskData.attachments || []}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
            onAddAttachment={handleAddAttachment}
            onAddLink={handleAddLink}
            onRemoveAttachment={handleDeleteAttachment}
            onAddLabel={handleAddLabel}
            onRemoveLabel={handleRemoveLabel}
            onAssigneeChange={handleAssigneeChange}
            onDueDateChange={handleDueDateChange}
          />

          <SubtasksTable
            subtasks={taskData.subtasks}
            onAddSubtask={handleAddSubtask}
            onUpdateSubtask={handleUpdateSubtask}
            onDeleteSubtask={handleDeleteSubtask}
          />

          <CommentsSection
            comments={comments}
            currentUserId={currentUserId}
            onAddComment={handleAddComment}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
            onReact={handleReact}
            onUnreact={handleUnreact}
            onPin={handlePin}
          />
        </div>

        {isDesktop ? (
          rightPanelOpen && (
            <div className="relative flex w-80 shrink-0 flex-col hidden xl:flex">
              <div className="flex flex-col gap-6 w-full h-full">
                <SidePanelContent />
              </div>
            </div>
          )
        ) : (
          <Sheet open={rightPanelOpen} onOpenChange={setRightPanelOpen}>
            <SheetContent side="right" showCloseButton={false} className="w-[340px] sm:w-[400px] p-0 bg-background border-l">
              <button
                onClick={() => setRightPanelOpen(false)}
                className="absolute top-1/2 -translate-y-1/2 -left-5 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background shadow-md hover:bg-accent text-muted-foreground hover:text-foreground transition-all z-50"
                title="Close panel"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              <div className="h-full w-full overflow-y-auto p-6">
                <SidePanelContent />
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  );
}
