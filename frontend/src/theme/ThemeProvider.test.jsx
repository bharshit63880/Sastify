import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider, useThemeMode } from "./ThemeProvider";
import { ThemeToggle } from "./ThemeToggle";
import { createSastifyTheme } from "./theme";

const ThemeReadout = () => {
  const { theme, resolvedTheme } = useThemeMode();
  return <output aria-label="theme state">{`${theme}:${resolvedTheme}`}</output>;
};

const setSystemDark = (matches) => {
  window.matchMedia = jest.fn().mockImplementation(() => ({
    matches,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
};

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.className = "";
  delete document.documentElement.dataset.theme;
  setSystemDark(false);
});

test("uses and persists the system preference", () => {
  render(<ThemeProvider><ThemeReadout /><ThemeToggle /></ThemeProvider>);
  expect(screen.getByLabelText("theme state")).toHaveTextContent("system:light");
  expect(document.documentElement).toHaveAttribute("data-theme", "light");
  expect(window.localStorage.getItem("sastify-theme")).toBe("system");
});

test("supports keyboard-accessible dark and light selection", () => {
  render(<ThemeProvider><ThemeReadout /><ThemeToggle /></ThemeProvider>);
  const dark = screen.getByRole("radio", { name: "Dark theme" });
  dark.focus();
  fireEvent.keyDown(dark, { key: "Enter" });
  fireEvent.click(dark);
  expect(screen.getByLabelText("theme state")).toHaveTextContent("dark:dark");
  expect(document.documentElement).toHaveClass("dark");
  expect(window.localStorage.getItem("sastify-theme")).toBe("dark");

  fireEvent.click(screen.getByRole("radio", { name: "Light theme" }));
  expect(document.documentElement).not.toHaveClass("dark");
  expect(document.documentElement).toHaveAttribute("data-theme", "light");
});

test("creates matching light and dark Material UI themes", () => {
  expect(createSastifyTheme("light").palette.mode).toBe("light");
  expect(createSastifyTheme("dark").palette.mode).toBe("dark");
  expect(createSastifyTheme("dark").palette.background.default).not.toBe(
    createSastifyTheme("light").palette.background.default
  );
});
