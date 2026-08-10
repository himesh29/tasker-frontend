"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Search, User, Sun, Moon } from "lucide-react";
import { ThemeDropdown } from "@/components/shared/theme-dropdown";
import { ColorModeDropdown } from "@/components/shared/color-mode-dropdown";
import { COLOR_MODES, useThemeColor } from "@/providers/theme-color-provider";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { theme, colorMode } = useThemeColor();
  const isProfileActive = pathname === "/settings";
  const isDark = theme === "dark";

  const sidebarBg = isDark ? "#0A0A0A" : "#FAFAFA";
  const sidebarText = isDark ? "#FAFAFA" : "#171717";
  const sidebarBorder = isDark ? "#262626" : "#E5E5E5";
  const activeBg = isDark ? "#171717" : "#FFFFFF";

  return (
    <div className="flex flex-1">
      <div
        className="w-64 shrink-0 border-r p-4"
        style={{ backgroundColor: sidebarBg, borderColor: sidebarBorder, color: sidebarText }}
      >
        <Link
          href="/tasks"
          className="mb-4 flex items-center gap-1.5 text-sm hover:opacity-70"
          style={{ color: sidebarText }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to app
        </Link>

        <div
          className="mb-2 flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
          style={{ borderColor: sidebarBorder, color: isDark ? "#A3A3A3" : "#737373" }}
        >
          <Search className="h-4 w-4" />
          Search
        </div>

        <nav className="flex flex-col gap-0.5">
          <Link
            href="/settings"
            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm"
            style={{
              backgroundColor: isProfileActive ? activeBg : "transparent",
              color: sidebarText,
            }}
          >
            <User className="h-4 w-4" />
            Profile
          </Link>

          <ThemeDropdown side="right" align="start">
            <button
              className="flex items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm hover:opacity-70"
              style={{ color: sidebarText }}
            >
              {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              Theme
            </button>
          </ThemeDropdown>

          <ColorModeDropdown side="right" align="start">
            <button
              className="flex items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm hover:opacity-70"
              style={{ color: sidebarText }}
            >
              <span
                className="h-4 w-4 rounded-sm"
                style={{
                  backgroundColor: COLOR_MODES.find((c) => c.id === colorMode)?.hex,
                }}
              />
              Color
            </button>
          </ColorModeDropdown>
        </nav>
      </div>

      <div className="flex flex-1 justify-center overflow-y-auto pt-32">
        {children}
      </div>
    </div>
  );
}
