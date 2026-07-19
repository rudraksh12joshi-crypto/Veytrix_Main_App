import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import { useColorScheme } from "react-native";

import { darkTheme, lightTheme, ThemeTokens } from "./tokens";

export type ThemeMode = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: ThemeTokens;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>("system");

  const isDark = mode === "system" ? system !== "light" : mode === "dark";
  const theme = isDark ? darkTheme : lightTheme;

  const handleSetMode = useCallback((next: ThemeMode) => setMode(next), []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, mode, isDark, setMode: handleSetMode }),
    [theme, mode, isDark, handleSetMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
