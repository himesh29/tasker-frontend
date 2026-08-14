"use client";

import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProjectRow } from "./project-row";
import { AddProjectDialog } from "./add-project-dialog";
import type { Project } from "@/lib/types";
import type { FieldId } from "@/components/shared/fields-popover";

export function ProjectsTable({ 
  projects, 
  visibleFields 
}: { 
  projects: Project[]; 
  visibleFields: Record<FieldId, boolean>;
}) {
  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead>Projects</TableHead>
            {visibleFields.priority !== false && <TableHead>Priority</TableHead>}
            {visibleFields.members !== false && <TableHead>Lead</TableHead>}
            {visibleFields.dueDate !== false && <TableHead>Due Date</TableHead>}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <ProjectRow key={project.id} project={project} visibleFields={visibleFields} />
          ))}
        </TableBody>
      </Table>
      <AddProjectDialog>
        <button className="flex w-full items-center gap-2 border-t border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent/50">
          <Plus className="h-4 w-4" />
          Add Projects
        </button>
      </AddProjectDialog>
    </div>
  );
}
