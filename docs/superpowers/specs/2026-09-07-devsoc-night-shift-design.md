# DevSoc: The Night Shift

Date: 2026-09-07
Status: for review
Supersedes the atelier direction in `docs/superpowers/specs/2026-09-05-devsoc-website-design.md`. The build, the motion toolkit and the content layer carry forward; the story, the chapter set, the theme system and the artwork change.
Reference teardown: `docs/reference/zainabkabira-design.md`

---

## 1. The story

One night on the BITS Pilani Goa campus, dusk to dawn.

DevSoc builds at night. The site is a single night on campus, and the reader travels through it from last light to first light. Every chapter carries a time, and the clock in the navigation counts through the night as you scroll. The clock is the narrative, not decoration.

**Hero line: "The campus sleeps. Six rooms stay lit."**

Seven words that say what the society is and hand over the six verticals in the same breath. The port line survives as the turn in chapter two: Goa has been a port for five hundred years, and we still ship. That pun is the spine of the whole site and it earns the connective element, a paper boat travelling the page on a dashed waterline.

Voice: declarative, specific, unhurried, first person plural. Short sentences. No marketing verbs. Numbers are data. No em or en dashes anywhere.

## 2. Chapters

Seven plus a colophon. Deliberately fewer than a page of this length usually carries, because each one is a place rather than a content block.

| Time | Id | Chapter | Content |
|---|---|---|---|
| 18:42 | `dusk` | Dusk | Hero. Last light over the sea. Wordmark, the line, one link, a metadata block. |
| 20:15 | `society` | The Society | One oversized centred paragraph, then the port line as a statement. Three real numbers. |
| 22:30 | `rooms` | The Flywheel | The core. A six-spoke wheel that turns as you scroll, one spoke per vertical, the active one lit. |
| 00:40 | `log` | The Log | What shipped, panning sideways under vertical scroll. The fest film sits here. |
| 02:00 | `devfest` | DevFest | Full bleed. The one night nobody sleeps. Recurring events as a plain table. |
| 04:10 | `crew` | The Crew | Credits roll. The portrait follows whichever name is level with the middle. |
| 05:58 | `dawn` | Dawn | First light. Inductions, the inductee search, questions, the door. |
| after dawn | `colophon` | Colophon | Particle wordmark, facts, socials. |

No dedicated gallery chapter. The archive photographs appear as texture inside DevFest and The Crew. `/gallery` remains as a route for anyone who wants the full set.

Routes: `/` (the night), `/projects`, `/team`, `/gallery`, `/inductees`, `/lab` (development only).

## 3. The night clock

A single device that ties the whole site together and replaces the current film timecode.

- Each chapter declares a time in `src/content/chapters.ts`.
- The navigation shows the current time, interpolated between the surrounding chapter times as you scroll, so it advances continuously rather than jumping.
- The chapter rail on the right shows each chapter's time next to its name.
- Set in the pixel face, in verdigris at night and ink at morning.
- In the morning theme the clock still runs, because the story is still one night; the theme is a lighting change, not a different day.

Reduced motion: the clock shows the current chapter's fixed time instead of interpolating.

## 4. Themes

Two states. **Night is the default** and is what a first-time visitor sees.

Adopting the reference's two-tier token method: a palette tier of raw values, and a semantic role tier that references it. The morning theme reassigns only the role tier. This is why only two artworks need a second version.

### Tier 1, palette (unchanged from the current build, plus morning values)

| Token | Value |
|---|---|
| `--c-obsidian` | `oklch(0.13 0.008 60)` |
| `--c-soot` | `oklch(0.20 0.008 60)` |
| `--c-bone` | `oklch(0.93 0.02 85)` |
| `--c-ash` | `oklch(0.66 0.015 80)` |
| `--c-verdigris` | `oklch(0.72 0.11 185)` |
| `--c-verdigris-deep` | `oklch(0.45 0.08 190)` |
| `--c-ember` | `oklch(0.70 0.17 50)` |
| `--c-brass` | `oklch(0.78 0.09 85)` |
| `--c-haze` | `oklch(0.94 0.012 170)` |
| `--c-haze-2` | `oklch(0.90 0.016 170)` |
| `--c-ink` | `oklch(0.22 0.02 200)` |
| `--c-slate` | `oklch(0.50 0.02 200)` |

`--c-haze` is a pale sea glass, cool and faintly green. It is deliberately not cream, beige, sand or paper: that warm near-white band is the most saturated AI default in current web design and the reference site already owns it.

### Tier 2, semantic roles

