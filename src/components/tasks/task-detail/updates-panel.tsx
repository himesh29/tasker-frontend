"use client";

import { useState } from "react";
import { ChevronDown, User, MessageSquare, Flag, Lock, Unlock, ArrowRightLeft, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Activity } from "@/lib/types";

const ACTION_ICONS: Record<string, React.ElementType> = {
  created: Plus,
  updated: Pencil,
  commented: MessageSquare,
  status_changed: ArrowRightLeft,
  assigned: User,
  priority_changed: Flag,
  locked: Lock,
  unlocked: Unlock,
};

const ACTION_LABELS: Record<string, string> = {
  created: "created this task",
  updated: "updated",
  commented: "commented",
  status_changed: "changed status",
  assigned: "assigned",
  priority_changed: "changed priority",
  locked: "locked this task",
  unlocked: "unlocked this task",
};

// Only 3 items per page now
const ITEMS_PER_PAGE = 3;

export function UpdatesPanel({ activities }: { activities: Activity[] }) {
  const [page, setPage] = useState(1);
  
  const totalPages = Math.ceil(activities.length / ITEMS_PER_PAGE);
  const currentActivities = activities.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="w-full rounded-lg border border-border bg-background shadow-sm p-4">
      <Collapsible defaultOpen>
        <div className="mb-4 flex items-center justify-between">
          <CollapsibleTrigger className="flex items-center gap-1.5 text-sm font-medium group outline-none">
            <ChevronDown className="h-4 w-4 transition-transform group-data-[state=closed]:-rotate-90" />
            Updates
          </CollapsibleTrigger>
          {activities.length > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {activities.length}
            </span>
          )}
        </div>

        <CollapsibleContent>
          <div className="flex flex-col gap-4 pl-1">
            {activities.length === 0 && (
              <p className="text-sm text-muted-foreground">No updates yet.</p>
            )}
            
            {currentActivities.map((activity, index) => {
              const Icon = ACTION_ICONS[activity.action] || User;
              const isLatest = page === 1 && index === 0;
              return (
                <div 
                  key={activity.id} 
                  className={`flex items-start gap-3 rounded-md transition-colors ${isLatest ? "bg-accent/40 p-2 -ml-2 rounded-md" : ""}`}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted border border-border shadow-sm mt-0.5">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <p className="text-sm leading-tight text-foreground/90">
                      <span className="font-semibold text-foreground">{activity.actor.name}</span>{" "}
                      {ACTION_LABELS[activity.action] || activity.action}
                      {activity.target && (
                        <span className="text-muted-foreground"> {activity.target}</span>
                      )}
                    </p>
                    <span className="text-[11px] text-muted-foreground font-medium">{activity.timestamp}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="h-7 text-xs"
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                className="h-7 text-xs"
              >
                Next
              </Button>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
