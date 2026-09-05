# DevSoc Website 2026: Design Spec

Date: 2026-09-05
Status: awaiting approval
Repo: new (this folder). Old site: github.com/Devsoc-BPGC/DevSoc-Website-25, live at devsoc.club
Motion reference: github.com/MananBafna/folio-001 (Lenis + GSAP choreography, ported React Bits effects)
Inspo: `/inspo` (dark cinematic hero comps, type behind chrome objects, side rails, mono labels, film-frame chrome)

## 1. Direction

One sentence: an atelier of instruments in an obsidian room, lit by a single verdigris light, where every vertical is an instrument in the collection and every chapter is a scene you scroll through.

Personality: DevSoc as a maison. Goa was a port for five centuries and navigators arrived with brass instruments; the society still ships. The hero subject is a hovering armillary sphere (the instrument that finds the way). Each of the six rooms holds one instrument: the Loom (web), the Chronometer (app), the Automaton (game), the Orrery (AI and ML), the Lens (UI and UX), the Movement (engine). Materials are brushed brass with verdigris patina, liquid chrome and smoked glass, photographed like a luxury watch campaign. Not steampunk: no copper-brown, no Victorian ornament. Chapter names follow the maison: the Collection, the Ledger, the Salon, the Makers, the Archive, the Door.

Hero line: "Goa has always been a port. We still ship."

Visual world (commit, no middle ground): cinematic noir editorial. It borrows exactly these from the UX Planet style list and nothing else:

| # | Style | What we take | Where it lives |
|---|-------|--------------|----------------|
| 3 | Aurora | one soft, moving field of coloured light behind the subject | ambient light per room, never a rainbow gradient |
| 4 | Ethereal | gauze, low-contrast serif statements, feathered edges | serif voice lines, image scrims |
| 17 | Art Deco | brass hairlines, symmetry, sunburst geometry | frame chrome, DevFest chapter |
| 22 | Bauhaus | strict 12 column grid, primary shapes as structure | manifesto grid, layout skeleton |
| 32 | Pointillism | images and marks built from dots | hero particle braces, footer wordmark, film grain |
| 38 | Utilitarian | mono metadata, tables, no decoration | nav, captions, timecode, event table, inductee list |
| 49 | Modular Typography | letterforms as blocks, variable width as a live axis | expanded display type, index that widens when active |

Not a SaaS site, not a tech startup site. No cards, no pills, no eyebrows, no icon grids, no gradient buttons, no glass panels, no purple.

## 2. Tokens

### Colour (OKLCH, dark only; no theme toggle)

| Token | Value | Role |
|-------|-------|------|
| `--obsidian` | `oklch(0.13 0.008 60)` | page ground, warm near-black |
| `--soot` | `oklch(0.20 0.008 60)` | raised surfaces, frames |
| `--bone` | `oklch(0.93 0.02 85)` | primary type |
| `--ash` | `oklch(0.66 0.015 80)` | secondary type, inactive index |
| `--verdigris` | `oklch(0.72 0.11 185)` | the light. Brand teal aged into patina |
| `--verdigris-deep` | `oklch(0.45 0.08 190)` | duotone shadows, ambient |
| `--ember` | `oklch(0.70 0.17 50)` | counter-light. One use per screen at most |
| `--brass` | `oklch(0.78 0.09 85)` | hairlines, focus ring, Deco geometry |

Rule: one light source per screen. Verdigris is ambient everywhere. Ember appears only in the hero object reflections, the DevFest chapter, and the Join CTA underline.

### Type (next/font/google, self-hosted by Next)

| Role | Face | Setting |
|------|------|---------|
| Display | Archivo variable, wdth 125, wght 800 to 900, uppercase | wordmarks, chapter titles, index. Leading 0.86 |
| Voice | Instrument Serif italic | one-line statements over images, pull lines. Never body |
| Technical | Martian Mono, wdth 75 to 100, wght 300 to 500 | nav, labels, numerals, metadata, tables |
| Body | Archivo wdth 100 wght 400 | 17px / 1.55, bone at 86% |
| HUD | DotGothic16 | only the frame timecode and scroll counter |

If licences exist for Wild World (display), Heming or Disket Mono (technical), drop them in `public/fonts` and the tokens swap. Otherwise the Google faces above ship.

### Spacing, radius, motion

