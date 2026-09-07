# Reference teardown: zainabkabira.com

Captured 2026-09-07 from the live site at 1440x900 and 390x844, day and night themes. This documents the **design language**: tokens, type, layout, motion vocabulary and section anatomy. It is a reference for building DevSoc in the same idiom with our own content, illustrations and palette. No source code, copy or artwork from the site is reproduced here.

---

## 1. What it is

A single-page product-design portfolio that reads as an **illustrated storybook** rather than a portfolio template. The whole page is one continuous illustrated world: it opens in a painted sky, walks through work laid on real furniture, passes through a willow grove, and ends in a flower meadow at the horizon. Every section is a place.

Register: **brand**, not product. The design is the argument.

The single most important idea to steal: **the page is a landscape you travel through, top to bottom, and the illustration carries the narrative between sections.** Sections do not sit in boxes on a background; they are continuous terrain. Nothing is a card except the things that genuinely are cards (testimonials, work tiles).

| Metric | Desktop 1440x900 | Mobile 390x844 |
|---|---|---|
| Page height | 6933px (7.7 viewports) | 5260px (6.2 viewports) |
| Sections | 5 + footer | same, restacked |

Build: hand-coded vanilla. One stylesheet (~78KB), one script (~55KB). No React, no Next, no GSAP, no Lenis, no Locomotive, no Three, no Webflow, no Framer. 147 images, 40 videos, zero canvas.

---

## 2. Colour

A **two-tier token system**, which is worth copying verbatim as a method: a palette tier of raw values, then a semantic tier of role tokens that reference them. The night theme reassigns only the semantic tier.

### Tier 1, palette

| Token | Value | Reading |
|---|---|---|
| cream | `#fff9f1` | warm page ground |
| cream 2 | `#fff9e9` | nav pill, scrolled surfaces |
| sand | `#eee8d2` | raised warm surface: testimonials, footer |
| ink | `#060606` | near-black body text |
| black | `#000000` | headings |
| white | `#ffffff` | toggle track |
| gold | `#ffda3f` | the one accent: sun, availability dot, toggle knob |
| coral | `#fc9073` | second accent, used almost once: the paper plane |
| night | `#0a0a0f` | dark page ground |
| navy | `#111c36` | raised surface, dark theme |
| navy 1 / navy 2 | `#1f3b6d` / `#031835` | night sky gradient stops |
| blue start / end | `rgb(113,183,244)` / `rgb(87,136,179)` | day sky gradient stops |

### Tier 2, semantic roles

`bg-base`, `surface-raised`, `text-heading`, `text-title`, `text-eyebrow`, `text-contrast`, `nav-scrolled`, `overlay-scrim`, `hero-from`, `hero-to`, `toggle-track`, `toggle-border`, `toggle-knob`, `focus-ring`, `trail-stroke`.

Two details worth noting. Muted text is expressed as **alpha over the ground** (`rgba(0,0,0,0.5)` for eyebrows, `0.9` for titles) rather than as a separate grey token, so it stays correct on any surface. And the scrim is a **tint of the page cream at 70%**, not black, so overlays warm the image instead of dimming it.

### Discipline

The palette is enormous on paper and almost invisible in use. The page is cream, the text is near-black, and **gold appears perhaps four times on the whole page**: the sun, the availability dot, the toggle knob, one bullet. Coral appears once, on the paper plane. Everything else is illustration.

---

## 3. Typography

Four families with hard role separation. No family does two jobs.

| Role | Family | Weight | Sizes seen | Setting |
|---|---|---|---|---|
| Display | DM Serif Display | 400 only | 136 / 96 / 92 / 64 / 60 / 52 / 46 / 40 / 34 / 32 | tracking `-1.8px` to `+1.2px`, leading 1.02 to 1.13 |
| UI and body | Space Grotesk | 400, 500, 700 | 40 down to 14 | the workhorse, 833 elements |
| Small prose | Lato | 300, 400 | 16 down to 10 | captions, meta |
| Technical | JetBrains Mono | 400, 700 | 14 down to 10 | eyebrows, timestamps, labels |
| Secondary heading | Inter | 300, 400 | 40 | section headings, tracking `-1.6px` |

Observations that matter more than the list:

