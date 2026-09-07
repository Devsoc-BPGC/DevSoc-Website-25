# Design system: DevSoc 2026

## The idea

The site is one night on the Goa campus, dusk to dawn. The campus sleeps and six rooms stay lit, one per vertical. Seven chapters carry the night, named rather than timestamped, and the last one hands you the door.

Everything on the page serves that: the artwork is one building seen at different hours, the accent colour is a lit window, and the only thing the reader is ever asked to click is a wall of dark windows they can light.

Named reference: a screen printed poster of a building at night, crossed with the dark cinematic hero comps in `/inspo` (massive expanded type behind an object, mono labels on the rails, film frame corner marks with a timecode). Layout grammar borrowed from `docs/reference/zainabkabira-design.md`. Its subject matter deliberately not borrowed: no aurora, no starfield, no palms, no paper plane.

## Dials

DESIGN_VARIANCE 8 · MOTION_INTENSITY 7 · VISUAL_DENSITY 3

## Colour

Two tiers, in `src/styles/globals.css`. Tier one is the palette and is never referenced by a component. Tier two is the semantic role, and the theme swaps that tier and nothing else, so no component knows which theme it is in.

Palette:

| Token | Value | What it is |
|---|---|---|
| `--c-obsidian` | oklch(0.13 0.008 60) | warm near black, the night ground |
| `--c-soot` | oklch(0.20 0.008 60) | raised surfaces, frames |
| `--c-bone` | oklch(0.93 0.02 85) | type on the night ground |
| `--c-ash` | oklch(0.66 0.015 80) | secondary type |
| `--c-verdigris` | oklch(0.72 0.11 185) | the brand teal, aged |
| `--c-verdigris-deep` | oklch(0.45 0.08 190) | duotone shadow, ambient fields |
| `--c-ember` | oklch(0.70 0.17 50) | the lit window |
| `--c-brass` | oklch(0.78 0.09 85) | hairlines, focus ring |
| `--c-haze`, `--c-haze-2` | oklch(0.94 0.012 170), oklch(0.90 0.016 170) | morning ground |
| `--c-ink`, `--c-slate` | oklch(0.22 0.02 200), oklch(0.50 0.02 200) | type in the morning |

Roles: `--bg-base`, `--surface-raised`, `--text-primary`, `--text-muted`, `--accent-light`, `--accent-warm`, `--rule-color`, `--scrim`, `--grade`.

Two themes. **Night is the default and is unconditional**: an OS light preference does not override it, only the toggle does, and the choice is written to `localStorage` and replayed by an inline head script before first paint. Morning keeps the same roles on a pale sea green ground. One light source per screen in both.

## Type

- Display: Archivo variable, wdth 125, wght 800 to 900, uppercase. Wordmark, chapter titles, the flywheel index. Leading 0.86, tracking -0.02em.
- Voice: Bodoni Moda italic. One line statements over images and pull lines. Never body.
- Metadata: Space Grotesk, not a monospace. Nav, labels, numerals, tables, captions. 13px, tracked 0.045em, tabular numerals. A mono here was the loudest thing on quiet pages: even rhythm, wasted width, and it made every caption look like console output.
- Body: Archivo, wdth 100, wght 400. 17px / 1.6, max 68ch.
- HUD: DotGothic16, only the film timecode.

## The seven chapters

| Id | Chapter | What happens |
|---|---|---|
| `dusk` | Dusk | The facade fills the frame, six windows lit, the wordmark over it. |
| `society` | The Society | The one tonal inversion. Ink floods the pinned stage and the page turns over, ground and type, while the board settles. |
| `rooms` | The Flywheel | The six verticals on a wheel that scroll turns. |
| `log` | The Log | The fest app film scrubs, then the shelf of projects pans sideways. |
| `devfest` | DevFest | The same building with every window lit. |
| `crew` | The Crew | The credits roll, the portrait follows the scroll. |
| `dawn` | Dawn | The door is open. The list, the wall of windows, the questions. |

The night is carried by the artwork, the chapter names and the order, not by a readout. An earlier version ran a clock in the nav from 18:42 to 05:58; it was a caption explaining a story the pictures already tell, so it is gone.

