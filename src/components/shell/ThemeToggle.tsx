"use client";

/**
 * ThemeToggle
 * A physical switch rather than an icon button: a track with a knob that
 * slides across. The knob is warm at night and cool in the morning, so the
 * control itself shows you which lighting you are in.
 */

import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const night = theme === "night";

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={!night}
      aria-label={night ? "Switch to morning" : "Switch to night"}
      className={`relative h-6 w-11 shrink-0 rounded-full border border-rule/50 bg-raised transition-colors duration-[600ms] ease-[var(--ease-out-expo)] ${className ?? ""}`}
      data-cursor={night ? "Morning" : "Night"}
    >
      <span
        className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition-[left,background-color] duration-[600ms] ease-[var(--ease-out-expo)]"
        style={{
          left: night ? "0.25rem" : "1.5rem",
          background: night ? "var(--accent-warm)" : "var(--accent-light)",
        }}
        aria-hidden="true"
      />
    </button>
  );
}
