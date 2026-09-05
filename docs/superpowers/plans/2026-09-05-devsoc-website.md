# DevSoc Website 2026 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Spec: `docs/superpowers/specs/2026-09-05-devsoc-website-design.md`.

**Goal:** Ship the new devsoc.club as a cinematic scrollytelling Next.js site with a reusable motion toolset and content-driven chapters.

**Architecture:** Server-rendered chapters read typed content from `src/content`; client motion components in `src/components/motion` enhance DOM that is already visible. Two three.js pieces only (LiquidImage, PointField). GSAP ScrollTrigger drives scrubs and pins, Lenis drives scroll, motion (Framer) drives hover mask reveals and overlay transitions.

**Tech Stack:** Next.js (App Router, TypeScript), Tailwind v4, GSAP 3.13 + @gsap/react, lenis, three + @react-three/fiber + @react-three/drei, motion, embla-carousel-react + wheel gestures, next/font, sharp.

## Global Constraints

- Dark only. Tokens: obsidian `oklch(0.13 0.008 60)`, soot `oklch(0.20 0.008 60)`, bone `oklch(0.93 0.02 85)`, ash `oklch(0.66 0.015 80)`, verdigris `oklch(0.72 0.11 185)`, verdigris-deep `oklch(0.45 0.08 190)`, ember `oklch(0.70 0.17 50)`, brass `oklch(0.78 0.09 85)`.
- Fonts: Archivo (wdth axis) display and body, Instrument Serif italic voice, Martian Mono (wdth axis) technical, DotGothic16 HUD only.
- Motion: Lenis duration 1.2. Reveals 0.9 to 1.4s `power3.out`/`expo.out`. Scrub 1.2. Hover 0.6s cubic-bezier(0.22, 1, 0.36, 1). No bounce, elastic or spring.
- Copy: no em or en dashes anywhere, no pills, eyebrows, cards, icon grids, gradient buttons, glass.
- One light source per screen; ember at most once per screen.
- All content visible without JS. Reduced motion renders static.
- Every WebGL component falls back to a static image.

---

## File structure

```
src/app/layout.tsx            fonts, metadata, shell providers
src/app/page.tsx              home: nine chapters
src/app/projects/page.tsx     shipping log
src/app/team/page.tsx         credits roll
src/app/gallery/page.tsx      lanes + lightbox
src/app/inductees/page.tsx    search list
src/app/lab/page.tsx          motion tools demo (dev only)
src/styles/globals.css        @theme tokens, base, grain, duotone, selection
src/lib/gsap.ts               registerPlugin once, exports gsap, ScrollTrigger, SplitText
src/lib/easings.ts            EASE_OUT (cubic-bezier array + css string), durations
src/lib/useReducedMotion.ts   hook
src/lib/useIsFinePointer.ts   hook
src/content/site.ts           flags, socials, contact, founding year
src/content/verticals.ts      six rooms
src/content/projects.ts       shipping log items
src/content/people.ts         coordinators
src/content/events.ts         DevFest + recurring events table
src/content/faq.ts            FAQ copy
src/content/gallery.ts        photo manifest
src/content/inductees.json    186 names
src/components/motion/SmoothScroll.tsx
src/components/motion/Cursor.tsx
src/components/motion/Magnetic.tsx
src/components/motion/SplitLines.tsx
src/components/motion/ScrollExpand.tsx
src/components/motion/ParticleText.tsx
src/components/motion/LiquidImage.tsx
src/components/motion/PointField.tsx
src/components/motion/MaskReveal.tsx
src/components/motion/Carousel.tsx
src/components/motion/FrameChrome.tsx
src/components/motion/Duotone.tsx
src/components/motion/README.md
src/components/shell/Nav.tsx, Menu.tsx, Rail.tsx, Overture.tsx, Mark.tsx
src/components/chapters/Hero.tsx, Manifesto.tsx, Rooms.tsx, Work.tsx, DevFest.tsx, Credits.tsx, Archive.tsx, Join.tsx, Colophon.tsx
src/components/ui/TextLink.tsx, MonoTable.tsx, Lightbox.tsx, Faq.tsx
public/images/{hero,rooms,work,devfest,people,gallery}, public/video, public/fonts
```

---

### Task 1: Scaffold and toolset
**Files:** package.json, next.config.ts, tsconfig.json, `src/styles/globals.css`, `src/lib/*`, `.gitignore`, `README.md`
- [ ] `create-next-app` (TS, Tailwind, ESLint, App Router, src dir, turbopack) into a temp dir, copy into repo root.
- [ ] Install: gsap @gsap/react lenis three @react-three/fiber @react-three/drei motion embla-carousel-react embla-carousel-wheel-gestures clsx sharp; dev: @types/three prettier.
- [ ] Tokens in `globals.css` via `@theme`; fonts via `next/font/google` in `layout.tsx` exposing CSS vars `--font-display`, `--font-voice`, `--font-mono`, `--font-hud`.
- [ ] `lib/gsap.ts` registers ScrollTrigger, SplitText, Flip, Observer once. `lib/easings.ts` exports `EASE_OUT_CSS`, `EASE_OUT_ARR`, `DUR`.
- [ ] Copy old assets into `public/`. Verify: `npm run dev` renders a token swatch page with the four fonts.
- [ ] Commit.

