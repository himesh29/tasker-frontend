"use client";

import { Columns3, List, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ALL_FIELDS = [
  { id: "priority", label: "Priority" },
  { id: "members", label: "Members" },
  { id: "dueDate", label: "Due Date" },
  { id: "labels", label: "Labels" },
  { id: "status", label: "Status" },
  { id: "reporter", label: "Reporter" },
] as const;

export type FieldId = (typeof ALL_FIELDS)[number]["id"];

export function FieldsPopover({
  view,
  onViewChange,
  visibleFields,
  onVisibleFieldsChange,
  showViewToggle = true,
}: {
  view?: "list" | "board";
  onViewChange?: (value: "list" | "board") => void;
  visibleFields: Record<FieldId, boolean>;
  onVisibleFieldsChange: (fields: Record<FieldId, boolean>) => void;
  showViewToggle?: boolean;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Columns3 className="h-4 w-4" />
          Fields
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        {showViewToggle && onViewChange && (
          <Tabs
            value={view}
            onValueChange={(v) => onViewChange(v as "list" | "board")}
          >
            <TabsList className="w-full shadow-sm">
              <TabsTrigger value="list" className="gap-1.5">
                <List className="h-4 w-4" />
                List
              </TabsTrigger>
              <TabsTrigger value="board" className="gap-1.5">
                <LayoutGrid className="h-4 w-4" />
                Board
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <div className={`flex flex-col gap-1 ${showViewToggle ? "mt-3" : ""}`}>
          {ALL_FIELDS.map((field) => (
            <label
              key={field.id}
              className="flex items-center justify-between rounded-md px-1 py-1.5 text-sm text-foreground hover:bg-accent cursor-pointer"
            >
              {field.label}
              <Checkbox
                checked={visibleFields[field.id] ?? false}
                onCheckedChange={(value) =>
                  onVisibleFieldsChange({
                    ...visibleFields,
                    [field.id]: !!value,
                  })
                }
              />
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