- Gutter `clamp(1.25rem, 4vw, 4rem)`. Chapter padding varies on purpose: hero 0, manifesto 18vh, verticals 0 (pinned), work 12vh, DevFest 0 (full bleed), people 14vh, archive 8vh, join 22vh.
- Radius: 0 everywhere except the ScrollExpand frame (24px collapsing to 0) and the cursor ring.
- Motion: Lenis duration 1.2, exponential ease. Reveals 0.9 to 1.4s, `power3.out` or `expo.out`. Scrubs `scrub: 1.2`. Hover 0.6s `[0.22, 1, 0.36, 1]`. Cursor follow 0.18s. No bounce, no elastic, no spring anywhere. Reduced motion: static, all content visible without JS.

## 3. Motion vocabulary (the "tools" folder)

`src/components/motion/` holds reusable, documented pieces. Each has a README block and a demo route at `/lab` (dev only).

| Component | Source | What it does |
|-----------|--------|--------------|
| `SmoothScroll` | lenis/react | Lenis provider wired to GSAP ticker and ScrollTrigger |
| `Cursor` | folio port | bone dot, difference blend, grows to a ring with a mono label on `[data-cursor]` |
| `Magnetic` | folio port | quickTo pull, strength 22, used on one CTA per page |
| `SplitLines` | GSAP SplitText | masked line rise, stagger 0.07 |
| `ScrollExpand` | folio port of React Bits | clip-path frame 46% to 100% with hold, media zoom 1.3 to 1 |
| `ParticleText` | folio port | canvas word made of dots, gathers, drifts, repels cursor |
| `LiquidImage` | new, three.js | shader plane; crossfades textures with flow-noise displacement; pointer velocity feeds a ripple buffer. The "liquid cursor reactive image swap" |
| `PointField` | new, three.js | ~6k points that settle into a target shape (the braces), slow drift, gentle cursor repulsion |
| `MaskReveal` | new, motion (Framer) | cursor-following organic blob clip-path reveals a colour layer over a duotone layer |
| `Carousel` | embla-carousel-react + wheel gestures | free-drag horizontal rail, mono arrows, progress hairline |
| `FrameChrome` | new | brass corner marks and DotGothic timecode bound to scroll progress |
| `Duotone` | new, CSS | image graded to obsidian/verdigris via mix-blend and filter, resolves to colour on state |

three.js budget: `LiquidImage` and `PointField` only. Nothing spins, nothing floats for its own sake.

## 4. Site map

- `/` home: nine chapters (below)
- `/projects` full shipping log with a mono text filter by vertical
- `/team` full credits roll
- `/gallery` all photos in lanes plus lightbox
- `/inductees` searchable alphabetical list (186 names), copy ID on hover
- `/lab` motion tools demo (dev only, not in nav)

Navigation: top-left the DS mark (SVG). Top-right the word "Menu" in mono plus the timecode. Menu overlay: full-screen obsidian, links stacked in expanded display at 9vw, hovering a link swaps a `LiquidImage` preview at right, socials in a mono row at the bottom. On home desktop a left rail lists chapters vertically in mono; the active chapter is bone, others ash. No sticky blurred navbar.

## 5. Home chapters

### 0. Overture (once per session, under 1.4s, skippable)
Obsidian. A mono frame counter ticks 00 to 24 top-right. The two brace glyphs slide in from the left and right edges and stop, framing empty space. The veil lifts straight into the hero, where the chrome braces already occupy the same spot. Not shown again in the session.

### 1. Hero: the mark
12 column grid, full viewport.
- DEVSOC in display at about 22vw, spanning all columns, baseline near 62% height, bone.
- Generated armillary sphere centred slightly right, in front of the letters V and S so it partially occludes them (type behind object, as in the inspo).
- Left rail (col 1): vertical mono chapter index doubling as anchor nav.
- Bottom-left (cols 1 to 5): serif voice line "Goa has always been a port. We still ship." with the mono sub-line "The developers' society of BITS Pilani, Goa" plus one underlined mono link "Open the collection".
- Bottom-right (cols 9 to 12): mono metadata block: founding year, campus, "186 inducted in 2026", "DevFest 4.0".
- Frame chrome: brass corner marks at 24px inset, DotGothic timecode top-right that advances with scroll.
- Behind everything: `PointField` dots that settle into the outline of the braces, offset behind the object, very dim.

