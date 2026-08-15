import { SignalHigh, SignalMedium, SignalLow, Signal, Minus } from "lucide-react";
import { PRIORITY_CONFIG } from "@/lib/constants";
import type { Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

const PRIORITY_ICONS: Record<Priority, React.ElementType> = {
  "no-priority": Minus,
  low: SignalLow,
  medium: SignalMedium,
  high: SignalHigh,
  urgent: Signal,
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = PRIORITY_CONFIG[priority];
  const Icon = PRIORITY_ICONS[priority];

  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", config.className)}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}
