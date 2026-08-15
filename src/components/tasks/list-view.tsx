"use client";

import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TaskRow } from "./task-row";
import { STATUS_COLUMNS } from "@/lib/constants";
import type { Task, FieldId, Priority } from "@/lib/types";
import { useTasks } from "@/hooks/use-tasks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function ListView({
  tasks,
  visibleFields,
  projectId,
}: {
  tasks: Task[];
  visibleFields: Record<FieldId, boolean>;
  projectId?: string;
}) {
  const { addTask } = useTasks();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addStatus, setAddStatus] = useState<string>("todo");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [newTags, setNewTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        projectId,
        status: addStatus as Task["status"],
        priority: newPriority,
        members: [],
        dueDate: newDueDate || undefined,
        labels: labelObjects,
      });
      setNewTitle("");
      setNewDescription("");
      setNewPriority("medium");
      setNewDueDate("");
      setNewTags("");
      setAddDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {STATUS_COLUMNS.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id);
        if (columnTasks.length === 0) return null;

        return (
          <Collapsible key={column.id} defaultOpen>
            <CollapsibleTrigger className="flex items-center gap-1.5 text-sm font-medium">
              <ChevronDown className="h-4 w-4 transition-transform group-data-[state=closed]:-rotate-90" />
              {column.label}
              <span className="text-xs text-muted-foreground">({columnTasks.length})</span>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-2">
              <div className="rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead>Task</TableHead>
                      {visibleFields.priority !== false && <TableHead>Priority</TableHead>}
                      {visibleFields.members !== false && <TableHead>Members</TableHead>}
                      {visibleFields.dueDate !== false && <TableHead>Due Date</TableHead>}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {columnTasks.map((task) => (
                      <TaskRow key={task.id} task={task} visibleFields={visibleFields} />
                    ))}
                  </TableBody>
                </Table>
                <button
                  onClick={() => {
                    setAddStatus(column.id);
                    setAddDialogOpen(true);
                  }}
                  className="flex w-full items-center gap-2 border-t border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent/50"
                >
                  <Plus className="h-4 w-4" />
                  Add Task
                </button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
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
              value={addStatus}
              onValueChange={setAddStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="doing">Doing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
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
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
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
