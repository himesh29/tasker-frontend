"use client";

import { useState } from "react";
import {
  Circle,
  SignalHigh,
  Minus,
  Users,
  CalendarDays,
  UsersRound,
  Tag,
  UserCircle,
  Check,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useUsers } from "@/hooks/use-users";
import type { Priority, Status } from "@/lib/types";

const PRIORITY_OPTIONS: { id: Priority; label: string; color: string; icon: React.ElementType }[] = [
  { id: "no-priority", label: "No Priority", color: "text-muted-foreground", icon: Minus },
  { id: "urgent", label: "Urgent", color: "text-red-600", icon: SignalHigh },
  { id: "high", label: "High", color: "text-orange-500", icon: SignalHigh },
  { id: "medium", label: "Medium", color: "text-yellow-600", icon: SignalHigh },
  { id: "low", label: "Low", color: "text-muted-foreground", icon: SignalHigh },
];

const STATUS_OPTIONS: { id: Status; label: string; dotColor: string }[] = [
  { id: "todo", label: "To Do", dotColor: "bg-orange-500" },
  { id: "doing", label: "Doing", dotColor: "bg-blue-500" },
  { id: "completed", label: "Completed", dotColor: "bg-green-500" },
  { id: "on-hold", label: "On Hold", dotColor: "bg-gray-400" },
];

export interface FilterState {
  status: Status | null;
  priority: Priority | null;
  members: string[];
  dueDate: string | null;
  labels: string[];
  reporter: string | null;
}

interface FilterPopoverProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const FILTER_CATEGORIES = [
  { id: "status", label: "Status", icon: Circle },
  { id: "priority", label: "Priority", icon: SignalHigh },
  { id: "members", label: "Members", icon: Users },
  { id: "dueDate", label: "Due Date", icon: CalendarDays },
  { id: "teams", label: "Teams", icon: UsersRound },
  { id: "labels", label: "Labels", icon: Tag },
  { id: "reporter", label: "Reporter", icon: UserCircle },
] as const;

