# The Night Shift Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the DevSoc home page as a single night on the Goa campus, dusk to dawn, with a scroll-driven clock as the narrative and a second morning theme.

**Architecture:** A refactor of a working Next.js site, not a rebuild. The entire `src/components/motion` toolkit, the typed content layer and the Lenis plus GSAP wiring carry forward untouched. We add a two-tier token layer with a theme switch, a night clock driven by scroll position, a paper-boat path drawn down the page, and we replace the chapter set and the artwork.

**Tech Stack:** Next.js 16.3 App Router, TypeScript, Tailwind v4, GSAP 3.13 with ScrollTrigger, Lenis, three.js via React Three Fiber, motion, Embla.

Spec: `docs/superpowers/specs/2026-09-07-devsoc-night-shift-design.md`
Reference teardown: `docs/reference/zainabkabira-design.md`
Image prompts: `docs/assets/PROMPTS-COPY-PASTE.md`

## Global Constraints

- **Night is the default theme.** Served as `data-theme="night"`, applied before first paint, no flash.
- Palette tier tokens: obsidian `oklch(0.13 0.008 60)`, soot `oklch(0.20 0.008 60)`, bone `oklch(0.93 0.02 85)`, ash `oklch(0.66 0.015 80)`, verdigris `oklch(0.72 0.11 185)`, verdigris-deep `oklch(0.45 0.08 190)`, ember `oklch(0.70 0.17 50)`, brass `oklch(0.78 0.09 85)`, haze `oklch(0.94 0.012 170)`, haze-2 `oklch(0.90 0.016 170)`, ink `oklch(0.22 0.02 200)`, slate `oklch(0.50 0.02 200)`.
- **Never introduce a cream, beige, sand or paper ground.** The light theme ground is `--c-haze`, a pale sea glass.
- Easing is `cubic-bezier(0.22, 1, 0.36, 1)`. No bounce, elastic, spring or overshoot anywhere.
- Reveals 0.9 to 1.4s. Hover 0.6s. Scrub 1.2. Theme crossfade 0.6s. Ambient loop periods 6 to 14s.
- **No em dashes or en dashes** in any copy, comment, commit message or document.
- No pills, no eyebrow labels, no icon-in-circle cards, no three-column feature grids, no glassmorphism, no `backdrop-filter`.
- Depth is rings and hairlines, not blur. One soft shadow permitted on the whole site.
- No shared max-width container. Sections are full bleed and content is centred by its own measure.
- Every chapter must be readable with JavaScript disabled and complete under `prefers-reduced-motion: reduce`.
- Total media under 3MB on first load.
- Missing artwork must render a lit placeholder, never a broken layout.
- Run `npx tsc --noEmit` and `npx eslint src` before every commit. Both must be clean.

---

## File structure

```
src/content/chapters.ts              NEW  chapter ids, labels, times, light positions
src/content/site.ts                  MOD  add themes config
src/content/verticals.ts             MOD  repoint images to rooms/*.jpg, add window copy
src/styles/globals.css               MOD  two-tier tokens, [data-theme], resolve, ambient
src/app/layout.tsx                   MOD  theme script, ThemeProvider, Nav, WirePath
src/app/page.tsx                     MOD  the seven chapters in order
src/lib/theme.ts                     NEW  theme type, storage key, inline boot script
src/components/shell/ThemeProvider.tsx   NEW  context, toggle, persistence
src/components/shell/ThemeToggle.tsx     NEW  the physical switch
src/components/shell/NightClock.tsx      NEW  scroll-interpolated clock
src/components/shell/Nav.tsx         MOD  clock, chapter name, toggle, morph on scroll
src/components/shell/Rail.tsx        MOD  show each chapter's time
src/components/motion/WirePath.tsx       NEW  scroll-drawn path with the boat riding it
src/components/motion/Ambient.tsx        NEW  slow looping light field
src/components/chapters/Dusk.tsx         NEW  (replaces Hero.tsx)
src/components/chapters/Society.tsx      NEW  (replaces Manifesto.tsx)
src/components/chapters/Rooms.tsx        MOD  six windows
src/components/chapters/Log.tsx          NEW  (renamed from Work.tsx)
src/components/chapters/DevFest.tsx      MOD  night artwork
src/components/chapters/Crew.tsx         NEW  (renamed from Credits.tsx)
src/components/chapters/Dawn.tsx         NEW  (Join + Faq merged)
src/components/chapters/Colophon.tsx     MOD  tokens
public/images/{hero,rooms,devfest,dawn,brand}/   artwork
```

Deleted after their replacements land: `Hero.tsx`, `Manifesto.tsx`, `Work.tsx`, `Credits.tsx`, `Join.tsx`, `Archive.tsx` (its lanes move into `/gallery` only), `ui/Faq.tsx` (folded into Dawn).

---

### Task 1: Two-tier tokens and the theme switch

**Files:**
- Create: `src/lib/theme.ts`, `src/components/shell/ThemeProvider.tsx`, `src/components/shell/ThemeToggle.tsx`
- Modify: `src/styles/globals.css`, `src/app/layout.tsx`

