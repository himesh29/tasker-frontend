"use client";

import { useState } from "react";
import {
  LayoutGrid,
  Layers,
  ChevronsUpDown,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeDropdown } from "@/components/shared/theme-dropdown";
import { ColorModeDropdown } from "@/components/shared/color-mode-dropdown";
import { COLOR_MODES, useThemeColor } from "@/providers/theme-color-provider";
import { useAuth } from "@/providers/auth-provider";

const navItems = [
  { title: "Tasks", url: "/tasks", icon: LayoutGrid },
  { title: "Projects", url: "/projects", icon: Layers },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [accountExpanded, setAccountExpanded] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(true);
  const { theme, colorMode } = useThemeColor();
  const { user } = useAuth();

  const displayName = user?.name || "User";
  const initial = displayName.slice(0, 2).toUpperCase();

  return (
    <Sidebar className="w-[var(--sidebar-width)] min-w-[200px] max-w-[280px] overflow-hidden">
      <SidebarHeader className="relative">
        <SidebarMenuButton
          size="lg"
          className="gap-2"
          onClick={() => setAccountExpanded(!accountExpanded)}
        >
          <Avatar className="h-6 w-6 rounded-full">
            <AvatarImage src={user?.avatarUrl} alt={displayName} />
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
          <span className="font-semibold">{displayName}</span>
          <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground" />
        </SidebarMenuButton>

        {accountExpanded && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setAccountExpanded(false)}
            />

            <div
              className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-sidebar-border bg-sidebar shadow-lg flex flex-col gap-0.5 p-2"
            >
              <div className="flex flex-col items-center gap-1 px-2 py-3 text-center">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatarUrl} alt={displayName} />
                  <AvatarFallback>{initial}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{displayName}</span>
                <span className="text-xs text-muted-foreground">
                  {user?.email || ""}
                </span>
              </div>

              <ThemeDropdown>
                <button className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                  {theme === "dark" ? (
                    <Moon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Sun className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span>Change Theme</span>
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </button>
              </ThemeDropdown>

              <ColorModeDropdown>
                <button className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                  <span
                    className="h-3.5 w-3.5 rounded-sm"
                    style={{
                      backgroundColor: COLOR_MODES.find((c) => c.id === colorMode)
                        ?.hex,
                    }}
                  />
                  <span>Color Mode</span>
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </button>
              </ColorModeDropdown>

              <Link
                href="/settings"
                onClick={() => setAccountExpanded(false)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span>Settings</span>
              </Link>
            </div>
          </>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel
            className="flex cursor-pointer items-center justify-between"
            onClick={() => setWorkspaceOpen(!workspaceOpen)}
          >
            Workspace
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${!workspaceOpen ? "-rotate-90" : ""}`}
            />
          </SidebarGroupLabel>

          {workspaceOpen && (
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(item.url)}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}