export function FilterPopover({ filters, onFilterChange }: FilterPopoverProps) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { users } = useUsers();
  const [labelInput, setLabelInput] = useState("");

  function updateFilter<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    onFilterChange({ ...filters, [key]: value });
  }

  const activeCount = [
    filters.status,
    filters.priority,
    filters.members.length > 0,
    filters.dueDate,
    filters.labels.length > 0,
    filters.reporter,
  ].filter(Boolean).length;

  function handleCategoryClick(categoryId: string) {
    setOpenCategory(openCategory === categoryId ? null : categoryId);
  }

  function closeSubMenus() {
    setOpenCategory(null);
  }

  function handleAddLabel() {
    const trimmed = labelInput.trim();
    if (!trimmed) return;
    if (!filters.labels.includes(trimmed)) {
      updateFilter("labels", [...filters.labels, trimmed]);
    }
    setLabelInput("");
  }

  function handleRemoveLabel(label: string) {
    updateFilter("labels", filters.labels.filter((l) => l !== label));
  }

  return (
    <Popover
      open={popoverOpen}
      onOpenChange={(open) => {
        setPopoverOpen(open);
        if (!open) setOpenCategory(null);
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Filter className="h-4 w-4" />
          {activeCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-0 relative" sideOffset={4}>
        <div className="p-1">
          {FILTER_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <category.icon className="h-4 w-4 text-muted-foreground" />
                <span>{category.label}</span>
              </div>
              {/* FIX (#8): was ChevronLeft ("<"), now ChevronRight (">") */}
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {openCategory === "priority" && (
          <div className="absolute top-0 right-full mr-1 w-48 rounded-lg border bg-popover shadow-md z-50">
            <div className="p-1">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Priority</div>
              <button
                onClick={() => {
                  updateFilter("priority", null);
                  closeSubMenus();
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent",
                  !filters.priority && "bg-accent"
                )}
              >
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Minus className="h-3.5 w-3.5" />
                  All Priorities
                </span>
                {!filters.priority && <Check className="h-4 w-4" />}
              </button>
              {PRIORITY_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isActive = filters.priority === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      updateFilter("priority", isActive ? null : option.id);
                      closeSubMenus();
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent",
                      option.color,
                      isActive && "bg-accent"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5" />
                      {option.label}
                    </span>
                    {isActive && <Check className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {openCategory === "status" && (
          <div className="absolute top-0 right-full mr-1 w-48 rounded-lg border bg-popover shadow-md z-50">
            <div className="p-1">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Status</div>
              <button
                onClick={() => {
                  updateFilter("status", null);
                  closeSubMenus();
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent",
                  !filters.status && "bg-accent"
                )}
              >
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Circle className="h-3.5 w-3.5" />
                  All Statuses
                </span>
                {!filters.status && <Check className="h-4 w-4" />}
              </button>
              {STATUS_OPTIONS.map((option) => {
                const isActive = filters.status === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      updateFilter("status", isActive ? null : option.id);
                      closeSubMenus();
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent",
                      isActive && "bg-accent"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full", option.dotColor)} />
                      {option.label}
                    </span>
                    {isActive && <Check className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {openCategory === "members" && (
          <div className="absolute top-0 right-full mr-1 w-48 rounded-lg border bg-popover shadow-md z-50 max-h-64 overflow-y-auto">
            <div className="p-1">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Members</div>
              {users.map((member) => {
                const isActive = filters.members.includes(member.id);
                return (
                  <button
                    key={member.id}
                    onClick={() => {
                      const next = isActive
                        ? filters.members.filter((id) => id !== member.id)
                        : [...filters.members, member.id];
                      updateFilter("members", next);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent",
                      isActive && "bg-accent"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
                        {member.name.slice(0, 2).toUpperCase()}
                      </span>
                      {member.name}
                    </span>
                    {isActive && <Check className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {openCategory === "labels" && (
          <div className="absolute top-0 right-full mr-1 w-48 rounded-lg border bg-popover shadow-md z-50">
            <div className="p-2">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Labels</div>
              <div className="flex items-center gap-1 mb-1">
                <Input
                  placeholder="Type label..."
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddLabel()}
                  className="h-7 text-sm"
                />
                <Button size="sm" className="h-7 px-2" onClick={handleAddLabel}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {filters.labels.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-0.5 rounded-md bg-accent px-2 py-0.5 text-xs"
                  >
                    {label}
                    <button
                      onClick={() => handleRemoveLabel(label)}
                      className="text-muted-foreground hover:text-foreground outline-none"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {filters.labels.length === 0 && (
                  <span className="text-xs text-muted-foreground">No labels selected</span>
                )}
              </div>
            </div>
          </div>
        )}

        {openCategory === "reporter" && (
          <div className="absolute top-0 right-full mr-1 w-48 rounded-lg border bg-popover shadow-md z-50 max-h-64 overflow-y-auto">
            <div className="p-1">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Reporter</div>
              <button
                onClick={() => {
                  updateFilter("reporter", null);
                  closeSubMenus();
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent",
                  !filters.reporter && "bg-accent"
                )}
              >
                <span className="flex items-center gap-2 text-muted-foreground">
                  <UserCircle className="h-3.5 w-3.5" />
                  All Reporters
                </span>
                {!filters.reporter && <Check className="h-4 w-4" />}
              </button>
              {users.map((reporter) => {
                const isActive = filters.reporter === reporter.id;
                return (
                  <button
                    key={reporter.id}
                    onClick={() => {
                      updateFilter("reporter", isActive ? null : reporter.id);
                      closeSubMenus();
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent",
                      isActive && "bg-accent"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
                        {reporter.name.slice(0, 2).toUpperCase()}
                      </span>
                      {reporter.name}
                    </span>
                    {isActive && <Check className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {openCategory === "dueDate" && (
          <div className="absolute top-0 right-full mr-1 w-48 rounded-lg border bg-popover shadow-md z-50">
            <div className="p-2">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Due Date</div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => {
                    updateFilter("dueDate", null);
                    closeSubMenus();
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent text-left",
                    !filters.dueDate && "bg-accent"
                  )}
                >
                  <span>Any time</span>
                  {!filters.dueDate && <Check className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => {
                    updateFilter("dueDate", "today");
                    closeSubMenus();
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent text-left",
                    filters.dueDate === "today" && "bg-accent"
                  )}
                >
                  <span>Today</span>
                  {filters.dueDate === "today" && <Check className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => {
                    updateFilter("dueDate", "week");
                    closeSubMenus();
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent text-left",
                    filters.dueDate === "week" && "bg-accent"
                  )}
                >
                  <span>This week</span>
                  {filters.dueDate === "week" && <Check className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => {
                    updateFilter("dueDate", "overdue");
                    closeSubMenus();
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent text-left",
                    filters.dueDate === "overdue" && "bg-accent"
                  )}
                >
                  <span>Overdue</span>
                  {filters.dueDate === "overdue" && <Check className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {openCategory === "teams" && (
          <div className="absolute top-0 right-full mr-1 w-48 rounded-lg border bg-popover shadow-md z-50">
            <div className="p-2">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Teams</div>
              <div className="text-xs text-muted-foreground px-2 py-4 text-center">
                Coming soon
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