**Interfaces:**
- Produces: `type Theme = "night" | "morning"`, `THEME_KEY = "devsoc:theme"`, `themeBootScript: string`, `useTheme(): { theme: Theme; setTheme(t: Theme): void; toggle(): void }`, `<ThemeProvider>`, `<ThemeToggle />`

- [ ] **Step 1: Write `src/lib/theme.ts`**

```ts
export type Theme = "night" | "morning";
export const THEME_KEY = "devsoc:theme";
export const DEFAULT_THEME: Theme = "night";

/** Runs before first paint so the served night default never flashes. */
export const themeBootScript = `(function(){try{
var s=localStorage.getItem("${THEME_KEY}");
var t=s==="morning"||s==="night"?s:(window.matchMedia("(prefers-color-scheme: light)").matches?"morning":"night");
document.documentElement.setAttribute("data-theme",t);
}catch(e){document.documentElement.setAttribute("data-theme","night");}})();`;
```

- [ ] **Step 2: Restructure the tokens in `src/styles/globals.css`**

Replace the current `@theme` colour block with a palette tier plus a role tier. The `@theme` block maps Tailwind colour utilities onto the role variables so `text-primary` and `bg-base` work as classes.

```css
:root {
  /* Tier 1: palette */
  --c-obsidian: oklch(0.13 0.008 60);
  --c-soot: oklch(0.2 0.008 60);
  --c-bone: oklch(0.93 0.02 85);
  --c-ash: oklch(0.66 0.015 80);
  --c-verdigris: oklch(0.72 0.11 185);
  --c-verdigris-deep: oklch(0.45 0.08 190);
  --c-ember: oklch(0.7 0.17 50);
  --c-brass: oklch(0.78 0.09 85);
  --c-haze: oklch(0.94 0.012 170);
  --c-haze-2: oklch(0.9 0.016 170);
  --c-ink: oklch(0.22 0.02 200);
  --c-slate: oklch(0.5 0.02 200);
}

:root,
[data-theme="night"] {
  --bg-base: var(--c-obsidian);
  --surface-raised: var(--c-soot);
  --text-primary: var(--c-bone);
  --text-muted: var(--c-ash);
  --accent-light: var(--c-verdigris);
  --accent-warm: var(--c-ember);
  --rule: color-mix(in oklch, var(--c-brass) 25%, transparent);
  --scrim: color-mix(in oklch, var(--c-obsidian) 70%, transparent);
  --grade: var(--c-verdigris-deep);
  color-scheme: dark;
}

[data-theme="morning"] {
  --bg-base: var(--c-haze);
  --surface-raised: var(--c-haze-2);
  --text-primary: var(--c-ink);
  --text-muted: var(--c-slate);
  --accent-light: var(--c-verdigris);
  --accent-warm: var(--c-ember);
  --rule: color-mix(in oklch, var(--c-ink) 20%, transparent);
  --scrim: color-mix(in oklch, var(--c-haze) 70%, transparent);
  --grade: var(--c-verdigris-deep);
  color-scheme: light;
}

@theme inline {
  --color-*: initial;
  --color-base: var(--bg-base);
  --color-raised: var(--surface-raised);
  --color-primary: var(--text-primary);
  --color-muted: var(--text-muted);
  --color-light: var(--accent-light);
  --color-warm: var(--accent-warm);
  --color-rule: var(--rule);
  --color-transparent: transparent;
  --color-current: currentColor;
}

html { background: var(--bg-base); }
body {
  background: var(--bg-base);
  color: var(--text-primary);
  transition: background-color 0.6s var(--ease-out-expo), color 0.6s var(--ease-out-expo);
}
```

Keep the existing `--font-*`, `--ease-*` and `--breakpoint-*` entries in `@theme` unchanged.

- [ ] **Step 3: Write `ThemeProvider.tsx`**

```tsx
"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_THEME, THEME_KEY, type Theme } from "@/lib/theme";

const Ctx = createContext<{ theme: Theme; setTheme: (t: Theme) => void; toggle: () => void } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  // The boot script already set the attribute; adopt it rather than fight it.
  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "morning" || attr === "night") setThemeState(attr);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem(THEME_KEY, t); } catch {}
  }, []);

  const toggle = useCallback(() => setTheme(theme === "night" ? "morning" : "night"), [theme, setTheme]);

  return <Ctx.Provider value={{ theme, setTheme, toggle }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useTheme must be used inside ThemeProvider");
  return v;
}
```

- [ ] **Step 4: Write `ThemeToggle.tsx`**

A physical switch, not an icon button: a track with a knob that slides. Warm knob at night, cool knob in the morning.

```tsx
"use client";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const night = theme === "night";
  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={!night}
      aria-label={night ? "Switch to morning" : "Switch to night"}
      className="relative h-6 w-11 rounded-full border border-rule bg-raised transition-colors duration-[600ms] ease-[var(--ease-out-expo)]"
      data-cursor={night ? "Morning" : "Night"}
    >
      <span
        className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition-[left,background-color] duration-[600ms] ease-[var(--ease-out-expo)]"
        style={{ left: night ? "0.25rem" : "1.5rem", background: night ? "var(--c-ember)" : "var(--c-verdigris)" }}
      />
    </button>
  );
}
```

