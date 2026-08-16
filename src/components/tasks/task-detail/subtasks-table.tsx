"use client";

import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { TaskRow } from "../task-row";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task, FieldId, Priority } from "@/lib/types";

const DEFAULT_VISIBLE_FIELDS: Record<FieldId, boolean> = {
  priority: true,
  members: true,
  dueDate: true,
  labels: false,
  status: false,
  reporter: false,
};

export function SubtasksTable({
  subtasks,
  onAddSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
}: {
  subtasks: Task[];
  onAddSubtask: (subtask: Task) => void;
  onUpdateSubtask: (id: string, updates: Partial<Task>) => void;
  onDeleteSubtask: (id: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  function handleCreate() {
    if (!title.trim()) {
      setAdding(false);
      return;
    }
    const subtask: Task = {
      id: "new-subtask",
      title: title.trim(),
      status: "todo",
      priority,
      members: [],
      dueDate: undefined,
      labels: [],
    };
    onAddSubtask(subtask);
    setTitle("");
    setPriority("medium");
    setAdding(false);
  }

  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger className="flex items-center gap-1.5 text-sm font-medium">
        <ChevronDown className="h-4 w-4" />
        Subtasks
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2">
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Task</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subtasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  visibleFields={DEFAULT_VISIBLE_FIELDS}
                  onUpdate={onUpdateSubtask}
                  onDelete={onDeleteSubtask}
                />
              ))}
            </TableBody>
          </Table>

          {adding ? (
            <div className="flex items-center gap-2 border-t border-border px-4 py-2.5">
              <Input
                placeholder="Subtask title (Press Enter to save)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") {
                    setAdding(false);
                    setTitle("");
                  }
                }}
                autoFocus
                className="flex-1"
              />
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-priority">No Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" onClick={handleCreate}>Add</Button>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="flex w-full items-center gap-2 border-t border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent/50"
            >
              <Plus className="h-4 w-4" />
              Add Subtasks
            </button>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
