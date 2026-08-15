import { Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Label } from "@/lib/types";

export function LabelPill({ label }: { label: Label }) {
  return (
    <Badge variant="outline" className="gap-1 rounded-md font-normal">
      <Tag className="h-3 w-3" />
      {label.name}
    </Badge>
  );
}
