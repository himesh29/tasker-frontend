"use client";

import { useState } from "react";
import { MoreHorizontal, Trash2, ArrowRightLeft, Pencil, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { MemberAvatar } from "./shared/member-avatar";
import { DueDatePill } from "./shared/due-date-pill";
import { LabelPill } from "./shared/label-pill";
import { useTasks } from "@/hooks/use-tasks";
import { useAuth } from "@/providers/auth-provider";
import { STATUS_COLUMNS } from "@/lib/constants";
import type { Task } from "@/lib/types";
import Link from "next/link";

export function TaskCard({ task }: { task: Task }) {
  const { deleteTask, updateTaskStatus, updateTask } = useTasks(task.projectId);
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [copied, setCopied] = useState(false);

  // Check if current user is allowed to edit the task
  const isCreator = user?.id === task.createdById;
  const isAssignee = task.members.some((m) => m.id === user?.id);
  const isProjectOwner = user?.ownedProjects?.some((p: any) => p.id === task.projectId);
  const canEdit = !task.isLocked && (isCreator || isAssignee || isProjectOwner);

  function handleSaveEdit() {
    if (editTitle.trim() && editTitle.trim() !== task.title) {
      updateTask(task.id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/tasks/${task.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`flex w-full flex-col gap-3 rounded-lg border border-border bg-card p-3 shadow-sm transition-colors ${canEdit ? "hover:border-border/80" : "opacity-95"}`}>
      <div className="flex items-start justify-between gap-2">
        {isEditing && canEdit ? (
          <input
            autoFocus
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.stopPropagation();
                e.currentTarget.blur();
                handleSaveEdit();
              }
              if (e.key === "Escape") {
                setEditTitle(task.title);
                setIsEditing(false);
                e.stopPropagation();
              }
            }}
            className="flex-1 rounded-md border border-input bg-background px-2 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          />
        ) : (
          <Link
            href={`/tasks/${task.id}`}
            className="text-sm font-medium hover:underline flex-1 leading-snug"
          >
            {task.title}
          </Link>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-muted-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            
            {/* Viewers can always copy the link */}
            <DropdownMenuItem onClick={handleCopyLink}>
              {copied ? <Check className="h-4 w-4 mr-1.5 text-green-600" /> : <Share2 className="h-4 w-4 mr-1.5" />}
              {copied ? "Copied!" : "Copy link"}
            </DropdownMenuItem>

            {/* Editing / Deleting is restricted */}
            {canEdit && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4 mr-1.5" />
                  Edit title
                </DropdownMenuItem>
                
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <ArrowRightLeft className="h-4 w-4 mr-1.5" />
                    Move to
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {STATUS_COLUMNS.filter((c) => c.id !== task.status).map((col) => (
                      <DropdownMenuItem
                        key={col.id}
                        onClick={() => updateTaskStatus(task.id, col.id)}
                      >
                        {col.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
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
      </div>

      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-1.5">
          {task.members[0] ? (
            <>
              <MemberAvatar member={task.members[0]} />
              <span className="text-xs font-medium text-foreground">
                {task.members[0].name}
              </span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">Unassigned</span>
          )}
        </div>
        {task.dueDate && <DueDatePill date={task.dueDate} />}
      </div>

      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border/50">
          {task.labels.map((label) => (
            <LabelPill key={label.id} label={label} />
          ))}
        </div>
      )}
    </div>
  );
}