Motion: letters rise through a baseline mask (1.2s, stagger 0.07). Object un-blurs and drifts into place (1.6s). Dots gather (2s). Idle: object breathes 1% over 8s and rotates 2 degrees over 20s. Pointer: object parallax 12px, letters 4px the other way, ripples on the object texture via `LiquidImage`. Scroll out: the object scales to 1.35 while DEV parts left and SOC parts right like curtains, and the manifesto's first line rises through the gap.

Mobile: portrait object crop, wordmark stacks DEV over SOC, rail hidden, metadata under the voice line.

### 2. Manifesto: what this is
Bauhaus grid. Three declarative statements placed asymmetrically on 12 columns, each anchored by a large mono numeral used as structure, not as an eyebrow.
1. "We build the software the campus runs on."
2. "Fest websites, fest apps, and the tools students open every day."
3. "Inductions once a year. Seniors teach, then hand over."

Then `ScrollExpand`: a 46% frame grows to full bleed with a real group photo from the archive, graded duotone, resolving to colour at full bleed. Voice line over it fades out on the way: "Shipping from the Goa campus since {founding year}."

### 3. Verticals: six rooms (the unique portrayal)
Pinned stage, 600vh of scroll, six states.
- Left (cols 1 to 5): index of six names stacked in display type, ash. The active one turns bone and widens from wdth 100 to 125 on the variable axis, scrubbed. Modular typography as a live control.
- Right (cols 6 to 12): a 4:5 `LiquidImage` frame showing that room's specimen. Bottom-left of the frame, a serif voice line. Under the frame, a mono row: room number, head, tools, current build.
- Ambient: one faint verdigris radial that moves to a new position per room (the aurora light).
- Scroll scrubs through the six. Each change is a liquid crossfade; pointer movement adds ripples. Hovering an index name previews that room; leaving returns to the scrolled state.

| Room | Name | Instrument | Voice line | Head |
|------|------|------------|-----------|------|
| 01 | Web Development | The Loom | Every fest opens in a browser first. | Tanay Sheth |
| 02 | App Development | The Chronometer | The timetable lives in a pocket. | Satvik Srinivas |
| 03 | Game Development | The Automaton | Frames, physics, and someone's first boss fight. | Anvesh Mishra |
| 04 | AI and ML | The Orrery | Models trained on campus problems. | Umang Goel |
| 05 | UI and UX | The Lens | The part people think is the whole thing. | Rishika Gupta |
| 06 | Engine Development | The Movement | Below the framework. Bare metal, C++, the parts nobody sees. | to confirm |

Mobile: unpinned. Each room is a full-width frame; the six specimens ride an Embla carousel with the index as the caption.

### 4. Work: the shipping log
Intro: the existing phone video (CSA Times) inside the frame chrome, scrubbed by scroll over 200vh.
Then a free-drag `Carousel` of tall 3:4 tiles. Each tile: image under `MaskReveal` (duotone to colour inside the cursor blob), title in display, year and vertical in mono. Items: Waves fest website, Waves fest app, Class Sync, Maestro, DevFest site, client work. Link "Open the full log" to `/projects`.

### 5. DevFest: the flagship
Full bleed. Art Deco symmetry: generated poster image centred, DEVFEST in display, "4.0" in serif italic, mono row with venue, sponsor line, hackathon count. A brass hairline sunburst SVG turns one degree per 100px of scroll. Ember allowed here.
Below: recurring events as a utilitarian mono table: Quark (BITS Goa technical fest), workshops, sessions, inductions. Dates are data columns.

### 6. People: credits
A credits roll. One row per person: name in display at 6vw, role in mono right-aligned, brass hairline between rows. Hovering a row shows that person's portrait (existing PNGs, duotone) in a fixed `LiquidImage` frame at right, swapping liquidly. Rows rise on masked lines as you scroll. Order: Chief Coordinator, Sub-Coordinator, then heads in room order. Link "Everyone" to `/team`.

### 7. Archive: gallery
Desktop: three lanes of the 23 real photos at 0.8x, 1x and 1.25x scroll speed, duotone at rest, `MaskReveal` to colour, click opens a lightbox with liquid crossfade between photos. Mobile: one lane. Link "Open the archive" to `/gallery`.

