"use client";

import { Plus, Settings, ChevronDown, CalendarDays, UserPlus, X, Tag, UserCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PriorityBadge } from "../shared/priority-badge";
import { useState } from "react";
import type { Priority, Status, Member, Label } from "@/lib/types";

const PRIORITY_OPTIONS: Priority[] = ["no-priority", "urgent", "high", "medium", "low"];

const STATUS_OPTIONS: { id: Status; label: string; color: string }[] = [
  { id: "todo", label: "To Do", color: "bg-orange-500" },
  { id: "doing", label: "Doing", color: "bg-blue-500" },
  { id: "completed", label: "Completed", color: "bg-green-500" },
  { id: "on-hold", label: "On Hold", color: "bg-gray-400" },
];

export function DetailsPanel({
  availableUsers, // <-- Accept availableUsers
  status,
  priority,
  reporter,
  members,
  labels,
  dateRange,
  onStatusChange,
  onPriorityChange,
  onReporterChange,
  onAddMember,
  onAddLabel,
  onRemoveLabel,
  onDateRangeChange,
}: {
  availableUsers: Member[];
  status: Status;
  priority: Priority;
  reporter?: Member;
  members: Member[];
  labels: Label[];
  dateRange?: { start?: string; end?: string };
  onStatusChange: (status: Status) => void;
  onPriorityChange: (priority: Priority) => void;
  onReporterChange: (member: Member | null) => void;
  onAddMember: (member: Member) => void;
  onAddLabel: (label: Label) => void;
  onRemoveLabel: (labelId: string) => void;
  onDateRangeChange: (range: { start?: string; end?: string }) => void;
}) {
  const [memberSearch, setMemberSearch] = useState("");
  const [labelInput, setLabelInput] = useState("");

  // Use availableUsers instead of global users
  const filteredMembers = availableUsers.filter(
    (m: Member) =>
      !members.some((existing) => existing.id === m.id) &&
      m.name.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const currentStatus = STATUS_OPTIONS.find((s) => s.id === status);
  const startDate = dateRange?.start ? new Date(dateRange.start) : undefined;
  const endDate = dateRange?.end ? new Date(dateRange.end) : undefined;

  function handleAddLabel() {
    const trimmed = labelInput.trim();
    if (!trimmed) return;
    if (!labels.some((l) => l.name.toLowerCase() === trimmed.toLowerCase())) {
      onAddLabel({ id: trimmed, name: trimmed });
    }
    setLabelInput("");
  }

  return (
    <div className="w-full rounded-lg border border-border bg-background shadow-sm p-4">
      <Collapsible defaultOpen>
        <div className="mb-4 flex items-center justify-between">
          <CollapsibleTrigger className="flex items-center gap-1.5 text-sm font-medium group outline-none">
            <ChevronDown className="h-4 w-4 transition-transform group-data-[state=closed]:-rotate-90" />
            Details
          </CollapsibleTrigger>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CollapsibleContent>
          <div className="flex flex-col gap-3.5 text-sm pt-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-accent transition-colors outline-none">
                  <span className={`h-2 w-2 rounded-full ${currentStatus?.color}`} />
                  <span>{currentStatus?.label}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {STATUS_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.id}
                      onClick={() => onStatusChange(option.id)}
                      className="flex items-center gap-2"
                    >
                      <span className={`h-2 w-2 rounded-full ${option.color}`} />
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Priority</span>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 rounded-md px-2 py-1.5 hover:bg-accent transition-colors outline-none">
                  <PriorityBadge priority={priority} />
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {PRIORITY_OPTIONS.map((option) => (
                    <DropdownMenuItem key={option} onClick={() => onPriorityChange(option)}>
                      <PriorityBadge priority={option} />
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Members</span>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 outline-none">
                    <UserPlus className="h-3.5 w-3.5" />
                    Add members
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="end">
                  <Input
                    placeholder="Search members..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="mb-2"
                    autoFocus
                  />
                  <div className="flex flex-col gap-0.5">
                    {filteredMembers.map((m: Member) => (
                      <button
                        key={m.id}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent text-left"
                        onClick={() => {
                          onAddMember(m);
                          setMemberSearch("");
                        }}
                      >
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[10px]">
                            {m.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {m.name}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {members.length > 0 && (
              <div className="flex -space-x-2 justify-end">
                {members.map((m: Member, idx: number) => (
                  <Avatar
                    key={m.id}
                    className="h-6 w-6 border-2 border-background shadow-sm"
                    style={{ zIndex: members.length - idx }}
                  >
                    <AvatarFallback className="text-[10px]">
                      {m.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Dates</span>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1.5 text-xs hover:bg-accent px-1 py-1 rounded-md transition-colors outline-none">
                    <span className="flex items-center gap-1 rounded-md border border-border px-2 py-1 bg-background">
                      <CalendarDays className="h-3 w-3" />
                      {startDate
                        ? startDate.toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric" })
                        : "Start"}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="rounded-md border border-border px-2 py-1 bg-background">
                      {endDate
                        ? endDate.toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric" })
                        : "End"}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={{ from: startDate, to: endDate }}
                    onSelect={(range) => {
                      onDateRangeChange({
                        start: range?.from?.toISOString(),
                        end: range?.to?.toISOString(),
                      });
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Labels</span>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add label..."
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddLabel()}
                  className="h-7 w-32 text-xs"
                />
                <Button size="sm" className="h-7 px-2" onClick={handleAddLabel}>
                  Add
                </Button>
              </div>
            </div>

            {labels.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-end mt-1">
                {labels.map((l: Label) => (
                  <span
                    key={l.id}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs"
                  >
                    {l.name}
                    <button
                      onClick={() => onRemoveLabel(l.id)}
                      className="rounded-full p-0.5 hover:bg-muted-foreground/20 text-muted-foreground outline-none"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              <span className="text-muted-foreground">Reporter</span>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-accent transition-colors outline-none">
                  {reporter ? (
                    <>
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[10px]">
                          {reporter.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{reporter.name}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground flex items-center gap-1">
                      <UserCircle className="h-3.5 w-3.5" />
                      Select reporter
                    </span>
                  )}
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onReporterChange(null)} className="text-muted-foreground">
                    <UserCircle className="h-3.5 w-3.5 mr-1.5" />
                    No reporter
                  </DropdownMenuItem>
                  {/* Replaced users.map with availableUsers.map */}
                  {availableUsers.map((m: Member) => (
                    <DropdownMenuItem key={m.id} onClick={() => onReporterChange(m)} className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[10px]">
                          {m.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {m.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
