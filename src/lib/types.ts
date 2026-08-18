export type Priority = "no-priority" | "low" | "medium" | "high" | "urgent";

export type Status = "todo" | "doing" | "completed" | "on-hold";

export interface Member {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface Label {
  id: string;
  name: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: "file" | "link";
  createdAt: string;
}

export interface Task {
  id: string;
  projectId?: string;
  parentTaskId?: string;
  title: string;
  description?: string;
  summary?: string;
  reporterId?: string | null;
  createdById?: string; // FIX: was required (`createdById: string`); the backend
                         // sets this from the JWT and the frontend never has it
                         // at creation time (e.g. add-task-dialog, board-column,
                         // list-view, subtasks-table all build Task-shaped
                         // objects before the task exists on the server).
                         // Making it optional matches reality and doesn't
                         // require touching any of those components.
  dateRangeStart?: string;
  dateRangeEnd?: string;
  status: Status;
  priority: Priority;
  members: Member[];
  dueDate?: string;
  labels: Label[];
  attachments?: Attachment[];
  isLocked?: boolean;
  watcherIds?: string[];
}

export interface Project {
  id: string;
  name: string;
  priority: Priority;
  lead: Member;
  dueDate?: string;
  members?: Member[];
}

export interface Comment {
  id: string;
  author?: Member;
  timestamp: string;
  text: string;
  reactions?: Record<string, string[]>;
  pinned?: boolean;
}

export interface Activity {
  id: string;
  actor: Member;
  action: "created" | "updated" | "commented" | "status_changed" | "assigned" | "priority_changed" | "locked" | "unlocked" | "approved" | "rejected";
  target?: string;
  timestamp: string;
}

export interface TaskDetail extends Task {
  properties: {
    assignee: Member;
    dueDate?: string;
  };
  labels: Label[];
  subtasks: Task[];
  comments: Comment[];
  status: Status;
  reporter?: Member;
  dateRange?: { start?: string; end?: string };
  activities?: Activity[];
}

export type FieldId = "priority" | "members" | "dueDate" | "labels" | "status" | "reporter";