- [ ] **Step 5: Wire the boot script and provider into `src/app/layout.tsx`**

```tsx
<html lang="en" suppressHydrationWarning className={/* font vars unchanged */ ""}>
  <head>
    <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
  </head>
  <body>
    <ThemeProvider>
      <SmoothScroll>
        <Nav />
        {children}
      </SmoothScroll>
      <FrameChrome />
      <Overture />
      <Cursor />
      <div className="grain" aria-hidden="true" />
    </ThemeProvider>
  </body>
</html>
```

Add `<ThemeToggle />` into `Nav.tsx` beside the menu button.

- [ ] **Step 6: Sweep every colour class in `src/` onto the role names**

`text-bone` becomes `text-primary`, `text-ash` becomes `text-muted`, `bg-obsidian` becomes `bg-base`, `bg-soot` becomes `bg-raised`, `text-verdigris` becomes `text-light`, `text-ember` becomes `text-warm`, `border-brass/25` becomes `border-rule`. Run:

```bash
grep -rln "text-bone\|text-ash\|bg-obsidian\|bg-soot\|text-verdigris\|text-ember\|border-brass" src/
```

Fix every file the grep lists, then confirm the grep returns nothing.

- [ ] **Step 7: Verify**

```bash
npx tsc --noEmit && npx eslint src
```

Then in the browser at `localhost:3000`: confirm the page loads night with no flash of light, the toggle flips to morning and both grounds are correct, a reload keeps the chosen theme, and clearing `localStorage` returns to night.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: two-tier tokens with a night default and a morning theme"
```

---

### Task 2: The night clock

**Files:**
- Create: `src/content/chapters.ts`, `src/components/shell/NightClock.tsx`
- Modify: `src/components/shell/Nav.tsx`, `src/components/shell/Rail.tsx`, `src/components/motion/FrameChrome.tsx`

**Interfaces:**
- Consumes: `useTheme()` from Task 1.
- Produces: `chapters: Chapter[]` where `Chapter = { id: string; label: string; time: string; minutes: number; light: { x: number; y: number } }`, and `<NightClock />`.

- [ ] **Step 1: Write `src/content/chapters.ts`**

```ts
export type Chapter = {
  id: string;
  label: string;
  /** Wall-clock time this chapter sits at, for display. */
  time: string;
  /** Minutes past 18:00, so the sequence is monotonic across midnight. */
  minutes: number;
  /** Where the ambient light sits during this chapter, in percent. */
  light: { x: number; y: number };
};

export const chapters: Chapter[] = [
  { id: "dusk",    label: "Dusk",        time: "18:42", minutes: 42,  light: { x: 72, y: 30 } },
  { id: "society", label: "The Society", time: "20:15", minutes: 135, light: { x: 34, y: 40 } },
  { id: "rooms",   label: "Six Rooms",   time: "22:30", minutes: 270, light: { x: 66, y: 46 } },
  { id: "log",     label: "The Log",     time: "00:40", minutes: 400, light: { x: 40, y: 55 } },
  { id: "devfest", label: "DevFest",     time: "02:00", minutes: 480, light: { x: 50, y: 34 } },
  { id: "crew",    label: "The Crew",    time: "04:10", minutes: 610, light: { x: 28, y: 50 } },
  { id: "dawn",    label: "Dawn",        time: "05:58", minutes: 718, light: { x: 62, y: 24 } },
];

/** Formats minutes past 18:00 back to a 24 hour clock string. */
export function formatNightTime(minutes: number): string {
  const total = Math.round(minutes);
  const h = Math.floor(((18 + Math.floor(total / 60)) % 24 + 24) % 24);
  const m = ((total % 60) + 60) % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
```

- [ ] **Step 2: Write the failing test for the formatter**

Create `src/content/chapters.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatNightTime, chapters } from "./chapters.ts";

test("formats the start of the night", () => {
  assert.equal(formatNightTime(0), "18:00");
});

test("formats before midnight", () => {
  assert.equal(formatNightTime(42), "18:42");
});

test("wraps past midnight", () => {
  assert.equal(formatNightTime(400), "00:40");
});

test("formats dawn", () => {
  assert.equal(formatNightTime(718), "05:58");
});

