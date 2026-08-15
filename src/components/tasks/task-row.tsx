"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Share2, Check, ChevronDown, Plus, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MemberAvatar } from "./shared/member-avatar";
import { PriorityBadge } from "./shared/priority-badge";
import { useTasks } from "@/hooks/use-tasks";
import { useUsers } from "@/hooks/use-users";
import { useProjectMembers } from "@/hooks/use-project-members";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import type { Task, FieldId, Priority, Member } from "@/lib/types";

const PRIORITY_OPTIONS: Priority[] = ["no-priority", "urgent", "high", "medium", "low"];

export function TaskRow({
  task,
  visibleFields,
  onUpdate,
  onDelete,
}: {
  task: Task;
  visibleFields: Record<FieldId, boolean>;
  onUpdate?: (id: string, updates: Partial<Task>) => void;
  onDelete?: (id: string) => void;
}) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { deleteTask: globalDelete, updateTask: globalUpdate } = useTasks(task.projectId);
  const { users } = useUsers();
  const { data: projectMembers = [] } = useProjectMembers(task.projectId);

  const updateTask = onUpdate || globalUpdate;
  const deleteTask = onDelete || globalDelete;

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [copied, setCopied] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  // Determine permissions
  const isCreator = user?.id === task.createdById;
  const isAssignee = task.members.some((m) => m.id === user?.id);
  const isProjectOwner = user?.ownedProjects?.some((p: any) => p.id === task.projectId);
  const canEdit = !task.isLocked && (isCreator || isAssignee || isProjectOwner);

  const formattedDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-US", {
        timeZone: "UTC",
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  const availableUsers = task.projectId ? projectMembers : users;

  function handleSaveTitle() {
    if (editTitle.trim() && editTitle.trim() !== task.title) {
      updateTask(task.id, { title: editTitle.trim() });
    } else {
      setEditTitle(task.title);
    }
  }

  function handleTitleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSaveTitle();
      setIsEditing(false);
    }
    if (e.key === "Escape") {
      setEditTitle(task.title);
      setIsEditing(false);
    }
  }

  function handleStartEditing() {
    setEditTitle(task.title);
    setIsEditing(true);
  }

  function handleDoneEditing() {
    handleSaveTitle();
    setIsEditing(false);
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/tasks/${task.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePriorityChange(newPriority: Priority) {
    updateTask(task.id, { priority: newPriority });
  }

  function handleDateChange(date: Date | undefined) {
    updateTask(task.id, { dueDate: (date ? date.toISOString() : null) as any });
    setDatePopoverOpen(false);
  }

  async function handleAddMember(member: Member) {
    try {
      await api.post(`/tasks/${task.id}/members`, { userIds: [member.id] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      if (task.projectId) qc.invalidateQueries({ queryKey: ["tasks", task.projectId] });
      setMemberSearch("");
    } catch (error) {
      console.error("Failed to add member", error);
    }
  }

  async function handleRemoveMember(memberId: string) {
    try {
      await api.delete(`/tasks/${task.id}/members/${memberId}`);
      qc.invalidateQueries({ queryKey: ["tasks"] });
      if (task.projectId) qc.invalidateQueries({ queryKey: ["tasks", task.projectId] });
    } catch (error) {
      console.error("Failed to remove member", error);
    }
  }

  const unassignedMembers = availableUsers.filter(
    (m: Member) => !task.members.some((existing) => existing.id === m.id) &&
           m.name.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <TableRow>
      <TableCell className="font-medium">
        {isEditing && canEdit ? (
          <input
            autoFocus
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          />
        ) : (
          <Link href={`/tasks/${task.id}`} className="hover:underline">
            {task.title}
          </Link>
        )}
      </TableCell>

      {visibleFields.priority !== false && (
        <TableCell>
          {isEditing && canEdit ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-accent transition-colors outline-none cursor-pointer">
                  <PriorityBadge priority={task.priority} />
                  <ChevronDown className="h-3 w-3 text-muted-foreground opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {PRIORITY_OPTIONS.map((option) => (
                  <DropdownMenuItem key={option} onClick={() => handlePriorityChange(option)}>
                    <PriorityBadge priority={option} />
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center px-2 py-1">
              <PriorityBadge priority={task.priority} />
            </div>
          )}
        </TableCell>
      )}

      {visibleFields.members !== false && (
        <TableCell>
          {isEditing && canEdit ? (
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center hover:opacity-80 transition-opacity outline-none cursor-pointer">
                  {task.members.length > 0 ? (
                    <div className="flex -space-x-2 items-center">
                      {task.members.map((member: Member, idx: number) => (
                        <div
                          key={member.id}
                          className="relative rounded-full border-2 border-background"
                          style={{ zIndex: task.members.length - idx }}
                        >
                          <MemberAvatar member={member} />
                        </div>
                      ))}
                      <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-background border border-dashed border-muted-foreground text-muted-foreground hover:bg-accent" style={{ zIndex: 0 }}>
                        <Plus className="h-3 w-3" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-muted-foreground hover:bg-accent">
                        <Plus className="h-3 w-3" />
                      </div>
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </div>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="start">
                <div className="mb-2 space-y-1">
                  {task.members.map((member: Member) => (
                    <div key={member.id} className="flex items-center justify-between text-sm p-1">
                      <div className="flex items-center gap-2">
                        <MemberAvatar member={member} />
                        <span>{member.name}</span>
                      </div>
                      <button onClick={() => handleRemoveMember(member.id)} className="text-muted-foreground hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {task.members.length === 0 && (
                    <span className="text-xs text-muted-foreground p-1 block">No members assigned.</span>
                  )}
                </div>
                <div className="border-t pt-2">
                  <Input
                    placeholder={task.projectId ? "Search project members..." : "Add member..."}
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="mb-2 h-7 text-xs"
                  />
                  {task.projectId && !projectMembers.length && (
                    <p className="text-xs text-muted-foreground p-1">No other project members</p>
                  )}
                  {unassignedMembers.length === 0 && memberSearch && (
                    <p className="text-xs text-muted-foreground p-1">No matching users</p>
                  )}
                  <div className="flex flex-col gap-0.5">
                    {unassignedMembers.map((m: Member) => (
                      <button
                        key={m.id}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent text-left"
                        onClick={() => handleAddMember(m)}
                      >
                        <MemberAvatar member={m} />
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <div className="flex items-center px-2 py-1">
              {task.members.length > 0 ? (
                <div className="flex -space-x-2 items-center">
                  {task.members.map((member: Member, idx: number) => (
                    <div
                      key={member.id}
                      className="relative rounded-full border-2 border-background"
                      style={{ zIndex: task.members.length - idx }}
                    >
                      <MemberAvatar member={member} />
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Unassigned</span>
              )}
            </div>
          )}
        </TableCell>
      )}

      {visibleFields.dueDate !== false && (
        <TableCell>
          {isEditing && canEdit ? (
            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-accent transition-colors outline-none text-sm text-foreground font-medium cursor-pointer">
                  {task.dueDate ? formattedDate : <span className="text-muted-foreground">Set date</span>}
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={task.dueDate ? new Date(task.dueDate) : undefined}
                  onSelect={handleDateChange}
                />
              </PopoverContent>
            </Popover>
          ) : (
            <span className="inline-block px-2 py-1 text-sm text-foreground font-medium">
              {task.dueDate ? formattedDate : <span className="text-muted-foreground">—</span>}
            </span>
          )}
        </TableCell>
      )}

      <TableCell className="text-right">
        {isEditing && canEdit ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground cursor-pointer"
            onClick={handleDoneEditing}
            title="Done editing"
          >
            <Check className="h-4 w-4" />
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground cursor-pointer">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              
              <DropdownMenuItem onClick={handleCopyLink}>
                {copied ? <Check className="h-4 w-4 mr-1.5 text-green-600" /> : <Share2 className="h-4 w-4 mr-1.5" />}
                {copied ? "Copied!" : "Copy link"}
              </DropdownMenuItem>

              {/* Editing / Deleting restricted to permitted users */}
              {canEdit && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleStartEditing}>
                    <Pencil className="h-4 w-4 mr-1.5" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => deleteTask(task.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TableCell>
    </TableRow>
  );
}