- **The display face is used at one weight, ever.** All the drama comes from size, never from weight. A 136px and a 32px DM Serif on the same page, both at 400.
- **Tracking flips sign with size.** Large display gets negative tracking (`-1.8px` at 60px); the big hero and case-study titles get slightly *positive* tracking (`+1.2px` at 60px) which is unusual and gives the serif air.
- **Leading is tight on display** (60px type on 63px leading, 52 on 55.6) and normal on body.
- The mono is only ever tiny and uppercase with wide letter-spacing, and it is the only uppercase on the page.
- Section headings are a *lighter* weight than body (Inter 300 at 40px), which inverts the usual hierarchy and reads as calm.

---

## 4. Layout

**No max-width container anywhere.** Sections are full-bleed at `1438px` and content is centred by its own measure. This is the opposite of the `max-w-7xl mx-auto` default and it is a large part of why the page feels like terrain rather than a document.

Vertical rhythm is deliberately uneven:

| Section | Padding top | Padding bottom |
|---|---|---|
| Hero | 0 | 0 (exactly 100vh) |
| Story | 317px | 200px |
| Featured work | 80px | 338px |
| Testimonials | 0 | 0 (illustration bleeds) |
| Footer | 0 | 0 |

That 317/200 and 80/338 asymmetry is the whole trick: sections are not evenly spaced, they breathe differently depending on what precedes them. The largest single gap on the page (338px) sits before the testimonial grove, giving the illustration room to arrive.

Prose is centred and measured at roughly 55 characters, set at 32px. Body copy is *large*: the story paragraph is 32px, not 17px.

Layout primitives skew heavily to flex: **318 flex containers against 86 grid containers**. Grid is used for the tile and testimonial arrangements; everything structural is flow and flex.

Breakpoints: `1100px` and `640px` are the real ones, `360px` for the smallest phones. Two **height-based** queries (`max-height: 860px`, `max-height: 740px` at min-width 1101px) adapt the hero to short laptop screens, and one `(orientation: landscape) and (max-height: 480px)`. That is more care about viewport height than most sites take at all.

### Shape and depth

| Scale | Values |
|---|---|
| Radius | 2, 8, 11, 14, 18, 22px, plus full pill |
| Spacing | 38, 43, 47, 52, 56, 60, 64, 72, 80px, on a 2px grid |

The depth finding is the surprising one. **Average shadow blur across the whole site is 0.** What look like shadows are almost all rings: `0 0 0 2px`, `0 0 0 0.5px`, one inset hairline. Exactly one soft shadow exists on the page (`rgba(0,0,0,0.45) 0 0 7px`). Depth comes from illustration and overlap, not from elevation.

Equally useful: **there is no `backdrop-filter` anywhere.** The testimonial cards that read as frosted glass are gradient fills over the illustration, not blur. That is cheaper, sharper, and worth copying.

Gradients: 16 radial, 27 linear. No noise, no dot grid, no line grid, no mesh, no SVG pattern backgrounds. The label the extractor lands on for background treatment is simply "plain": all the richness is painted artwork, not CSS texture.

---

## 5. Motion

38 named keyframes. No scroll library, no scroll listener, no wheel listener, no scroll-linked scrubbing at all. Motion is:

- **3 IntersectionObservers** driving `.reveal` → `.is-visible` class toggles
- **4 requestAnimationFrame** loops for the generative illustration only
- everything else is **CSS keyframes on infinite loops** for ambient life

### Easing signature

