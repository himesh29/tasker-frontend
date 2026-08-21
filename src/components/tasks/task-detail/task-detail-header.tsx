"use client";

import { useState } from "react";
import { Lock, Unlock, Eye, Share2, MoreHorizontal, PanelRight, UserCircle, Check, Copy, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Member } from "@/lib/types";

export function TaskDetailHeader({
  title,
  description,
  isLocked,
  isWatching,
  watcherCount,
  watchers,
  reporter,
  onToggleLock,
  onToggleWatch,
  onShare,
  onToggleRightPanel,
  onUpdateDescription,
}: {
  title: string;
  description?: string;
  isLocked?: boolean;
  isWatching?: boolean;
  watcherCount: number;
  watchers: Member[];
  reporter?: Member;
  onToggleLock: () => void;
  onToggleWatch: () => void;
  onShare: () => void;
  onToggleRightPanel: () => void;
  onUpdateDescription?: (newDescription: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState(description || "");

  function handleCopy() {
    onShare();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDescriptionBlur() {
    const trimmed = descriptionDraft.trim();
    if (trimmed !== description) {
      onUpdateDescription?.(trimmed);
    }
    setEditingDescription(false);
  }

  function handleDescriptionKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setDescriptionDraft(description || "");
      setEditingDescription(false);
    }
    if (e.key === "Enter" && e.shiftKey) {
      // allow multiline; pressing Shift+Enter will insert newline
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleDescriptionBlur();
    }
  }

  return (
    <div className="flex flex-col-reverse md:flex-row items-start justify-between gap-4">
      <div className="flex-1 w-full min-w-0">
        <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">{title}</h1>
        {editingDescription ? (
          <textarea
            value={descriptionDraft}
            onChange={(e) => setDescriptionDraft(e.target.value)}
            onBlur={handleDescriptionBlur}
            onKeyDown={handleDescriptionKeyDown}
            className="mt-1.5 w-full rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground resize-y min-h-[60px] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            autoFocus
          />
        ) : (
          <p
            className="mt-1.5 text-sm text-muted-foreground leading-relaxed cursor-pointer hover:bg-accent/20 p-1 rounded transition-colors break-words"
            onClick={() => {
              setDescriptionDraft(description || "");
              setEditingDescription(true);
            }}
          >
            {description || "Add a description..."}
          </p>
        )}
        {reporter && (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <UserCircle className="h-4 w-4" />
            <span>Reported by</span>
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[10px]">
                {reporter.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-foreground">{reporter.name}</span>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
        <Button
          variant="outline"
          size="icon"
          className={`h-9 w-9 shrink-0 ${isLocked ? "text-amber-600 border-amber-200 bg-amber-50" : ""}`}
          onClick={onToggleLock}
          title={isLocked ? "Unlock task" : "Lock task"}
        >
          {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`h-9 gap-1.5 px-3 shrink-0 ${isWatching ? "text-blue-600 border-blue-200 bg-blue-50" : ""}`}
              title="View watchers"
            >
              <Eye className="h-4 w-4" />
              <span className="text-xs font-medium">{watcherCount}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xs">
            <DialogHeader>
              <DialogTitle>Watchers</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3 py-2">
              {watchers.length > 0 ? (
                watchers.map((viewer) => (
                  <div key={viewer.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs font-medium">
                        {viewer.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{viewer.name}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No watchers yet</p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={handleCopy}
          title="Copy link"
        >
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Share2 className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onToggleWatch}>
              {isWatching ? <EyeOff className="h-4 w-4 mr-1.5" /> : <Eye className="h-4 w-4 mr-1.5" />}
              {isWatching ? "Stop watching" : "Watch task"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 mr-1.5 text-green-600" /> : <Copy className="h-4 w-4 mr-1.5" />}
              {copied ? "Copied!" : "Copy link"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-5 w-px bg-border mx-1 shrink-0"></div>

        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={onToggleRightPanel}
          title="Toggle side panel"
        >
          <PanelRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
