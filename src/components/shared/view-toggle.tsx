"use client";

import { List, LayoutGrid } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ViewToggle({
  value,
  onChange,
}: {
  value: "list" | "board";
  onChange: (value: "list" | "board") => void;
}) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as "list" | "board")}>
      <TabsList>
        <TabsTrigger value="list" className="gap-1.5">
          <List className="h-4 w-4" />
          List
        </TabsTrigger>
        <TabsTrigger value="board" className="gap-1.5">
          <LayoutGrid className="h-4 w-4" />
          Board
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
