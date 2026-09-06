"use client";

/**
 * ThemeProvider
 * Owns which of the two lightings the night is seen in.
 *
 * The source of truth is the `data-theme` attribute on the document element,
 * which the boot script in the head has already written before first paint.
 * That makes the theme an external store rather than React state, so it is
 * read with useSyncExternalStore: no effect writes state, no flash, and a
 * change from anywhere (including another tab writing storage) is picked up.
 */

import { createContext, useCallback, useContext, useSyncExternalStore, type ReactNode } from "react";
import { DEFAULT_THEME, isTheme, THEME_KEY, type Theme } from "@/lib/theme";

type ThemeValue = { theme: Theme; setTheme: (t: Theme) => void; toggle: () => void };

const Ctx = createContext<ThemeValue | null>(null);

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  const attr = document.documentElement.getAttribute("data-theme");
  return isTheme(attr) ? attr : DEFAULT_THEME;
}

function getServerSnapshot(): Theme {
  return DEFAULT_THEME;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((t: Theme) => {
    document.documentElement.setAttribute("data-theme", t);
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch {
      // private browsing or storage disabled: the choice just will not persist
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme(getSnapshot() === "night" ? "morning" : "night");
  }, [setTheme]);

  return <Ctx.Provider value={{ theme, setTheme, toggle }}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useTheme must be used inside ThemeProvider");
  return v;
}
