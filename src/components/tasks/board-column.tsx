"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { GripVertical, Plus, MoreHorizontal, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SortableTaskCard } from "./sortable-task-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Make sure Textarea is imported
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTasks } from "@/hooks/use-tasks";
import { STATUS_COLUMNS } from "@/lib/constants";
import type { Task, Status, Priority } from "@/lib/types";

export function BoardColumn({
  id,
  label,
  tasks,
  projectId,
}: {
  id: Status;
  label: string;
  tasks: Task[];
  projectId?: string;
}) {
  const { addTask, updateTaskStatus } = useTasks();
  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [newTags, setNewTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: "column", status: id },
  });

  async function handleAddTask() {
    if (!newTitle.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const labelObjects = newTags.split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .map((name) => ({ id: name, name }));
      await addTask({
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        status: id,
        priority: newPriority,
        members: [],
        dueDate: newDueDate || undefined,
        labels: labelObjects,
        projectId,
      });
      setNewTitle("");
      setNewDescription("");
      setNewPriority("medium");
      setNewDueDate("");
      setNewTags("");
      setAddOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={`flex shrink-0 flex-col gap-3 rounded-lg border p-3 transition-colors min-w-[280px] max-w-[320px] ${
        isOver ? "border-primary bg-primary/5" : "border-border bg-accent"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-muted-foreground">({tasks.length})</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-foreground"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <span className="px-2 py-1 text-xs text-muted-foreground">Move all to</span>
              {STATUS_COLUMNS.filter((c) => c.id !== id).map((col) => (
                <DropdownMenuItem
                  key={col.id}
                  onClick={() => {
                    tasks.forEach((t) => updateTaskStatus(t.id, col.id));
                  }}
                >
                  <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5" />
                  {col.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2 min-h-[40px]">
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>

      <button
        onClick={() => setAddOpen(true)}
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-foreground hover:bg-background/60"
      >
        <Plus className="h-4 w-4" />
        Add Task
      </button>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Task to {label}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input
              placeholder="Task title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              autoFocus
            />
            <Textarea
              placeholder="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
            />
            <Select
              value={newPriority}
              onValueChange={(v) => setNewPriority(v as Priority)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-priority">No Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              placeholder="Due date"
            />
            <Input
              placeholder="Tags (comma separated)"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