`--bg-base`, `--surface-raised`, `--text-primary`, `--text-muted`, `--text-heading`, `--accent-light`, `--accent-warm`, `--rule`, `--focus-ring`, `--scrim`, `--grade` (the tint photographs resolve out of).

| Role | Night | Morning |
|---|---|---|
| `--bg-base` | obsidian | haze |
| `--surface-raised` | soot | haze-2 |
| `--text-primary` | bone | ink |
| `--text-muted` | ash | slate |
| `--accent-light` | verdigris | verdigris |
| `--accent-warm` | ember | ember |
| `--rule` | brass at 25% | ink at 20% |
| `--scrim` | obsidian at 70% | haze at 70% |
| `--grade` | verdigris-deep | verdigris-deep |

Muted text is expressed as alpha over the ground rather than as a separate grey, following the reference, so it stays correct on any surface.

### Mechanics

- `data-theme="night" | "morning"` on the root element. Night is the served default, so no flash.
- Stored in `localStorage`; a tiny inline script in the document head applies it before first paint.
- Night is the default for every first visit. The operating system light preference deliberately does not override it, because the site is a night on campus and that is the state it should be met in. An explicit choice is stored and wins forever after.
- The toggle sits in the navigation, a small control with a warm knob, following the reference's pattern of making the theme switch a real object rather than an icon button.
- Crossfade of 0.6s on the role tokens. Artwork crossfades over the same duration.

## 5. Layout grammar

Taken from the teardown, deliberately different from our current build:

- **No shared max-width container.** Sections are full bleed. Content is centred by its own measure. This is what makes a page read as terrain rather than as a document.
- **Uneven vertical rhythm.** Section padding varies by what precedes it, in the 80px to 340px range on desktop. The largest gap sits before Six Rooms so the artwork has room to arrive.
- **Oversized measured prose.** The Society paragraph is `clamp(1.5rem, 2.4vw, 2rem)`, centred, about 55 characters per line. Not ordinary body copy.
- **Depth is rings, not blur.** Average shadow blur on the reference is zero. Hairlines, rings and overlap carry depth. One soft shadow is permitted on the whole site.
- **No backdrop-filter.** Cards that read as glass are gradient fills over the artwork behind them. Cheaper and sharper than blur.
- Radius scale: 0, 2, 8, 14, 22px, plus full pill for the theme toggle and the nav.
- Height-aware breakpoints so the hero fits short laptops: `(max-height: 860px)` and `(max-height: 740px)` above 1101px wide.

## 6. Motion

The existing toolkit carries forward unchanged. Scroll drives the page; clicks are for navigation and for going deeper. Added from the reference:

- **Ambient loops.** The page is never completely still and nothing moves fast. Periods of 6 to 16 seconds: the ambient light breathing, a pulse running down the wire, the flywheel drifting a degree when idle. This is the quality our current build most lacks.
- **The wire.** One thin conduit drawn from the hero to the colophon, stroke-drawn on scroll, with a small lit window riding the head of the drawn line, so the light you follow is the light that ends up over the door at dawn. It is the single element that makes a long page feel like one journey. Deliberately not a paper boat: the reference threads its page with a paper plane, and a folded paper anything is that idea in costume.
- **The morphing navigation.** Full at rest: mark, chapter name, clock, theme toggle, menu. Once scrolled: collapses to a compact pill carrying the clock and the chapter name.

Easing stays as it is, `cubic-bezier(0.22, 1, 0.36, 1)`, which is the same curve the reference uses. The overshoot curve they use freely stays banned for us.

Reduced motion renders every chapter static, the boat fully drawn, the clock fixed per chapter.

## 7. Artwork

**The lit facade.** One building seen through one night, drawn straight on like an elevation: a flat grid of windows, most dark, some filled solid amber. Each lit window is a room where somebody is building something. The hero has six lit. DevFest has every window lit. Dawn has them out, with one door open and light falling from it.

It comes directly from the line the site opens on, and it is DevSoc's own image. That matters: an earlier pass at this produced a night sky with an aurora, a star field, a striped circle moon and palm silhouettes, which is the reference site's signature artwork rather than ours. Restyling someone else's picture is not the same as learning from how they build a page.

**Two hard rules for every image.** No night skies, auroras, star fields, moons, palms, flowers or meadows. And nothing photographic or 3D rendered. Flat vector, bold geometric shapes, limited palette, subtle grain, close to a screen print of an elevation drawing.

**Palette:** deep indigo, near-black, bone white, patina teal, warm amber, brass.

Alongside the facade, six **posters**, one per vertical: a single flat colour field with one simple object on it and a soft contact shadow. A browser window, a phone, a controller, a small node graph, stacked artboards, a gear. The object is the whole idea. These ride in the flywheel.

