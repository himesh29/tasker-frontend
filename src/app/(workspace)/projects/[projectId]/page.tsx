"use client";

import { useParams } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { ListView } from "@/components/tasks/list-view";
import { BoardView } from "@/components/tasks/board-view";
import { useTasks } from "@/hooks/use-tasks";
import { useProjectDetail } from "@/hooks/use-project-detail";
import { useUsers } from "@/hooks/use-users";
import { useAuth } from "@/providers/auth-provider";
import { useState, useMemo } from "react";
import { PriorityBadge } from "@/components/tasks/shared/priority-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarDays, User, ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import type { FieldId } from "@/components/shared/fields-popover";
import type { FilterState } from "@/components/shared/filter-popover";
import type { Task, Member, Label } from "@/lib/types";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { user } = useAuth();
  const { tasks } = useTasks(projectId);
  const { project, isLoading, addMember, removeMember } = useProjectDetail(projectId);
  const { users } = useUsers();

  const [view, setView] = useState<"list" | "board">("list");
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
  const [memberSearch, setMemberSearch] = useState("");
  const [isMemberPopoverOpen, setIsMemberPopoverOpen] = useState(false);

  // FIXED: using user?.id
  const isOwner = user?.id === project?.lead?.id;

  const projectTasks = useMemo(() => {
    let filtered = tasks.filter((t: Task) => t.projectId === projectId);
    if (search) {
      filtered = filtered.filter((t: Task) =>
        t.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filters.priority) {
      filtered = filtered.filter((t: Task) => t.priority === filters.priority);
    }
    if (filters.status) {
      filtered = filtered.filter((t: Task) => t.status === filters.status);
    }
    if (filters.members.length > 0) {
      filtered = filtered.filter((t: Task) => 
        t.members.some((m: Member) => filters.members.includes(m.id))
      );
    }
    if (filters.labels.length > 0) {
      filtered = filtered.filter((t: Task) => 
        t.labels.some((l: Label) => filters.labels.includes(l.id))
      );
    }
    return filtered;
  }, [tasks, search, filters, projectId]);

  if (isLoading || !project) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const formattedDate = project.dueDate
    ? new Date(project.dueDate).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  const currentMembers = project.members || [];
  const availableUsers = users.filter(
    (u: Member) => !currentMembers.some((m: Member) => m.id === u.id) && u.id !== project.lead.id
  );
  const filteredUsers = availableUsers.filter((u: Member) =>
    u.name.toLowerCase().includes(memberSearch.toLowerCase())
  );

  function handleAddMember(userId: string) {
    addMember.mutate(userId);
    setMemberSearch("");
    setIsMemberPopoverOpen(false);
  }

  function handleRemoveMember(userId: string) {
    removeMember.mutate(userId);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/projects" className="hover:underline flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            Projects
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{project.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{project.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <PriorityBadge priority={project.priority} />
              </span>
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {project.lead?.name || "Unassigned"}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Members section */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {currentMembers.map((member: Member) => (
                <div key={member.id} className="relative group">
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarFallback className="text-xs">
                      {member.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isOwner && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="absolute -top-1 -right-1 hidden group-hover:flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {isOwner && (
              <Popover open={isMemberPopoverOpen} onOpenChange={setIsMemberPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Plus className="h-3.5 w-3.5" />
                    Add member
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="end">
                  <Input
                    placeholder="Search users..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="mb-2"
                    autoFocus
                  />
                  {filteredUsers.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-2">No users available</p>
                  ) : (
                    <div className="flex flex-col gap-0.5">
                      {filteredUsers.map((u: Member) => (
                        <button
                          key={u.id}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent w-full text-left"
                          onClick={() => handleAddMember(u.id)}
                        >
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[10px]">
                              {u.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {u.name}
                        </button>
                      ))}
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </div>

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
        projectId={projectId}
      />

      <div className="flex-1 overflow-x-auto py-2 pl-4 pr-8">
        <h2 className="mb-4 text-lg font-semibold">Tasks</h2>
        {view === "board" ? (
          <BoardView tasks={projectTasks} projectId={projectId} />
        ) : (
          <ListView tasks={projectTasks} visibleFields={visibleFields} projectId={projectId} />
        )}
      </div>
    </div>
  );
}
