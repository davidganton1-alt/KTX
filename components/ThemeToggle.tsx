"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--fg)] transition hover:border-[var(--gold)] hover:text-[var(--gold)]"
    >
      {theme === "night" ? "☀ Daylight" : "🌙 Kingdom"}
    </button>
  );
}
