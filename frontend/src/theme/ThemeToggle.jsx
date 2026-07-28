import React, { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FiMonitor, FiMoon, FiSun } from "react-icons/fi";
import { cn } from "../utils/cn";
import { useThemeMode } from "./ThemeProvider";

const options = [
  { value: "light", label: "Light theme", icon: FiSun },
  { value: "dark", label: "Dark theme", icon: FiMoon },
  { value: "system", label: "Use system theme", icon: FiMonitor },
];

export const ThemeToggle = ({ className = "", compact = false }) => {
  const { theme, setTheme } = useThemeMode();
  const reduceMotion = useReducedMotion();
  const selectionId = useId().replace(/:/g, "");

  return (
    <div
      className={cn("theme-toggle", compact && "theme-toggle--compact", className)}
      role="radiogroup"
      aria-label="Color theme"
    >
      {options.map(({ value, label, icon: Icon }) => {
        const selected = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            title={label}
            className="theme-toggle__option"
            onClick={() => setTheme(value)}
          >
            {selected ? (
              <motion.span
                layoutId={`theme-toggle-selection-${selectionId}`}
                className="theme-toggle__selection"
                transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 32 }}
              />
            ) : null}
            <motion.span
              className="relative z-10"
              animate={selected && !reduceMotion ? { rotate: [0, -12, 0], scale: [1, 1.08, 1] } : undefined}
              transition={{ duration: 0.35 }}
            >
              <Icon aria-hidden="true" />
            </motion.span>
            {!compact ? <span className="sr-only sm:not-sr-only sm:ml-1">{value}</span> : null}
          </button>
        );
      })}
    </div>
  );
};
