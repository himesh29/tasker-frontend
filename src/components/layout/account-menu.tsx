"use client";

import { useState } from "react";
import Link from "next/link";
import { Sun, LogOut, Settings, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/providers/auth-provider";

const COLOR_MODES = [
  { id: "amber", label: "Amber", hex: "#F59E0B" },
  { id: "blue", label: "Blue", hex: "#7C3AED" },
  { id: "pink", label: "Pink", hex: "#EC4899" },
  { id: "rose", label: "Rose", hex: "#F43F5E" },
  { id: "emerald", label: "Emerald", hex: "#10B981" },
  { id: "black", label: "Black", hex: "#171717" },
];

export function AccountMenu({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [colorMode, setColorMode] = useState("blue");

  if (!user) return <>{children}</>;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <div className="flex flex-col items-center gap-1 px-2 py-3 text-center">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{user.name?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{user.name}</span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            <Sun className="h-4 w-4 text-muted-foreground" />
            Change Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <span className="px-2 py-1 text-xs text-muted-foreground">Theme</span>
            <DropdownMenuItem className="justify-between gap-2">
              <span className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                Light
              </span>
              <Check className="h-4 w-4" />
            </DropdownMenuItem>
            <DropdownMenuItem className="justify-between gap-2">
              <span className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                Dark
              </span>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            <span
              className="h-3.5 w-3.5 rounded-sm"
              style={{ backgroundColor: COLOR_MODES.find((c) => c.id === colorMode)?.hex }}
            />
            Color Mode
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <span className="px-2 py-1 text-xs text-muted-foreground">Color Mode</span>
            {COLOR_MODES.map((mode) => (
              <DropdownMenuItem
                key={mode.id}
                onClick={() => setColorMode(mode.id)}
                className="justify-between gap-2"
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
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem asChild>
          <Link href="/settings" className="gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => logout()} className="gap-2 text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
