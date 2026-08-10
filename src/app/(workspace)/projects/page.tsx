"use client";

import { useState, useMemo } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { ProjectsTable } from "@/components/projects/projects-table";
import { useProjects } from "@/hooks/use-projects";
import type { FieldId } from "@/components/shared/fields-popover";
import type { FilterState } from "@/components/shared/filter-popover";
import type { Project } from "@/lib/types";

export default function ProjectsPage() {
  const { projects } = useProjects();
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
    return projects.filter((p: Project) => {
      const matchesSearch = search === "" || 
        p.name.toLowerCase().includes(search.toLowerCase());
      const matchesPriority = !filters.priority || p.priority === filters.priority;
      return matchesSearch && matchesPriority;
    });
  }, [projects, search, filters]);

  return (
    <div className="flex flex-1 flex-col overflow-x-hidden">
      <TopBar
        onSearch={setSearch}
        filters={filters}
        onFilterChange={setFilters}
        visibleFields={visibleFields}
        onVisibleFieldsChange={setVisibleFields}
        showViewToggle={false}
        addLabel="project"
      />
      <div className="flex-1 overflow-x-auto py-2 px-4 md:px-8">
        <h1 className="mb-4 text-lg font-semibold">Projects</h1>
        <ProjectsTable projects={filtered} visibleFields={visibleFields} />
      </div>
    </div>
  );
}