test("every chapter's minutes agree with its printed time", () => {
  for (const c of chapters) assert.equal(formatNightTime(c.minutes), c.time);
});
```

- [ ] **Step 3: Run it and watch it fail**

```bash
npx tsx --test src/content/chapters.test.ts
```
Expected: fails until `chapters.ts` from Step 1 is saved. If Step 1 is already saved, expect PASS and move on.

- [ ] **Step 4: Run it and watch it pass**

```bash
npx tsx --test src/content/chapters.test.ts
```
Expected: 5 passing. If the last test fails, a chapter's `minutes` and `time` disagree; fix the data, not the formatter.

- [ ] **Step 5: Write `NightClock.tsx`**

Interpolates between the surrounding chapter times using each section's position, so the clock advances continuously.

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { chapters, formatNightTime } from "@/content/chapters";
import { useReducedMotion } from "@/lib/useMedia";

export function NightClock({ className }: { className?: string }) {
  const [label, setLabel] = useState(chapters[0].time);
  const reduced = useReducedMotion();
  const frame = useRef(0);

  useEffect(() => {
    const read = () => {
      const tops = chapters.map((c) => {
        const el = document.getElementById(c.id);
        return el ? el.getBoundingClientRect().top + window.scrollY : null;
      });
      const y = window.scrollY + window.innerHeight * 0.4;
      let i = 0;
      for (let k = 0; k < tops.length; k++) if (tops[k] !== null && tops[k]! <= y) i = k;
      const cur = chapters[i];
      const next = chapters[i + 1];
      if (reduced || !next || tops[i] === null || tops[i + 1] === null) {
        setLabel(cur.time);
        return;
      }
      const span = tops[i + 1]! - tops[i]!;
      const p = span > 0 ? Math.min(1, Math.max(0, (y - tops[i]!) / span)) : 0;
      setLabel(formatNightTime(cur.minutes + (next.minutes - cur.minutes) * p));
    };

    const onScroll = () => {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  return (
    <span className={`hud text-light ${className ?? ""}`} aria-label={`Time in the story, ${label}`}>
      {label}
    </span>
  );
}
```

- [ ] **Step 6: Put the clock in the nav and the times on the rail**

In `Nav.tsx` replace `<Timecode />` with `<NightClock className="hidden md:inline" />`. In `Rail.tsx` render `{c.time}` in mono beside each chapter label, muted when inactive and `text-light` when active. In `FrameChrome.tsx` delete any remaining timecode markup so the clock exists once.

- [ ] **Step 7: Verify in the browser**

Scroll the home page from top to bottom and confirm the clock runs forward from 18:42 to 05:58 without jumping backwards, and that it passes through 00:40 rather than resetting. With reduced motion on, confirm it shows discrete chapter times.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: night clock driven by scroll position through the chapters"
```

---

### Task 3: Ambient light and the wire

**Files:**
- Create: `src/components/motion/Ambient.tsx`, `src/components/motion/WirePath.tsx`
- Modify: `src/styles/globals.css`, `src/app/page.tsx`

**Interfaces:**
- Consumes: `chapters` from Task 2.
- Produces: `<Ambient x={number} y={number} intensity?={number} />` and `<WirePath />`.

- [ ] **Step 1: Add the ambient keyframes to `globals.css`**

```css
.ambient-field {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    55% 45% at var(--ax, 60%) var(--ay, 40%),
    color-mix(in oklch, var(--grade) 55%, transparent),
    transparent 70%
  );
  opacity: var(--ai, 0.5);
  transition: background 1.2s var(--ease-out-expo), opacity 1.2s var(--ease-out-expo);
}
@media (prefers-reduced-motion: no-preference) {
  .ambient-field { animation: ambient-breathe 12s ease-in-out infinite; }
}
@keyframes ambient-breathe {
  0%, 100% { opacity: var(--ai, 0.5); }
  50% { opacity: calc(var(--ai, 0.5) * 0.72); }
}
```

- [ ] **Step 2: Write `Ambient.tsx`**

```tsx
/**
 * Ambient
 * One soft field of light behind a chapter. Breathes on a 12 second period,
 * which is slow enough to feel like a room rather than an animation.
 */
export function Ambient({ x = 60, y = 40, intensity = 0.5 }: { x?: number; y?: number; intensity?: number }) {
  return (
    <div
      className="ambient-field"
      style={{ ["--ax" as string]: `${x}%`, ["--ay" as string]: `${y}%`, ["--ai" as string]: intensity }}
      aria-hidden="true"
    />
  );
}
```

- [ ] **Step 3: Write `WirePath.tsx`**

One SVG path down the whole page, stroke-drawn by scroll, with the boat riding the head of the line.

```tsx
"use client";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useMedia";

/** A gentle S down the page, in a 100 x 1000 viewBox stretched to the document. */
const D = "M 18 0 C 74 120, 8 210, 32 320 C 58 430, 92 470, 68 580 C 44 690, 12 730, 30 840 C 46 940, 80 960, 62 1000";

