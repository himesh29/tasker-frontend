import type { Status, Priority } from "./types";

export const STATUS_COLUMNS: { id: Status; label: string }[] = [
  { id: "todo", label: "To Do" },
  { id: "doing", label: "Doing" },
  { id: "completed", label: "Completed" },
  { id: "on-hold", label: "On Hold" },
];

type PriorityConfig = { label: string; className: string };

export const PRIORITY_CONFIG: Record<Priority, PriorityConfig> = {
  "no-priority": { label: "No Priority", className: "text-muted-foreground" },
  low: { label: "Low", className: "text-muted-foreground" },
  medium: { label: "Medium", className: "text-orange-500" },
  high: { label: "High", className: "text-red-500" },
  urgent: { label: "Urgent", className: "text-red-600" },
};
