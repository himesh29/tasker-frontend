"use client";

import { useState } from "react";
import { Paperclip, X, Link as LinkIcon, Upload, Plus, Check, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MemberAvatar } from "../shared/member-avatar";
import { DueDatePill } from "../shared/due-date-pill";
import type { Member, Label, Attachment } from "@/lib/types";

export function TaskProperties({
  taskId,
  availableUsers,
  assignee,
  dueDate,
  labels,
  members,
  attachments,
  onAddMember,
  onRemoveMember,
  onAddAttachment,
  onAddLink,
  onRemoveAttachment,
  onAddLabel,
  onRemoveLabel,
  onAssigneeChange,
  onDueDateChange,
}: {
  taskId: string;
  availableUsers: Member[];
  assignee: Member;
  dueDate?: string;
  labels: Label[];
  members: Member[];
  attachments: Attachment[];
  onAddMember: (member: Member) => void;
  onRemoveMember?: (memberId: string) => void;
  onAddAttachment: (file: File) => void;
  onAddLink?: (url: string, name: string) => void;
  onRemoveAttachment?: (id: string) => void;
  onAddLabel: (label: Label) => void;
  onRemoveLabel: (labelId: string) => void;
  onAssigneeChange?: (member: Member) => void;
  onDueDateChange?: (date: string | null) => void;
}) {
  const [memberSearch, setMemberSearch] = useState("");
  const [labelInput, setLabelInput] = useState("");
  // FIX (#5): label entry used to be a permanently-visible text input +
  // "Add" button taking up row space at all times. Now it's a single "+"
  // icon; clicking it reveals the inline field, and a checkmark (in place
  // of the "+") confirms/commits the label.
  const [addingLabel, setAddingLabel] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkName, setLinkName] = useState("");
  const [assigneePopoverOpen, setAssigneePopoverOpen] = useState(false);

  const filteredMembers = availableUsers.filter(
    (m: Member) =>
      !members.some((existing) => existing.id === m.id) &&
      m.name.toLowerCase().includes(memberSearch.toLowerCase())
  );

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onAddAttachment(file);
      e.target.value = "";
    }
  }

  function handleAddLink() {
    if (!linkUrl.trim()) return;
    onAddLink?.(linkUrl.trim(), linkName.trim());
    setLinkUrl("");
    setLinkName("");
    setLinkDialogOpen(false);
  }

  function handleAddLabel() {
    const trimmed = labelInput.trim();
    if (!trimmed) {
      setAddingLabel(false);
      return;
    }
    if (!labels.some((l) => l.name.toLowerCase() === trimmed.toLowerCase())) {
      onAddLabel({ id: trimmed, name: trimmed });
    }
    setLabelInput("");
    setAddingLabel(false);
  }

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex items-center gap-4">
        <span className="w-24 shrink-0 text-muted-foreground">Assignee</span>
        <div className="flex items-center gap-2 flex-wrap">
          <Popover open={assigneePopoverOpen} onOpenChange={setAssigneePopoverOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1 hover:bg-accent transition-colors outline-none">
                <MemberAvatar member={assignee} />
                <span>{assignee.name}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start">
              <div className="text-xs font-medium text-muted-foreground px-2 py-1">Change assignee</div>
              <div className="flex flex-col gap-0.5 mt-1">
                {availableUsers.map((m: Member) => (
                  <button
                    key={m.id}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent text-left"
                    onClick={() => {
                      onAssigneeChange?.(m);
                      setAssigneePopoverOpen(false);
                    }}
                  >
                    <MemberAvatar member={m} />
                    {m.name}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger className="outline-none hover:opacity-80 transition-opacity">
              {dueDate ? (
                <DueDatePill date={dueDate} />
              ) : (
                <span className="flex items-center gap-1 rounded-md border border-dashed border-border px-2 py-1 text-xs text-muted-foreground hover:bg-accent">
                  Set Due Date
                </span>
              )}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dueDate ? new Date(dueDate) : undefined}
                onSelect={(date) => onDueDateChange?.(date ? date.toISOString() : null)}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="w-24 shrink-0 text-muted-foreground">Members</span>
        <div className="flex items-center gap-2 flex-wrap">
          {members.map((member: Member) => (
            <Badge key={member.id} variant="secondary" className="gap-1.5 rounded-md font-normal pr-1">
              <MemberAvatar member={member} />
              {member.name}
              {onRemoveMember && (
                <button
                  onClick={() => onRemoveMember(member.id)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 outline-none"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs transition-colors outline-none">
                <UserPlus className="h-3.5 w-3.5" />
                Add members
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start">
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
                    <MemberAvatar member={m} />
                    {m.name}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="w-24 shrink-0 text-muted-foreground">Labels</span>
        <div className="flex items-center gap-2 flex-wrap">
          {labels.map((label: Label) => (
            <Badge key={label.id} variant="outline" className="gap-1 rounded-md font-normal pr-1">
              <span className="h-2 w-2 rounded-full bg-primary" />
              {label.name}
              <button
                onClick={() => onRemoveLabel(label.id)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 outline-none"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {addingLabel ? (
            <div className="flex items-center gap-1">
              <Input
                placeholder="Label name"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddLabel();
                  if (e.key === "Escape") {
                    setLabelInput("");
                    setAddingLabel(false);
                  }
                }}
                className="h-7 w-28 text-xs"
                autoFocus
                onBlur={() => {
                  // commit if there's text, otherwise just close
                  if (labelInput.trim()) handleAddLabel();
                  else setAddingLabel(false);
                }}
              />
              <button
                onClick={handleAddLabel}
                title="Confirm label"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-foreground hover:bg-accent outline-none"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingLabel(true)}
              title="Add label"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground hover:text-foreground hover:bg-accent outline-none"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-start gap-4">
        <span className="w-24 shrink-0 text-muted-foreground">Resources</span>
        <div className="flex flex-col gap-2">
          {attachments.map((att: Attachment) => (
            <div key={att.id} className="flex items-center justify-between gap-2 group w-full max-w-[300px]">
              <a
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline truncate"
              >
                <Paperclip className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{att.name}</span>
              </a>
              {onRemoveAttachment && (
                <button
                  onClick={() => onRemoveAttachment(att.id)}
                  className="hidden group-hover:flex text-muted-foreground hover:text-destructive shrink-0 ml-2"
                  title="Remove attachment"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          <div className="flex items-center gap-2 mt-1">
            <label className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm transition-colors cursor-pointer outline-none">
              <Paperclip className="h-3.5 w-3.5" />
              Upload file
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            <Popover open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm transition-colors outline-none">
                  <LinkIcon className="h-3.5 w-3.5" />
                  Add link
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="start">
                <Input
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="mb-2"
                  autoFocus
                />
                <Input
                  placeholder="Display name (optional)"
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  className="mb-2"
                  onKeyDown={(e) => e.key === "Enter" && handleAddLink()}
                />
                <Button size="sm" onClick={handleAddLink} className="w-full">
                  Add Link
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
}
