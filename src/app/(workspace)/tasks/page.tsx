"use client";

import { useState, useMemo } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { BoardView } from "@/components/tasks/board-view";
import { ListView } from "@/components/tasks/list-view";
import { useTasks } from "@/hooks/use-tasks";
import type { FieldId } from "@/components/shared/fields-popover";
import type { FilterState } from "@/components/shared/filter-popover";
import type { Task, Member } from "@/lib/types";

export default function TasksPage() {
  const { tasks } = useTasks();
  const [view, setView] = useState<"list" | "board">("board");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    status: null,
    priority: null,
    members: [],
    dueDate: null,
    labels: [],
    reporter: null,
  });
  const [visibleFields, setVisibleFields] = useState<Record<FieldId, boolean>>({
    priority: true,
    members: true,
    dueDate: true,
    labels: false,
    status: false,
    reporter: false,
  });

  const filtered = useMemo(() => {
    return tasks.filter((t: Task) => {
      const matchesSearch = t.title
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesPriority = !filters.priority || t.priority === filters.priority;
      const matchesStatus = !filters.status || t.status === filters.status;
      const matchesMembers = filters.members.length === 0 || 
        t.members.some((m: Member) => filters.members.includes(m.id));
      return matchesSearch && matchesPriority && matchesStatus && matchesMembers;
    });
  }, [tasks, search, filters]);

  return (
    <div className="flex flex-1 flex-col overflow-x-hidden">
      <TopBar
        view={view}
        onViewChange={setView}
        onSearch={setSearch}
        filters={filters}
        onFilterChange={setFilters}
        visibleFields={visibleFields}
        onVisibleFieldsChange={setVisibleFields}
        showViewToggle
        addLabel="task"
      />
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto py-2 px-4 md:px-8">
        <h1 className="mb-4 text-lg font-semibold">Tasks</h1>
        {view === "board" ? (
          <BoardView tasks={filtered} />
        ) : (
          <ListView tasks={filtered} visibleFields={visibleFields} />
        )}
      </div>
    </div>
  );
}