export function WirePath() {
  const wrap = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const boat = useRef<SVGImageElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const p = path.current;
      const b = boat.current;
      if (!p) return;
      const len = p.getTotalLength();
      p.style.strokeDasharray = String(len);

      if (reduced) {
        p.style.strokeDashoffset = "0";
        if (b) {
          const pt = p.getPointAtLength(len);
          b.setAttribute("x", String(pt.x - 3));
          b.setAttribute("y", String(pt.y - 3));
        }
        return;
      }

      p.style.strokeDashoffset = String(len);
      const st = ScrollTrigger.create({
        start: 0,
        end: () => ScrollTrigger.maxScroll(window),
        scrub: 1.2,
        onUpdate(self) {
          const drawn = len * self.progress;
          p.style.strokeDashoffset = String(len - drawn);
          if (!b) return;
          const pt = p.getPointAtLength(Math.max(0.1, drawn));
          b.setAttribute("x", String(pt.x - 3));
          b.setAttribute("y", String(pt.y - 3));
        },
      });
      return () => st.kill();
    },
    { scope: wrap, dependencies: [reduced] },
  );

  return (
    <div ref={wrap} className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
      <svg viewBox="0 0 100 1000" preserveAspectRatio="none" className="h-full w-full">
        <path
          ref={path}
          d={D}
          fill="none"
          stroke="var(--rule)"
          strokeWidth="0.35"
          strokeDasharray="0"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
        />
      </svg>
      <svg viewBox="0 0 100 1000" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <image ref={boat} href="/images/brand/boat.png" width="6" height="6" opacity="0.9" />
      </svg>
    </div>
  );
}
```

- [ ] **Step 4: Mount the boat behind the page in `src/app/page.tsx`**

Wrap `<main>` in a `relative` container and render `<WirePath />` as its first child so the path sits behind every chapter.

- [ ] **Step 5: Verify**

```bash
npx tsc --noEmit && npx eslint src
```
In the browser, scroll the whole page and confirm the dashed line draws from the top and the boat sits at the head of the drawn line the whole way down. With reduced motion on, confirm the line is fully drawn and the boat rests at the end. Confirm the boat is hidden below the `lg` breakpoint.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: ambient light field and the wire path"
```

---

### Task 4: Dusk, the hero

**Files:**
- Create: `src/components/chapters/Dusk.tsx`
- Modify: `src/app/page.tsx`, `src/content/site.ts`
- Delete: `src/components/chapters/Hero.tsx`

**Interfaces:**
- Consumes: `<Ambient />` from Task 3, `useTheme()` from Task 1, `chapters[0]` from Task 2.

- [ ] **Step 1: Add the new lines to `src/content/site.ts`**

```ts
line: "The campus sleeps. Six rooms stay lit.",
portLine: "Goa has been a port for five hundred years. We still ship.",
```

- [ ] **Step 2: Write `Dusk.tsx`**

Full-bleed photograph, the wordmark over it, the line bottom left, metadata bottom right. The artwork swaps with the theme.

```tsx
"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useTheme } from "@/components/shell/ThemeProvider";
import { useFinePointer, useReducedMotion } from "@/lib/useMedia";
import { SplitLines } from "@/components/motion/SplitLines";
import { FitText } from "@/components/ui/FitText";
import { TextLink } from "@/components/ui/TextLink";
import { site } from "@/content/site";

export function Dusk() {
  const root = useRef<HTMLElement>(null);
  const art = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const night = theme === "night";
  const base = night ? "night" : "morning";

  useGSAP(
    () => {
      if (reduced) return;
      gsap.fromTo(art.current, { scale: 1.06, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.8, ease: "expo.out" });
    },
    { scope: root, dependencies: [reduced, base] },
  );

  useGSAP(
    () => {
      if (reduced || !fine || !art.current) return;
      const xTo = gsap.quickTo(art.current, "x", { duration: 1.4, ease: "power3.out" });
      const yTo = gsap.quickTo(art.current, "y", { duration: 1.4, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        xTo((e.clientX / window.innerWidth - 0.5) * 18);
        yTo((e.clientY / window.innerHeight - 0.5) * 12);
      };
      window.addEventListener("pointermove", move, { passive: true });
      return () => window.removeEventListener("pointermove", move);
    },
    { scope: root, dependencies: [reduced, fine] },
  );

  return (
    <section id="dusk" ref={root} className="relative min-h-[100dvh] overflow-hidden" aria-labelledby="dusk-line">
      <div ref={art} className="absolute inset-0 will-change-transform">
        <Image
          key={base}
          src={`/images/hero/facade-${base}-wide.jpg`}
          alt={night ? "The Goa campus at last light, a few windows lit" : "The Goa campus at first light"}
          fill
          priority
          sizes="100vw"
          className="hidden object-cover md:block"
        />
        <Image
          key={`${base}-tall`}
          src={`/images/hero/facade-${base}-tall.jpg`}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover md:hidden"
        />
      </div>
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, var(--scrim))" }} />

      <div className="absolute inset-x-0 bottom-[9vh] grid-12 items-end gutter">
        <div className="col-span-12 lg:col-span-7">
          <FitText className="display text-primary">Devsoc</FitText>
          <SplitLines as="h1" id="dusk-line" className="voice mt-6 max-w-[20ch] text-[clamp(1.6rem,2.8vw,2.75rem)] text-primary" immediate delay={0.7}>
            {site.line}
          </SplitLines>
          <div className="mt-6">
            <TextLink href="/#rooms" cursor="Go">Walk through the rooms</TextLink>
          </div>
        </div>
        <p className="mono col-span-12 mt-8 text-muted lg:col-span-4 lg:col-start-9 lg:mt-0 lg:text-right">
          Developers&rsquo; Society
          <br />
          {site.campus}
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Add placeholder artwork so nothing breaks before generation**

```bash
node -e "const{writeFileSync}=require('fs');const{execSync}=require('child_process');" 2>/dev/null || true
python -c "
from PIL import Image
import os
os.makedirs('public/images/hero', exist_ok=True)
for name, size in [('dusk-wide',(1536,1024)),('dusk-tall',(1024,1536)),('morning-wide',(1536,1024)),('morning-tall',(1024,1536))]:
    p = f'public/images/hero/{name}.jpg'
    if not os.path.exists(p):
        Image.new('RGB', size, (26,24,20) if 'dusk' in name else (228,234,230)).save(p, 'JPEG', quality=70)
        print('placeholder', p)
