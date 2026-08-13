"use client";

import { PanelLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { FieldsPopover, type FieldId } from "@/components/shared/fields-popover";
import { SearchPopover } from "@/components/shared/search-popover";
import { FilterPopover, type FilterState } from "@/components/shared/filter-popover";
import { AddTaskDialog } from "@/components/tasks/add-task-dialog";
import { AddProjectDialog } from "@/components/projects/add-project-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function TopBar({
  view = "board",
  onViewChange = () => {},
  onSearch = () => {},
  filters,
  onFilterChange,
  priorityFilter = null,
  onPriorityFilterChange = () => {},
  visibleFields,
  onVisibleFieldsChange,
  showViewToggle = true,
  addLabel = "task",
  projectId,
}: {
  view?: "list" | "board";
  onViewChange?: (value: "list" | "board") => void;
  onSearch?: (query: string) => void;
  filters?: FilterState;
  onFilterChange?: (filters: FilterState) => void;
  priorityFilter?: string | null;
  onPriorityFilterChange?: (value: string | null) => void;
  visibleFields?: Record<FieldId, boolean>;
  onVisibleFieldsChange?: (fields: Record<FieldId, boolean>) => void;
  showViewToggle?: boolean;
  addLabel?: "task" | "project";
  projectId?: string;
}) {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="flex shrink-0 sticky top-0 z-20 bg-background items-center justify-between p-4 border-b border-border overflow-hidden">
      <div className="flex items-center gap-3 flex-shrink-0">
        <PanelLeft
          className="h-4 w-4 cursor-pointer text-muted-foreground"
          onClick={toggleSidebar}
        />
        <Separator orientation="vertical" className="h-4" />
      </div>

      <div className="flex items-center gap-1 sm:gap-2 flex-nowrap min-w-0">
        <SearchPopover onSearch={onSearch} />

        {visibleFields && onVisibleFieldsChange && (
          <FieldsPopover
            view={view}
            onViewChange={onViewChange}
            visibleFields={visibleFields}
            onVisibleFieldsChange={onVisibleFieldsChange}
            showViewToggle={showViewToggle}
          />
        )}

        {filters && onFilterChange && (
          <FilterPopover filters={filters} onFilterChange={onFilterChange} />
        )}

        {addLabel === "task" ? (
          <AddTaskDialog projectId={projectId}>
            <Button variant="default" size="sm" className="px-2 sm:px-4 flex-shrink-0">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Task</span>
            </Button>
          </AddTaskDialog>
        ) : (
          <AddProjectDialog>
            <Button variant="default" size="sm" className="px-2 sm:px-4 flex-shrink-0">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Project</span>
            </Button>
          </AddProjectDialog>
        )}
      </div>
    </div>
  );
}