### 8. Join, and the inductees moment
Config flag `inductees.live`.
- On: full-width moment. Serif "The 2026 list is out." Mono search field filters names inline and links to `/inductees`.
- Off: serif "Inductions open once a year. Until then, come to DevFest." with the email as the single underlined, magnetic CTA.

### 9. Colophon
Oversized DEVSOC `ParticleText` wordmark that scatters from the cursor and re-forms. Mono rows: GitHub, LinkedIn, Instagram, YouTube, devsocbpgc@gmail.com, K.K. Birla Goa Campus, copyright line, "Built by the Web room".

## 6. Copy rules
Declarative, specific, short. No em or en dashes anywhere (site copy, code comments, docs). No "empowering", "innovative", "seamless", "cutting-edge", "future of". Numbers are data and get mono. Section titles are nouns, not slogans.

## 7. Architecture

Stack: Next.js 15 App Router, TypeScript, Tailwind v4 (tokens in `@theme`), GSAP 3.13 with `@gsap/react` (ScrollTrigger, SplitText, Flip, Observer), `lenis`, `three` with `@react-three/fiber` and `@react-three/drei`, `motion`, `embla-carousel-react` plus wheel gestures, `next/font`, `sharp`, `clsx`. Dev: eslint, prettier, Playwright.

```
src/
  app/            routes, layout, fonts, metadata, /lab
  components/
    motion/       the tools table above, each with a README block
    chapters/     Hero, Manifesto, Rooms, Work, DevFest, Credits, Archive, Join, Colophon
    shell/        Nav, Menu, Rail, FrameChrome, Cursor, Overture
    ui/           TextLink, MonoTable, Lightbox
  content/        verticals.ts, projects.ts, people.ts, events.ts, faq.ts, gallery.ts, site.ts, inductees.json
  lib/            gsap.ts (plugin registration), easings.ts, media.ts, useReducedMotion.ts
  styles/         globals.css (tokens, grain, duotone, selection)
public/
  images/{hero,rooms,work,devfest,people,gallery}
  fonts/          optional licensed faces
```

Data flow: all copy and lists live in `src/content`, typed. Chapters read content and render server-side; motion components are client components that enhance already-visible DOM. Feature flags in `site.ts`.

Error handling: every WebGL component checks for context and falls back to a static `<img>` with the same framing. Fonts load with `display: swap` and metric fallbacks. Missing generated assets fall back to a flat verdigris-lit placeholder so the layout never breaks during the asset handoff.

Performance: next/image AVIF, hero image preloaded, room textures loaded when the stage is within one viewport, three canvases pause off-screen, `content-visibility: auto` on later chapters. Mobile drops `PointField` and swaps `LiquidImage` for a CSS crossfade. Target Lighthouse performance 85+ desktop with effects on.

Accessibility: bone on obsidian is AAA, ash is at least 4.5:1. Brass 1px focus ring, offset 4px. Every scrubbed or pinned section has a static reduced-motion layout. Carousel and lightbox are keyboard operable. Menu traps focus.

Testing: Playwright smoke per route (renders, no console errors, reduced-motion screenshot). Manual QA in the in-app browser at 1440, 1024 and 390 widths, and a scroll-through recording before handoff.

## 8. Assets

### Reused from the old repo
Seven coordinator PNGs, 23 gallery photos, project images (Waves, Class Sync, Maestro, client, fest app), the CSA Times phone video, the DS logo PNG (traced to SVG).

### To generate (GPT)
Full copy-paste prompts, filenames and sizes live in `docs/assets/image-prompts.md`. Fourteen images: hero armillary sphere (wide and tall), six instruments, DevFest sunburst (wide and tall), the atelier workbench, the key, two macro textures.

### Facts to confirm
Founding year, Engine Development head, DevFest 4.0 date and sponsor line, whether the inductees list should be live at launch, vector logo file if one exists.

## 9. Alternatives considered

Palette: obsidian with vermilion (closest to the inspo, but black and red is the most common comp in that folder); graphite with chrome and violet (reads as the AI purple default). Chosen: verdigris and ember, because it ages the brand teal into something that feels lit rather than coloured, and the teal and amber pairing is the cinematic grade itself.

Verticals: a horizontal pinned pan of six full-bleed chambers (folio's doctrine pattern, heavy on mobile); a hue-shifting type wall (typographic but no image swap). Chosen: the six-room pinned stage, because it gives the liquid image swap a reason to exist and keeps all six visible as an index.