### Task 2: Content layer
**Files:** `src/content/*`
**Produces:** `Vertical { id, index, name, short, voice, head, tools[], build, image }`, `Project { id, title, year, vertical, image, blurb, href? }`, `Person { id, name, role, image, link, room? }`, `Event { name, kind, when, note }`, `site { foundedYear, inducteesLive, socials, email, campus }`.
- [ ] Type and fill from the old repo. Founding year and Engine head are `null` until confirmed; renderers omit them when null.
- [ ] Commit.

### Task 3: Motion tools (each with README block and `/lab` demo)
- [ ] `SmoothScroll`: Lenis via `lenis/react` `ReactLenis root`, `lenis.on('scroll', ScrollTrigger.update)`, gsap ticker drives raf, `lagSmoothing(0)`.
- [ ] `Cursor`: fixed dot (8px bone, mix-blend difference), `quickTo` 0.18s; `[data-cursor]` grows ring 56px; `[data-cursor-label]` shows mono label. Fine pointer only.
- [ ] `Magnetic`: wraps children; `quickTo` x/y 0.4s strength 22.
- [ ] `SplitLines`: SplitText by lines with mask, gsap from yPercent 110 to 0, 1.1s, stagger 0.07, ScrollTrigger start `top 85%`, once.
- [ ] `ScrollExpand`: port of folio `scrollExpand`. Props `media`, `startWidth`, `startHeight`, `scrollDistance`, `holdDistance`, `title`, `children` overlay.
- [ ] `ParticleText`: port of folio `initParticleMast` to a React canvas component. Props `text`, `color`, `highlightColor`, `density`, `particleSize`.
- [ ] `LiquidImage`: R3F canvas, one plane, shader with `uTexA`, `uTexB`, `uMix`, `uDisp` (ripple buffer via ping-pong render targets), pointer velocity injects ripples; `crossfadeTo(index)` via ref; falls back to `<img>` crossfade without WebGL or on mobile.
- [ ] `PointField`: R3F points (6000), targets sampled from an SVG path of the braces rendered to an offscreen canvas; slow drift noise, cursor repulsion radius 120px; static on mobile.
- [ ] `MaskReveal`: motion `useMotionValue` x/y, `clip-path: circle(r at x y)` with organic wobble via 3 summed sines on r; base layer duotone, top layer colour.
- [ ] `Carousel`: Embla with wheel gestures, free drag, mono prev/next buttons, hairline progress.
- [ ] `FrameChrome`: four brass corner marks + DotGothic timecode `HH:MM:SS` from ScrollTrigger progress of the page.
- [ ] `Duotone`: CSS class utility: `filter: grayscale(1) contrast(1.05)`; overlay `verdigris-deep` with `mix-blend-mode: color`; `.is-color` resolves.
- [ ] Commit after each pair.

### Task 4: Shell
- [ ] `Mark` SVG (traced braces + DS). `Nav`: mark left, "Menu" + timecode right. `Menu` overlay with stacked display links and `LiquidImage` preview. `Rail` section-aware index (IntersectionObserver). `Overture` once per session (sessionStorage), under 1.4s, skippable on click/keypress.
- [ ] Commit.

### Task 5: Hero
- [ ] Layout per spec section 5.1; entry timeline; pointer parallax; scroll-out curtain split; mobile stack. Placeholder object until A1 arrives.
- [ ] Verify in browser at 1440 and 390. Commit.

### Task 6: Manifesto and Rooms
- [ ] Manifesto grid with three statements + ScrollExpand of a gallery photo.
- [ ] Rooms pinned stage: 600vh pin, index widening via `font-variation-settings` scrubbed, `LiquidImage` swap on state change, hover preview, mobile carousel.
- [ ] Verify scroll, commit.

### Task 7: Work, DevFest, Credits
- [ ] Work: scrubbed video in FrameChrome + Carousel of MaskReveal tiles.
- [ ] DevFest: full bleed poster, brass sunburst SVG rotation scrub, mono events table.
- [ ] Credits roll with hover portrait swap.
- [ ] Commit.

### Task 8: Archive, Join, Colophon, FAQ
- [ ] Archive lanes with parallax speeds and lightbox; Join with flag; Colophon with ParticleText; FAQ as hairline list under Join.
- [ ] Commit.

### Task 9: Subpages
- [ ] `/projects`, `/team`, `/gallery`, `/inductees`, `/lab`. Metadata and OG.
- [ ] Commit.

### Task 10: QA
- [ ] Reduced motion pass, keyboard pass, 390/1024/1440 screenshots, console clean, `npm run build` passes, Lighthouse desktop.
- [ ] Commit, write README with asset handoff instructions.
