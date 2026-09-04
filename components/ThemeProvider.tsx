"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "night" | "day";

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
}>({ theme: "night", toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("night");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-night", "theme-day");
    root.classList.add(theme === "night" ? "theme-night" : "theme-day");
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggle: () =>
          setTheme((t) => (t === "night" ? "day" : "night")),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