Fourteen images with exact sizes and ratios in `docs/assets/PROMPTS-COPY-PASTE.md`: four facades for the hero at both times of night, six posters, DevFest, two for Dawn, and one lit window used small.

**The flywheel is not generated.** It is SVG so it can turn with the scroll, light the active spoke and carry type.

### Reused

Seven coordinator portraits, six project images, the fest film, the logo. A handful of archive photographs as texture.

### Retired

The armillary sphere, the six instruments, the sunburst, the atelier, the key, the macro textures. Kept in `assets-src/` and unreferenced.

## 8. What carries forward from the current build

Unchanged: Next 16 App Router, Tailwind v4, the whole `src/components/motion` toolkit (SmoothScroll, Cursor, Magnetic, SplitLines, ScrollExpand, ParticleText, LiquidImage, PointField, MaskReveal, Carousel, HorizontalPan, ScrollResolve, Reveal, FrameChrome), the typed content layer, the subpages, the Lenis and GSAP wiring including the scroll watchdog.

Changed: chapter components are renamed and restructured; the token layer gains the two tiers and the second theme; the timecode becomes the night clock; `FrameChrome` loses the timecode to the navigation; artwork is replaced.

Added: `ThemeProvider`, `NightClock`, `BoatPath`, `Ambient`, and `src/content/chapters.ts`.

This is a refactor of a working site, not a rebuild.

## 9. Success criteria

1. A first-year on a phone at night scrolls to the end and can say what the six verticals are.
2. Nothing on the home page requires a click to reveal content.
3. The page reads as one night, and the clock makes that legible without a caption explaining it.
4. Night and morning are both complete, and neither looks like an afterthought.
5. Production build static across all routes, no console errors, reduced motion complete, keyboard operable.
6. Total media weight under 3MB on first load. The reference spends nearly 12MB and pays for it with a 14.7s largest contentful paint; we take the grammar and refuse the bill.

## 10. Open questions

None blocking. Two facts remain unconfirmed from the earlier spec and render only when set: the founding year and the Engine Development head. DevFest date and sponsor line are likewise optional. The inductees moment is behind a flag that is currently on.

## 11. The flywheel

The one place the site departs from the reference entirely, and the piece that has to be best.

A large wheel drawn in SVG, centred and bleeding slightly off the right edge. Six spokes, sixty degrees apart, one per vertical, with the vertical's name set along or beside its spoke. A brass rim, thin spokes, a hub.

- Scrolling the pinned section turns the wheel. Six sixths of a turn across the whole section.
- Whichever spoke reaches the marker at the top is the active one: its name goes bone, the others sit at ash.
- The hub holds the active vertical's poster, circular cropped, melting from one to the next through `LiquidImage`.
- The voice line, the head and the tools sit to the left of the wheel and change with the active spoke.
- Hovering a name turns the wheel to it directly.
- When idle the wheel drifts about a degree over twelve seconds so it never looks frozen.

Mobile: the wheel is dropped. The six posters become the swipe rail that already exists, with the name, voice line and head under each.

Reduced motion: the wheel renders at its first position and does not turn; the six are reachable as a list.

## 12. Personality

The details that stop a site reading as a template. Each one is small; together they are most of the character.

| # | Device | Where | Status |
|---|---|---|---|
| 1 | **Pill navigation.** The mark, the links and one call to action inside a single rounded pill, floating rather than sitting on a bar. On scroll it collapses to a compact pill carrying the clock and the chapter. | Every page | Task 7a |
| 2 | **The pulse.** A short lit segment runs down the wire every sixteen seconds and is gone. Same delight as a shooting star crossing a sky, but on our own motif rather than borrowed from a night scene we no longer have. | Whole page | Built |
| 3 | **The wire.** A conduit drawn down the entire page with a lit window riding its head, threading every chapter. | Whole page | Built |
| 4 | **Tiles that grow.** In the shelf, each project scales up as it approaches the middle of the screen and settles back as it leaves, so the one you are looking at is always the largest. | The Log | Task 7 |
| 5 | **Wave dividers.** Sections do not meet on a straight edge. The next ground rises into the current one on a soft organic curve, alternating crest and trough so no two transitions repeat. | Every boundary | Built |
| 6 | **Click to light a window.** At Dawn, a flat facade with dark windows. Each click lights one, warm amber, and it stays lit, with a count of how many. Every window is someone who walked in. | Dawn | Task 8 |

Rules that keep these from becoming noise: only one of them is ever moving in a given viewport, none of them block content, and all of them are absent under reduced motion except the wave dividers, which are static shapes, and the wire, which draws in full and parks.