`src/content/chapters.ts` is the single source of these ids, names and light positions. The rail, the nav label and the ambient light all read from it, so a chapter cannot drift out of sequence with itself.

## Artwork

**The lit facade.** One building through one night, drawn straight on like an elevation: a flat grid of windows, most dark, some filled solid amber. Each lit window is a room where somebody is building. The hero has six lit, DevFest has every window lit, Dawn has them out with one door open and light falling from it. The morning hero is the same wall at the same angle, so the theme toggle reads as time passing rather than as a palette swap.

**Six posters**, one per vertical: a flat colour field with one simple object and a soft contact shadow. A browser window, a phone, a controller, a node graph, stacked artboards, a gear. The object is the whole idea. These ride in the flywheel.

Prompts, with exact pixel sizes and ratios, in `docs/assets/PROMPTS-COPY-PASTE.md` and `docs/assets/HERO-PROMPTS.md`.

Archive photographs arrive graded to verdigris and lift into colour as scroll carries them to the middle of the screen. Project screenshots lift only part way, so their own colour never overruns the page. Photographic assets are capped at 2400px on the long edge; screenshots and portraits are JPEG, not PNG.

## Layout

12 column grid, gutter `clamp(1.25rem, 4vw, 4rem)`. Chapter padding varies on purpose. Radius 0 everywhere except the wheel, the cursor ring and the window tiles. No cards. Brass hairlines only where they separate real rows.

Sections do not meet on a straight edge: `WaveDivider` raises the next ground into the current one on a soft curve, alternating crest and trough.

## Motion

The page opens on the wordmark. DEVSOC has six letters and the society has six rooms, so the six letters light one at a time, each with a short warm flash, the way a window does when somebody switches a lamp on. Then the veil wipes up into the hero, where the same six are lit on the face of the building. It runs once per session, about two seconds, and any click or key skips it.

Scroll drives the page, and every chapter plays itself. The flywheel turns a sixth of a revolution per vertical and the spoke at the tick is the one you are reading. The shelf of projects pans sideways under vertical scroll and each tile grows as it crosses the middle. Photographs lift out of the grade at the middle of the screen. The credits portrait follows whichever name is level with the middle. The film scrubs. Hover refines what scroll has already shown; clicks are for navigation and for lighting a window.

One section inverts. The Society pins and ink floods it diagonally through a grainy dissolving edge until ground and type have swapped, which is the thing the copy says: work done in the dark is what the campus sees in daylight. It is the only tonal inversion on the site, and that is what makes it land. The fixed chrome steps out while the flood crosses and returns in the opposite tone, because holding it half legible through a full-screen inversion is worse than hiding it. The board of facts settles like a departure board once the ink has crossed it.

Two things run on their own clock, and only ever one per viewport: the ambient light field breathing behind each chapter, and a Perlin noise flow field drifting behind the footer type. The footer is the one place nothing else is moving, which is why the flow field lives there and nowhere else.

Images never warp. `LitImage` swaps one plate for the next on a grain sweep with both plates perfectly straight, because a lens ripple across a face reads as a defect rather than an effect. What the pointer carries instead is a light: where it falls the grade lifts and the picture warms, which is the same gesture as lighting a window.

Lenis 1.2s duration on an exponential ease, driven by the GSAP ticker so there is one loop and not two. ScrollTrigger for pins and scrubs at scrub 1.0 to 1.4. Reveals 0.9 to 1.4s on `expo.out`. Hover 0.6s on `cubic-bezier(0.22, 1, 0.36, 1)`. Cursor follow 0.18s. No bounce, elastic or spring. three.js only for `LitImage` and `PointField`.

Pins are created inside `gsap.matchMedia()` so no pin spacer is ever built on a phone, and the two layouts are chosen in CSS rather than JavaScript so there is no first render flash. Reduced motion renders every chapter static, with the wire drawn in full and parked; all content is in the DOM without JavaScript.

## Voice

Declarative, specific, unhurried. No em or en dashes anywhere, including commit messages. No pills, no eyebrows, no marketing verbs. The flywheel index is numbered because it is a real sequence, and it is the one exception. Numbers are data and are set in mono.
