import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function DueDatePill({ date }: { date: string }) {
  const formatted = new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
  });

  return (
    <Badge
      variant="secondary"
      className="gap-1 rounded-md bg-red-50 text-red-600 hover:bg-red-50"
    >
      <CalendarDays className="h-3 w-3" />
      {formatted}
    </Badge>
  );
}