"
```

- [ ] **Step 4: Swap `Hero` for `Dusk` in `src/app/page.tsx` and delete `Hero.tsx`**

- [ ] **Step 5: Verify**

```bash
npx tsc --noEmit && npx eslint src
```
In the browser confirm the hero fills the viewport at 1440x900 and 390x844, the wordmark fits without overflow, the line reads, and toggling the theme crossfades the artwork.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: Dusk replaces the hero, artwork follows the theme"
```

---

### Task 5: The Society

**Files:**
- Create: `src/components/chapters/Society.tsx`
- Modify: `src/app/page.tsx`
- Delete: `src/components/chapters/Manifesto.tsx`

- [ ] **Step 1: Write `Society.tsx`**

Oversized centred prose, then the port line as a statement, then three real numbers in mono. No image; this chapter is a breath between two loud ones.

```tsx
import { Reveal } from "@/components/motion/Reveal";
import { SplitLines } from "@/components/motion/SplitLines";
import { Ambient } from "@/components/motion/Ambient";
import { site } from "@/content/site";
import { chapters } from "@/content/chapters";

const facts = [
  { k: "Rooms", v: "Six" },
  { k: "Inducted this year", v: "186" },
  { k: "Campus", v: "K.K. Birla Goa" },
];

export function Society() {
  const light = chapters[1].light;
  return (
    <section id="society" className="relative overflow-hidden pb-[16vh] pt-[24vh]" aria-labelledby="society-line">
      <Ambient x={light.x} y={light.y} intensity={0.35} />
      <div className="relative gutter">
        <SplitLines
          as="p"
          id="society-line"
          className="mx-auto max-w-[24ch] text-center text-[clamp(1.5rem,2.4vw,2rem)] leading-[1.35] text-primary"
        >
          We build the software the campus runs on. Fest websites, fest apps, and the tools students open every day.
        </SplitLines>

        <Reveal className="mt-16">
          <p className="voice mx-auto max-w-[20ch] text-center text-[clamp(1.9rem,3.6vw,3.4rem)] text-primary">
            {site.portLine}
          </p>
        </Reveal>

        <Reveal stagger={0.07} className="mono mt-20 flex flex-wrap justify-center gap-x-16 gap-y-6 text-muted">
          {facts.map((f) => (
            <span key={f.k}>
              <span className="text-primary">{f.v}</span> {f.k}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Swap it into `page.tsx` and delete `Manifesto.tsx`**

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit && npx eslint src
```
Confirm the prose measures roughly 24 characters per line at 1440 and does not exceed the viewport at 390.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: The Society, oversized prose and the port line"
```

---

### Task 6: The flywheel

**Files:**
- Modify: `src/components/chapters/Rooms.tsx`, `src/content/verticals.ts`

- [ ] **Step 1: Repoint the artwork and add window copy in `verticals.ts`**

Change every `image` to `/images/rooms/0N-<id>.jpg` and add a `desk` field describing what is on that desk, used as the alt text:

```ts
desk: "A laptop open on a dark desk, browser lit",
```

Do this for all six: web, app, game, ai-ml, ui-ux, engine, matching the subjects in `docs/assets/night-shift-prompts.md`.

- [ ] **Step 2: Build the flywheel**

Keep the existing pinned `ScrollTrigger` and `LiquidImage` machinery. Replace the left-hand index with an SVG wheel:

1. A `<svg viewBox="0 0 100 100">` circle rim in `--rule-color`, six spokes at sixty degree intervals, and a hub circle of radius 26.
2. The whole group rotates by `-(activeIndex * 60) + scrollFraction` degrees, driven by the same ScrollTrigger progress that already picks the active room. One sixth of a turn per vertical.
3. Each spoke carries its vertical's name as an HTML label positioned around the rim, bone when active and ash otherwise, with `font-variation-settings` widening on the active one exactly as the current index does.
4. The hub holds `<LiquidImage>` clipped to a circle, showing the active vertical's poster.
5. The voice line, head and tools sit in the left column and change with the active vertical.
6. Hovering a name sets the preview index, which turns the wheel to it.
7. Idle drift: a 12s `ease-in-out` loop of one degree, disabled under reduced motion.
8. The heading becomes `The flywheel`.

- [ ] **Step 3: Generate placeholders for the six rooms**

```bash
python -c "
from PIL import Image
import os
os.makedirs('public/images/rooms', exist_ok=True)
for n in ['01-web','02-app','03-game','04-ai-ml','05-ui-ux','06-engine']:
    p = f'public/images/rooms/{n}.jpg'
    if not os.path.exists(p):
        Image.new('RGB',(1024,1280),(24,26,26)).save(p,'JPEG',quality=70)
        print('placeholder', p)
