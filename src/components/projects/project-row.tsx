"use client";

import { useState } from "react";
import { MoreHorizontal, Plus, Pencil, Trash2, ChevronDown, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PriorityBadge } from "@/components/tasks/shared/priority-badge";
import { useProjects } from "@/hooks/use-projects";
import { useUsers } from "@/hooks/use-users";
import { useAuth } from "@/providers/auth-provider";
import type { Project, Priority, Member } from "@/lib/types";
import type { FieldId } from "@/components/shared/fields-popover";

const PRIORITY_OPTIONS: Priority[] = ["no-priority", "urgent", "high", "medium", "low"];

export function ProjectRow({ 
  project, 
  visibleFields 
}: { 
  project: Project; 
  visibleFields: Record<FieldId, boolean>;
}) {
  const { addMemberToProject, updateProject, deleteProject } = useProjects();
  const { users } = useUsers();
  const { user } = useAuth(); // <-- Hook into auth

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [editPriority, setEditPriority] = useState<Priority>(project.priority);
  const [editDueDate, setEditDueDate] = useState<string | undefined | null>(project.dueDate);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  // Define if they are the owner of the project
  const isOwner = user?.id === project.lead.id;

  const formattedDate = project.dueDate
    ? new Date(project.dueDate).toLocaleDateString("en-US", {
        timeZone: "UTC",
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  function handleSave() {
    if (editName.trim() && (editName !== project.name || editPriority !== project.priority || editDueDate !== project.dueDate)) {
      updateProject(project.id, {
        name: editName.trim(),
        priority: editPriority,
        dueDate: (editDueDate ?? null) as any, 
      });
    }
    setIsEditing(false);
  }

  function handleNameKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSave();
    }
    if (e.key === "Escape") {
      setEditName(project.name);
      setEditPriority(project.priority);
      setEditDueDate(project.dueDate);
      setIsEditing(false);
    }
  }

  function handleStartEditing() {
    setEditName(project.name);
    setEditPriority(project.priority);
    setEditDueDate(project.dueDate);
    setIsEditing(true);
  }

  function handleDueDateChange(date: Date | undefined) {
    setEditDueDate(date ? date.toISOString() : null);
    setDatePopoverOpen(false);
  }

  return (
    <TableRow>
      <TableCell>
        {isEditing && isOwner ? (
          <input
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={handleNameKeyDown}
            onBlur={handleSave}
            className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          />
        ) : (
          <Link href={`/projects/${project.id}`} className="hover:underline">
            {project.name}
          </Link>
        )}
      </TableCell>

      {visibleFields.priority !== false && (
        <TableCell>
          {isEditing && isOwner ? (
            <Select value={editPriority} onValueChange={(v) => setEditPriority(v as Priority)}>
              <SelectTrigger className="w-auto border-none shadow-none bg-transparent p-0 h-auto">
                <PriorityBadge priority={editPriority} />
                <ChevronDown className="h-3 w-3 text-muted-foreground opacity-50" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    <PriorityBadge priority={opt} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <PriorityBadge priority={project.priority} />
          )}
        </TableCell>
      )}

      {visibleFields.members !== false && (
        <TableCell>
          {isOwner ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-accent cursor-pointer">
                  {project.lead?.name && project.lead.name !== "Deleted User" ? (
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {project.lead.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {users.map((m: Member) => (
                  <DropdownMenuItem
                    key={m.id}
                    onClick={() => addMemberToProject(project.id, m)}
                  >
                    {m.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <div className="flex h-6 w-6 items-center justify-center rounded-full">
               {project.lead?.name && project.lead.name !== "Deleted User" ? (
                 <Avatar className="h-6 w-6">
                   <AvatarFallback className="text-xs">
                     {project.lead.name.slice(0, 2).toUpperCase()}
                   </AvatarFallback>
                 </Avatar>
               ) : (
                 <span className="text-muted-foreground text-xs">—</span>
               )}
             </div>
          )}
        </TableCell>
      )}

      {visibleFields.dueDate !== false && (
        <TableCell>
          {isEditing && isOwner ? (
            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-accent transition-colors outline-none text-sm text-foreground font-medium">
                  {editDueDate ? (
                    new Date(editDueDate).toLocaleDateString("en-US", {
                      timeZone: "UTC",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  ) : (
                    <span className="text-muted-foreground">Set date</span>
                  )}
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={editDueDate ? new Date(editDueDate) : undefined}
                  onSelect={handleDueDateChange}
                />
              </PopoverContent>
            </Popover>
          ) : (
            <span className="text-sm text-foreground">{formattedDate}</span>
          )}
        </TableCell>
      )}

      <TableCell className="text-right">
        {isEditing && isOwner ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground cursor-pointer"
            onClick={handleSave}
            title="Done editing"
          >
            <Check className="h-4 w-4" />
          </Button>
        ) : (
          isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground cursor-pointer"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleStartEditing}>
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => deleteProject(project.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        )}
      </TableCell>
    </TableRow>
  );
}
