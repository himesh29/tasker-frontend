"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskCard } from "./task-card";
import { useAuth } from "@/providers/auth-provider";
import type { Task } from "@/lib/types";

export function SortableTaskCard({ task }: { task: Task }) {
  const { user } = useAuth();
  
  // Verify permissions: Creator, Task Assignee, or Project Owner
  const isCreator = user?.id === task.createdById;
  const isAssignee = task.members.some((m) => m.id === user?.id);
  const isProjectOwner = user?.ownedProjects?.some((p: any) => p.id === task.projectId);
  const canEdit = !task.isLocked && (isCreator || isAssignee || isProjectOwner);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "task", task },
    disabled: !canEdit, // <-- Disable drag-and-drop if they lack permissions
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: canEdit ? "grab" : "default", // Update cursor visually
  };

  return (
    <div ref={setNodeRef} style={style} {...(canEdit ? attributes : {})} {...(canEdit ? listeners : {})}>
      <TaskCard task={task} />
    </div>
  );
}