"
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit && npx eslint src
```
Scroll through the pinned stage with the mouse wheel and confirm all six rooms are reached, the active name widens, and the image melts between rooms. On a 390 wide viewport confirm the stage unpins into the swipe rail.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: six rooms as lit windows, artwork repointed to real desks"
```

---

### Task 7: The Log, DevFest, The Crew

**Files:**
- Create: `src/components/chapters/Log.tsx`, `src/components/chapters/Crew.tsx`
- Modify: `src/components/chapters/DevFest.tsx`, `src/app/page.tsx`
- Delete: `src/components/chapters/Work.tsx`, `src/components/chapters/Credits.tsx`

- [ ] **Step 1: Rename `Work.tsx` to `Log.tsx`**

```bash
git mv src/components/chapters/Work.tsx src/components/chapters/Log.tsx
```

Rename the exported component to `Log`, change the section id to `log`, and change the heading to `The log`. Everything else, including `ScrubFilm` and the `HorizontalPan`, stays exactly as it is: it already works and it already pans on scroll.

- [ ] **Step 2: Rename `Credits.tsx` to `Crew.tsx`**

```bash
git mv src/components/chapters/Credits.tsx src/components/chapters/Crew.tsx
```

Rename the export to `Crew`, the section id to `crew`, the heading to `The crew`. Keep the scroll-following portrait exactly as it is.

- [ ] **Step 3: Repoint DevFest to the night artwork**

In `DevFest.tsx` change both `Image` sources to `/images/devfest/facade-full-wide.jpg` and drop the separate tall variant, using `object-cover` with `object-position: center` at both sizes. Change the section id to `devfest`. Replace the rotating sunburst tween with a slow scale from 1.08 to 1.0 on the same ScrollTrigger, because a photograph should not rotate.

- [ ] **Step 4: Placeholders**

```bash
python -c "
from PIL import Image
import os
os.makedirs('public/images/devfest', exist_ok=True)
p='public/images/devfest/facade-full-wide.jpg'
if not os.path.exists(p):
    Image.new('RGB',(1536,1024),(20,22,24)).save(p,'JPEG',quality=70); print('placeholder',p)
"
```

- [ ] **Step 5: Update `page.tsx` imports and section order**

- [ ] **Step 6: Verify**

```bash
npx tsc --noEmit && npx eslint src
```
Confirm the shelf still pans sideways under vertical scroll, the film still scrubs, and the crew portrait still follows the scroll.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: The Log, DevFest at night, The Crew"
```

---

### Task 8: Dawn

**Files:**
- Create: `src/components/chapters/Dawn.tsx`
- Modify: `src/app/page.tsx`
- Delete: `src/components/chapters/Join.tsx`, `src/components/ui/Faq.tsx`, `src/components/chapters/Archive.tsx`

**Interfaces:**
- Consumes: `inductees.json`, `faq` from `src/content/faq.ts`, `site.inducteesLive`.

- [ ] **Step 1: Write `Dawn.tsx`**

The last chapter merges the join moment and the questions, over the dawn photograph. The inductee search from `Join.tsx` carries over unchanged; the questions become a plain open list underneath, exactly as `Faq.tsx` renders them now.

Structure:
- Full-bleed `dawn/door-wide.jpg` behind, with a scrim.
- `id="dawn"`, `aria-labelledby="dawn-title"`.
- Serif heading: `The list is out.` when `site.inducteesLive`, otherwise `Inductions open once a year.`
- The search field and match list, copied verbatim from the current `Join.tsx`.
- The questions as `<dl>` with all answers visible, copied verbatim from the current `Faq.tsx`, wrapped in `<Reveal stagger={0.05}>`.
- One `Magnetic` mail link at the end.

- [ ] **Step 2: Placeholders**

```bash
python -c "
from PIL import Image
import os
os.makedirs('public/images/dawn', exist_ok=True)
for n,s in [('door-wide',(1536,1024)),('door-tall',(1024,1536))]:
    p=f'public/images/dawn/{n}.jpg'
    if not os.path.exists(p):
        Image.new('RGB',s,(206,214,210)).save(p,'JPEG',quality=70); print('placeholder',p)
