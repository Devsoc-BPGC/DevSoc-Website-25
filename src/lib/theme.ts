export type Theme = "night" | "morning";

export const THEME_KEY = "devsoc:theme";
export const DEFAULT_THEME: Theme = "night";

export function isTheme(v: unknown): v is Theme {
  return v === "night" || v === "morning";
}

/**
 * Runs before first paint, straight from the document head, so a stored
 * choice is honoured immediately and night never flashes.
 *
 * Night is the default for everyone on a first visit. The operating system
 * light preference deliberately does not override it: the site is a night on
 * campus, and that is the state it should be met in. Only an explicit choice
 * by the visitor changes it, and that choice then wins forever.
 *
 * Kept as a string because it has to execute before React exists.
 */
export const themeBootScript = `(function(){try{
var s=localStorage.getItem(${JSON.stringify(THEME_KEY)});
document.documentElement.setAttribute("data-theme",(s==="morning"||s==="night")?s:${JSON.stringify(DEFAULT_THEME)});
}catch(e){document.documentElement.setAttribute("data-theme",${JSON.stringify(DEFAULT_THEME)});}})();`;
