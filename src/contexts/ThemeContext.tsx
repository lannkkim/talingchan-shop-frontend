"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { theme as antdTheme } from "antd";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  algorithm: typeof antdTheme.defaultAlgorithm | typeof antdTheme.darkAlgorithm;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = "talingchan-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check localStorage and system preference on mount
    const savedTheme = localStorage.getItem(THEME_KEY) as ThemeMode | null;
    if (savedTheme) {
      setThemeModeState(savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setThemeModeState("dark");
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(THEME_KEY, themeMode);
      // Update document class for Tailwind dark mode
      if (themeMode === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [themeMode, mounted]);

  const toggleTheme = () => {
    setThemeModeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  const algorithm =
    themeMode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm;

  // Prevent flash - render nothing until mounted
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{ themeMode, toggleTheme, setThemeMode, algorithm }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