"
```

- [ ] **Step 3: Move the archive lanes to `/gallery` only**

`src/app/gallery/page.tsx` currently imports `Archive`. Inline the lane markup into a new `src/app/gallery/GalleryLanes.tsx` client component, then delete `src/components/chapters/Archive.tsx`. The home page no longer has a gallery chapter.

- [ ] **Step 4: Update `page.tsx` to the final seven plus the colophon**

```tsx
<WirePath />
<Dusk />
<Society />
<Rooms />
<Log />
<DevFest />
<Crew />
<Dawn />
<Colophon />
```

- [ ] **Step 5: Verify**

```bash
npx tsc --noEmit && npx eslint src && npx next build
```
Confirm the build is static across all routes, `/gallery` still renders its lanes and lightbox, and the home page has exactly seven chapter ids matching `chapters.ts`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: Dawn closes the night, gallery moves to its own route"
```

---

### Task 9: Full pass and the artwork handoff

**Files:**
- Modify: `DESIGN.md`, `PRODUCT.md`, `README.md`, `src/components/motion/README.md`

- [ ] **Step 1: Rewrite `DESIGN.md` for The Night Shift**

Replace the atelier description with: the story, the two-tier tokens with both themes, the seven chapters and their times, the artwork rule, and the motion vocabulary including the boat and the ambient loops.

- [ ] **Step 2: Update `PRODUCT.md`**

Replace the maison brand personality with the night-shift one. Keep the audiences and the accessibility section as they are.

- [ ] **Step 3: Run the verification matrix in the browser**

At 1440x900 and 390x844, in both themes, with normal and reduced motion:

1. Mouse wheel scrolls the page on every route.
2. The clock runs 18:42 to 05:58 without going backwards.
3. Every chapter is reachable and readable.
4. The theme toggle flips both ways and survives a reload.
5. No console errors.
6. Keyboard alone can reach the menu, the toggle, the rooms index and the inductee search.

- [ ] **Step 4: Check the media budget**

```bash
du -sh public/images public/video
```
Expected: under 3MB of images actually referenced by the home page. Convert anything oversized:

```bash
python -c "
from PIL import Image
import glob, os
for f in glob.glob('public/images/**/*.jpg', recursive=True):
    if os.path.getsize(f) > 400_000:
        im = Image.open(f); im.save(f, 'JPEG', quality=82, optimize=True, progressive=True)
        print('recompressed', f, os.path.getsize(f)//1024, 'KB')
"
```

- [ ] **Step 5: Confirm no banned patterns crept in**

```bash
grep -rn "—\|–" src/ DESIGN.md PRODUCT.md README.md docs/superpowers/specs/2026-09-07-devsoc-night-shift-design.md
grep -rn "backdrop-blur\|backdrop-filter" src/
grep -rn "cream\|beige\|#fff9\|paper-bg" src/
```
All three must return nothing.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "docs: DESIGN and PRODUCT describe The Night Shift"
```

---

### Task 10: Artwork drop-in

Runs whenever generated images arrive. Repeatable.

- [ ] **Step 1: Place the files**

Save each file at the exact path in the checklist at the end of `docs/assets/night-shift-prompts.md`, overwriting the placeholder.

- [ ] **Step 2: Compress and verify dimensions**

```bash
python -c "
from PIL import Image
import glob, os
for f in sorted(glob.glob('public/images/**/*.jpg', recursive=True)):
    im = Image.open(f)
    print(f, im.size, os.path.getsize(f)//1024, 'KB')
    if os.path.getsize(f) > 400_000:
        im.convert('RGB').save(f,'JPEG',quality=82,optimize=True,progressive=True)
"
```
Landscape files should be wider than tall, portrait files taller than wide. If any is the wrong orientation, regenerate rather than crop.

- [ ] **Step 3: Look at every chapter in the browser in both themes**

Any image that reads as a render rather than a photograph goes back for regeneration. The test: does it look like someone took it on a phone in a real room.

- [ ] **Step 4: Commit**

```bash
git add public/images
git commit -m "feat: night shift artwork"
```

---

## Self-review

**Spec coverage.** Story and copy, Task 4 and 5. Seven chapters, Tasks 4 to 8. Night clock, Task 2. Two themes and the two-tier tokens, Task 1. Layout grammar, applied inside each chapter task and checked in Task 9. Motion including ambient loops and the boat, Task 3. Artwork rule and the fourteen images, Task 10 plus the prompts file. What carries forward, honoured by renaming rather than rewriting in Tasks 6 and 7. Success criteria, verified in Task 9 steps 3 to 5.

**Placeholders.** None. Every code step carries the code. Every verification step names the command and the expected result.

**Type consistency.** `Theme`, `THEME_KEY`, `themeBootScript`, `useTheme` defined in Task 1 and used in Tasks 1 and 4. `Chapter`, `chapters`, `formatNightTime` defined in Task 2 and used in Tasks 2, 3 and 5. `Ambient` and `WirePath` defined in Task 3 and used in Tasks 3, 5, 6 and 8. Section ids `dusk`, `society`, `rooms`, `log`, `devfest`, `crew`, `dawn` are identical in `chapters.ts` and in every chapter component.

**One gap worth naming.** Task 1 Step 6 rewrites colour classes across roughly twenty files at once. It is mechanical and the grep at the end proves it complete, but it is the single largest-blast-radius step in the plan and deserves its own review before Task 2 starts.
