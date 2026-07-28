import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export const THEME_STORAGE_KEY = "sastify-theme";
const VALID_THEMES = new Set(["light", "dark", "system"]);

const getSystemTheme = () => {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
};

const getInitialTheme = () => {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return VALID_THEMES.has(stored) ? stored : "system";
  } catch {
    return "system";
  }
};

const ThemeContext = createContext(null);

const applyTheme = (preference, resolvedTheme) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = resolvedTheme;
  root.dataset.themePreference = preference;
  root.classList.toggle("dark", resolvedTheme === "dark");
  root.style.colorScheme = resolvedTheme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", resolvedTheme === "dark" ? "#0b1020" : "#f7f8fc");
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getInitialTheme);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media) return undefined;
    const handleChange = (event) => setSystemTheme(event.matches ? "dark" : "light");
    media.addEventListener?.("change", handleChange);
    return () => media.removeEventListener?.("change", handleChange);
  }, []);

  useEffect(() => {
    applyTheme(theme, resolvedTheme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // The selected theme still applies when storage is unavailable.
    }
  }, [theme, resolvedTheme]);

  const setTheme = useCallback((nextTheme) => {
    if (VALID_THEMES.has(nextTheme)) setThemeState(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const currentResolved = current === "system" ? getSystemTheme() : current;
      return currentResolved === "dark" ? "light" : "dark";
    });
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [resolvedTheme, setTheme, theme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useThemeMode must be used within ThemeProvider");
  return context;
};
