"use client";

import { Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { COLOR_MODES, useThemeColor } from "@/providers/theme-color-provider";

export function ColorModeDropdown({
  children,
  side = "right",
  align = "start",
}: {
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}) {
  const { colorMode, setColorMode } = useThemeColor();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent side={side} align={align} className="w-40">
        <span className="px-2 py-1 text-xs text-muted-foreground">
          Color Mode
        </span>
        {COLOR_MODES.map((mode) => (
          <DropdownMenuItem
            key={mode.id}
            className="justify-between gap-2"
            onClick={() => setColorMode(mode.id)}
          >
            <span className="flex items-center gap-2">
              <span
                className="h-3.5 w-3.5 rounded-sm"
                style={{ backgroundColor: mode.hex }}
              />
              {mode.label}
            </span>
            {colorMode === mode.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
