import type { Task, Project, Priority, Status, Member, Label, Activity, TaskDetail, Comment } from "./types";

export function toBackendPriority(p: Priority): string {
  return p.replace("-", "_");
}

export function toFrontendPriority(p: string): Priority {
  return p.replace("_", "-") as Priority;
}

export function toBackendStatus(s: Status): string {
  return s.replace("-", "_");
}

export function toFrontendStatus(s: string): Status {
  return s.replace("_", "-") as Status;
}

export function adaptUserToMember(u: any): Member {
  if (!u) return { id: "deleted", name: "Deleted User" };
  return { id: u.id, name: u.name, avatarUrl: u.avatarUrl };
}

export function adaptTask(t: any): Task {
  const members = t.members?.map((m: any) => adaptUserToMember(m.user)) || [];
  const labels: Label[] = t.tag
    ? t.tag.split(",").filter(Boolean).map((raw: string) => {
        const trimmed = raw.trim();
        return { id: trimmed, name: trimmed };
      })
    : [];

  return {
    id: t.id,
    projectId: t.projectId,
    parentTaskId: t.parentTaskId,
    title: t.title,
    description: t.description,
    summary: t.summary,
    reporterId: t.reporterId,
    createdById: t.createdById, // <-- Added createdById mapping
    dateRangeStart: t.dateRangeStart,
    dateRangeEnd: t.dateRangeEnd,
    attachments: t.attachments?.map((a: any) => ({ 
      id: a.id, 
      name: a.name, 
      url: a.url.startsWith("/uploads") ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}${a.url}` : a.url, 
      type: a.type, 
      createdAt: a.createdAt 
    })) || [],
    status: toFrontendStatus(t.status),
    priority: toFrontendPriority(t.priority),
    members,
    dueDate: t.dueDate,
    labels,
    isLocked: t.isLocked,
    watcherIds: t.watchers?.map((w: any) => w.userId) || [],
  };
}

export function adaptTaskDetail(t: any): TaskDetail {
  const base = adaptTask(t);
  return {
    ...base,
    properties: {
      assignee: base.members[0] || { id: "unassigned", name: "Unassigned" },
      dueDate: t.dueDate,
    },
    subtasks: t.subtasks?.map(adaptTask) || [],
    reporter: adaptUserToMember(t.reporter),
    dateRange: { start: t.dateRangeStart, end: t.dateRangeEnd },
    activities:
      t.activities?.map((a: any) => ({
        id: a.id,
        actor: adaptUserToMember(a.actor),
        action: a.action,
        target: a.target,
        timestamp: a.createdAt,
      })) || [],
    comments: [],
  };
}

export function adaptProject(p: any): Project {
  return {
    id: p.id,
    name: p.name,
    priority: toFrontendPriority(p.priority),
    lead: adaptUserToMember(p.owner),
    dueDate: p.dueDate,
    members: p.members?.map((m: any) => adaptUserToMember(m.user)) || [],
  };
}

export function adaptComment(c: any): Comment {
  const reactions: Record<string, string[]> = {};
  if (c.reactions) {
    c.reactions.forEach((r: any) => {
      if (!reactions[r.emoji]) reactions[r.emoji] = [];
      reactions[r.emoji].push(r.userId);
    });
  }
  return {
    id: c.id,
    author: adaptUserToMember(c.author),
    timestamp: c.createdAt,
    text: c.text,
    reactions,
    pinned: !!c.pinnedAt,
  };
}