| Curve | Uses | Role |
|---|---|---|
| `cubic-bezier(0.22, 1, 0.36, 1)` | 16 | the house ease-out, everything that enters |
| `cubic-bezier(0.34, 1.56, 0.64, 1)` | 11 | overshoot, used on small playful UI only |
| `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | 4 | gentle in-out |
| `cubic-bezier(0.32, 0.72, 0, 1)` | 4 | sharp out |
| `linear` | 21 | ambient loops only |

The house ease-out is **identical to the one DevSoc already uses**. The overshoot curve is the one thing we have banned and they use freely, but only on toy-scale elements.

### Duration bands

Three clean bands, no middle ground:

- **Interface**: 0.18s, 0.22s, 0.3s, 0.35s, 0.4s, 0.45s
- **Reveal**: 0.5s, 0.6s, 1.15s
- **Ambient loop**: 1.8s, 5.03s, 11s

Ambient loops are the point. Named examples: sway, bloom, mist, breeze, drift, meteor fly, sky gust, disk spin, logo scroll, availability pulse, nav wave travel. The page is never still, but nothing ever moves fast.

### Reduced motion

Honoured with a dedicated media query, and `matchMedia` is consulted 8 times in the script. `(hover: hover) and (pointer: fine)` gates the pointer effects.

### The honest caveat on their system

Measured across the whole page: **11 font families, 49 distinct font sizes, 17 unique border radii, 36 unique colours, 34 z-index layers, 13 `!important` rules.** By the numbers this is not a tight design system, and an audit would flag all of it.

It works anyway, because the *illustration* carries the identity and the type and colour merely have to stay out of its way. That is the real lesson, and it cuts both ways: if we copy the loose token discipline without also having the artwork, we get the mess without the magic. Our tokens should stay tight; the artwork is where we spend.

---

## 6. The signature devices

These are the twelve moves that make the site feel like itself. This is the actual list to build from.

1. **The sky hero.** Full-bleed painted gradient sky with drifting clouds, a striped sun, and hand-drawn waves along the bottom edge. The illustration *is* the background, not a decoration on top of one.
2. **Day / night toggle.** A real theme switch with a gold knob. Night is not "dark mode": it is a different painting, a starfield with an aurora and a striped moon. Both are first-class.
3. **Music in the nav.** A play button that spins a record. Entirely unnecessary and entirely the point.
4. **The morphing nav.** At rest it is a full pill with avatar, three links and a CTA. Once scrolled it collapses to a compact pill reading an availability status with a pulsing dot. Same element, two states.
5. **Rotated side rail.** A vertical mono label pinned to the left edge of the hero.
6. **The paper plane.** A single coral plane flies down the entire page on a long dashed path, threading through every section. It is the connective tissue: one element that makes 7000px feel like one journey. `plane-fly` is 2981px tall.
7. **Oversized measured prose.** The story is 32px centred serif-adjacent text, not a small paragraph.
8. **Work tiles as photographs.** Case studies are shown as devices sitting on real furniture (a green sofa, an orange chair, a wooden table), not as floating browser chrome. Videos play in the tiles on hover.
9. **A logo marquee that is small.** The "featured on" strip is 719px wide and 68px tall, sitting modestly under a light heading, not a full-bleed trust wall.
10. **The grove.** The testimonial section is a painted willow forest with glass cards floating in it. The cards scrub horizontally as you pass.
11. **The generative meadow.** The footer builds an SVG garden at runtime: daisies, lavender, foliage, a ridge line, with wind. Plants grow as the footer arrives.
12. **Route curtain.** A full-viewport curtain covers page transitions.

Supporting texture: a custom dot cursor, dashed hand-drawn paths, and section-to-section colour handoff (cream → sand → black horizon).

---

## 7. Section anatomy, in order

| # | Section | Height | Ground | Contents |
|---|---|---|---|---|
| 0 | Route curtain | 900 | none | transition veil |
| 1 | Hero | 900 | painted sky | mono eyebrow with dot, two-line serif display split around a music player, rotated side rail, illustrated horizon |
| 2 | Story | 821 | cream | one oversized centred paragraph, then one bold statement; plane path enters |
| 3 | Featured work | 1889 | cream | light Inter heading, small logo marquee, then 2x2 photographic tiles with rounded corners |
| 4 | Testimonials | 1010 | sand + grove | eyebrow, heading, three glass cards on a painted forest, horizontal scrub |
| 5 | Footer | 938 | sand → black | small centred line, giant serif closing statement, generative meadow, black horizon bar with credits and social links |

The nav is fixed above all of it, 80px tall, padded `24px 60px 0`.

---

## 8. Interaction inventory

- Theme toggle, day / night, persisted
- Music play / pause with spinning disc
- Nav collapse on scroll
- Burger menu on mobile opening a numbered overlay (`01 Work`, `02 About`, `03 Playground`) with the numbers set in mono
- Contact panel that slides in, with a form and alternate contact links
- Work tiles: hover plays the embedded video
- Testimonial cards: horizontal scrub on scroll
- Reveal on arrival for headings and tiles
- Dot cursor on fine pointers
- Active-link tracking against sections

---

## 9. What to take for DevSoc, and what to change

DevSoc keeps its own world: obsidian ground, verdigris light, brass, the six instrument rooms. What we take is the **grammar**, not the palette.

### Take directly

- The **two-tier token system**. Rename our tokens into palette tier plus semantic role tier. We already have the palette; we lack the role layer.
- **Alpha-over-ground for muted text** instead of a separate grey.
- **One display weight, size does the work.**
- **Full-bleed sections with no shared container**, and uneven vertical rhythm between them.
- **The connective element.** Their paper plane threading the whole page is the single best idea here. Ours should be a **brass filament**, a thin dashed line that leaves the armillary sphere in the hero, threads every chapter, and terminates in the footer. One SVG path, scroll-drawn.
- **The morphing nav**: full at rest, collapsing to a compact status pill on scroll. Ours can collapse to the chapter name plus timecode.
- **Ambient loops.** We have almost none. Slow, long-period life: the sphere breathing, dust in the light, the timecode.
- **Oversized measured prose** for the manifesto instead of ordinary body copy.
- **A real second theme.** Theirs is day / night. Ours could be **workshop light / night shift**: the same atelier at two times of day. This is a big build; treat as optional.
- **Height-aware breakpoints** so the hero fits short laptops.

### Change deliberately

- Their overshoot easing stays banned for us. Our motion stays slow and exponential.
- Their illustration is painted and whimsical. Ours is photographic and machined. The equivalent of their meadow is not flowers; it is the instrument collection laid out on a bench.
- They have five families; we hold at four.
- Their accent is gold at four appearances. Ours is ember, and it should appear about as rarely.

### The honest gap

Their page is carried by **custom illustration**, hand-drawn and specific. Our generated instrument imagery is the weakest part of our build by comparison, and no amount of layout will fix that. Whatever direction we take next, the assets are the work.

---

## 10. Assets their approach implies

If we follow this grammar, DevSoc needs:

1. A continuous **horizon illustration** for the hero, in our own idiom (a dark workshop horizon rather than a sky).
2. The **brass filament** path as a single SVG, drawn across the whole page.
3. **Photographic tiles**: our projects shown on real surfaces, not as flat screenshots. This is a photo shoot or a much better generation prompt, not a crop.
4. A **grove equivalent** for the testimonial or archive moment: one painted or photographed environment that a floating card sits inside.
5. A **generative footer scene** built at runtime in SVG: our version is the instrument bench assembling itself.
6. Optional second theme artwork if we take the day / night idea.

---

## 11. What it costs

Measured on the live page. This is the bill for the approach, and it is steep.

| | Value | |
|---|---|---|
| Largest contentful paint | 14.7s | poor |
| Cumulative layout shift | 0.30 | poor |
| Interaction to next paint | 168ms | acceptable |
| Images | 8.1MB across 63 requests | |
| Video and other media | 4.0MB | |
| Fonts | 127KB across 5 files, **zero preloaded** | |
| Total requests | 74 | |

The site is beautiful and slow. Nearly 12MB of media, no font preloading, and a third of a viewport of layout shift. Our current build is static across seven routes and holds a far better budget.

So the rule for us: take the grammar, refuse the bill. Specifically, custom artwork has to arrive as sized AVIF through `next/image` with explicit dimensions, video has to be poster-first and lazy, and fonts stay self-hosted through `next/font` where they already are. The illustrated feeling is achievable at a tenth of the weight; theirs simply was not optimised.

Their responsive work was captured at 375, 768, 1280 and 1920 across both themes, which is the matrix worth testing ours against too.

---

## 12. Measured reference values

Straight from the extraction, for building against:

| | |
|---|---|
| Body | Space Grotesk 16px, line-height normal |
| h1 / h2 / h3 / h4 | 83 / 60 / 58 / 53px, all weight 400 |
| Detected page intent | landing (confidence 0.61) |
| Material language | pill shapes plus soft edges (confidence 0.45) |
| Motion feel | springy, scroll-linked |
| Saturation | 0.34 |
| Components detected | buttons, cards, inputs, links, navigation, footer, modals, dropdowns, badges, avatars, switches |
| Imagery | 43 assets: 23 SVG, 21 icon, 6 photographic, 5 hero, 0 screenshots |

That imagery split is the headline: **zero screenshots.** A product-design portfolio with no screenshots in it. Everything is either hand-drawn vector or a photograph of a device in a real room.

## Sources

Live site read at 1440x900 and 390x844, day and night, on 2026-09-07. Screenshots held in the session scratchpad under `zk/`. Figures for colour, type, easing, duration, breakpoints and section geometry are computed values read off the live DOM.
