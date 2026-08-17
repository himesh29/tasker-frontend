"use client";

import { Sun, Moon, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThemeColor } from "@/providers/theme-color-provider";

export function ThemeDropdown({
  children,
  side = "right",
  align = "start",
}: {
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}) {
  const { theme, setTheme } = useThemeColor();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent side={side} align={align} className="w-40">
        <span className="px-2 py-1 text-xs text-muted-foreground">Theme</span>
        <DropdownMenuItem
          className="justify-between gap-2"
          onClick={() => setTheme("light")}
        >
          <span className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Light
          </span>
          {theme === "light" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="justify-between gap-2"
          onClick={() => setTheme("dark")}
        >
          <span className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            Dark
          </span>
          {theme === "dark" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
