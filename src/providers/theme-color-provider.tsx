"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark";
export type ColorMode = "amber" | "blue" | "pink" | "rose" | "emerald" | "black";

export const COLOR_MODES: { id: ColorMode; label: string; hex: string }[] = [
  { id: "amber", label: "Amber", hex: "#F59E0B" },
  { id: "blue", label: "Blue", hex: "#7C3AED" },
  { id: "pink", label: "Pink", hex: "#EC4899" },
  { id: "rose", label: "Rose", hex: "#F43F5E" },
  { id: "emerald", label: "Emerald", hex: "#10B981" },
  { id: "black", label: "Black", hex: "#171717" },
];

interface ThemeColorContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
}

const ThemeColorContext = createContext<ThemeColorContextValue | undefined>(
  undefined
);

export function ThemeColorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>("light");
  const [colorMode, setColorMode] = useState<ColorMode>("blue");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <ThemeColorContext.Provider
      value={{ theme, setTheme, colorMode, setColorMode }}
    >
      {children}
    </ThemeColorContext.Provider>
  );
}

export function useThemeColor() {
  const ctx = useContext(ThemeColorContext);
  if (!ctx) {
    throw new Error("useThemeColor must be used within ThemeColorProvider");
  }
  return ctx;
}
