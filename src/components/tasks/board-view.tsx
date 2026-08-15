"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { BoardColumn } from "./board-column";
import { TaskCard } from "./task-card";
import { STATUS_COLUMNS } from "@/lib/constants";
import { useTasks } from "@/hooks/use-tasks";
import type { Task, Status } from "@/lib/types";

// FIXED: added projectId to prop to keep caches in sync
export function BoardView({ tasks, projectId }: { tasks: Task[]; projectId?: string }) {
  const { updateTaskStatus } = useTasks(projectId);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const tasksByStatus = useMemo(() => {
    const map: Record<Status, Task[]> = {
      todo: [],
      doing: [],
      completed: [],
      "on-hold": [],
    };
    for (const t of tasks) {
      if (map[t.status]) map[t.status].push(t);
    }
    return map;
  }, [tasks]);

  const activeTask = useMemo(
    () => tasks.find((t) => t.id === activeId) || null,
    [activeId, tasks]
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    const columnIds = STATUS_COLUMNS.map((c) => c.id);
    if (columnIds.includes(overId as Status)) {
      const newStatus = overId as Status;
      const task = tasks.find((t) => t.id === activeTaskId);
      if (task && task.status !== newStatus) {
        updateTaskStatus(activeTaskId, newStatus);
      }
      return;
    }

    const overTask = tasks.find((t) => t.id === overId);
    if (!overTask) return;

    const activeTaskItem = tasks.find((t) => t.id === activeTaskId);
    if (!activeTaskItem) return;

    if (activeTaskItem.status !== overTask.status) {
      updateTaskStatus(activeTaskId, overTask.status);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex items-start gap-4 overflow-x-auto pb-4">
        {STATUS_COLUMNS.map((column) => (
          <BoardColumn
            key={column.id}
            id={column.id}
            label={column.label}
            tasks={tasksByStatus[column.id]}
            projectId={projectId}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
        {activeTask ? (
          <div className="opacity-90 rotate-2 scale-105">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
