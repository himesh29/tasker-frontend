"use client";

import { useState } from "react";
import { Send, SmilePlus, MoreHorizontal, Pencil, Trash2, Pin, PinOff } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Comment } from "@/lib/types";

const ALL_EMOJIS = ["👍", "❤️", "🎉", "🤔", "👀", "🚀", "😂", "🔥", "🙌", "💡", "✅", "💯"];

function CommentItem({
  comment,
  isPinned,
  currentUserId,
  onEdit,
  onDelete,
  onReact,
  onUnreact,
  onPin,
}: {
  comment: Comment;
  isPinned: boolean;
  currentUserId: string;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onReact: (id: string, emoji: string) => void;
  onUnreact: (id: string, emoji: string) => void;
  onPin: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [expanded, setExpanded] = useState(false);

  const isLong = comment.text.length > 150;
  const displayText = isLong && !expanded ? comment.text.slice(0, 150) + "..." : comment.text;

  function handleSave() {
    if (editText.trim()) {
      onEdit(comment.id, editText.trim());
      setIsEditing(false);
    }
  }

  // Determine which emojis the current user has reacted with
  const currentUserReactions = Object.keys(comment.reactions || {})
    .filter(emoji => comment.reactions?.[emoji]?.includes(currentUserId) || false);

  function handleReaction(emoji: string) {
    if (currentUserReactions.includes(emoji)) {
      onUnreact(comment.id, emoji);
    } else {
      onReact(comment.id, emoji);
    }
  }

  return (
    <div className={`flex flex-col gap-2 rounded-lg border p-3 transition-colors ${isPinned ? "bg-accent/20 border-primary/30" : "border-border"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {comment.author && (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {comment.author.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <span className="text-sm font-medium">{comment.author?.name || "Deleted User"}</span>
          <span className="text-xs text-muted-foreground">{new Date(comment.timestamp).toLocaleDateString()}</span>
          {isPinned && <Pin className="h-3 w-3 text-primary ml-1" />}
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPin(comment.id)}>
                {isPinned ? <PinOff className="h-3.5 w-3.5 mr-1.5" /> : <Pin className="h-3.5 w-3.5 mr-1.5" />}
                {isPinned ? "Unpin" : "Pin to top"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(comment.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isEditing ? (
        <div className="flex items-center gap-2 mt-1">
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") {
                setIsEditing(false);
                setEditText(comment.text);
              }
            }}
            autoFocus
            className="flex-1 h-8 text-sm"
          />
          <Button size="sm" onClick={handleSave} className="h-8">
            Save
          </Button>
        </div>
      ) : (
        <div className="text-sm text-foreground/90 leading-relaxed mt-0.5">
          {displayText}
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-2 text-xs font-medium text-primary hover:underline"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-1 mt-1">
        {Object.entries(comment.reactions || {}).map(([emoji, users]) => (
          <button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs border transition-colors ${
              users.includes(currentUserId)
                ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400"
                : "bg-background border-border hover:bg-accent"
            }`}
          >
            {emoji} {users.length}
          </button>
        ))}
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center justify-center rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
              <SmilePlus className="h-3.5 w-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="grid grid-cols-4 gap-1">
              {ALL_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  className="rounded-md p-1.5 text-lg hover:bg-accent transition-colors flex items-center justify-center"
                  onClick={() => handleReaction(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

export function CommentsSection({
  comments,
  currentUserId,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onReact,
  onUnreact,
  onPin,
}: {
  comments: Comment[];
  currentUserId: string;
  onAddComment: (text: string) => void;
  onEditComment: (id: string, text: string) => void;
  onDeleteComment: (id: string) => void;
  onReact: (id: string, emoji: string) => void;
  onUnreact: (id: string, emoji: string) => void;
  onPin: (id: string) => void;
}) {
  const [newComment, setNewComment] = useState("");
  // We keep a local pinnedId to highlight, but actual pin state comes from comment.pinned (from API)
  // The parent handles the mutation; we just need to know which comment is pinned for UI.
  // We'll compute pinned comments from the 'pinned' field on each comment.
  // No local state needed.

  function handleAddComment() {
    if (!newComment.trim()) return;
    onAddComment(newComment);
    setNewComment("");
  }

  // Sort: pinned comments first (those with pinned === true)
  const sortedComments = [...comments].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium">Comments</h2>

      {sortedComments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          isPinned={!!comment.pinned}
          currentUserId={currentUserId}
          onEdit={onEditComment}
          onDelete={onDeleteComment}
          onReact={onReact}
          onUnreact={onUnreact}
          onPin={onPin}
        />
      ))}

      <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 mt-2 shadow-sm focus-within:ring-1 focus-within:ring-ring">
        <Input
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
          className="border-none px-0 shadow-none focus-visible:ring-0 bg-transparent h-8"
        />
        <Send
          className="h-4 w-4 shrink-0 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
          onClick={handleAddComment}
        />
      </div>
    </div>
  );
}
