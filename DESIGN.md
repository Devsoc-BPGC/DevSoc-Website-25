# Design system: DevSoc 2026

Named reference: a luxury watch campaign shot in a black studio (brushed brass, verdigris patina, liquid chrome, smoked glass), crossed with the dark cinematic hero comps in `/inspo` (massive expanded type sitting behind a photographed object, mono labels on the rails, film-frame corner marks with a timecode). Styles borrowed on purpose: Aurora (one moving field of light), Ethereal (serif voice lines, gauze), Art Deco (brass hairlines, sunburst, symmetry), Bauhaus (12 column skeleton), Pointillism (dot fields, grain), Utilitarian (mono metadata, tables), Modular Typography (variable width as a live axis).

## Dials
DESIGN_VARIANCE 8 · MOTION_INTENSITY 8 · VISUAL_DENSITY 3

## Color (OKLCH, dark only, no theme toggle)
- `--obsidian` oklch(0.13 0.008 60): page ground, warm near-black
- `--soot` oklch(0.20 0.008 60): raised surfaces, frames
- `--bone` oklch(0.93 0.02 85): primary type
- `--ash` oklch(0.66 0.015 80): secondary type, inactive index
- `--verdigris` oklch(0.72 0.11 185): the light. Brand teal aged into patina
- `--verdigris-deep` oklch(0.45 0.08 190): duotone shadows, ambient fields
- `--ember` oklch(0.70 0.17 50): counter-light, at most once per screen
- `--brass` oklch(0.78 0.09 85): hairlines, focus ring, Deco geometry

Strategy: Committed. Obsidian carries the surface, verdigris carries the light. One light source per screen.

## Type
- Display: Archivo variable at wdth 125, wght 800 to 900, uppercase. Wordmarks, chapter titles, the rooms index. Leading 0.86, tracking -0.02em.
- Voice: Bodoni Moda italic (opsz axis). One-line statements over images and pull lines. Never body.
- Technical: Martian Mono at wdth 75 to 100, wght 300 to 500. Nav, labels, numerals, metadata, tables.
- Body: Archivo at wdth 100, wght 400. 17px / 1.6, bone at 86% opacity, max 68ch.
- HUD: DotGothic16, only the frame timecode and scroll counter.

Swap plan: licensed Wild World (display), Heming or Disket Mono (technical) can replace the Google faces via `public/fonts` and the font tokens in `src/app/layout.tsx`.

## Imagery
Generated instrument photography (see `docs/assets/image-prompts.md`): one studio, one key light, brass, chrome, smoked glass. Real archive photos render as verdigris duotone at rest and resolve to colour on hover or at full bleed. Portraits from the existing team PNGs, duotone.

## Layout
12 column grid, gutter `clamp(1.25rem, 4vw, 4rem)`. Chapter padding varies on purpose (hero 0, manifesto 18vh, rooms 0 pinned, work 12vh, DevFest 0, people 14vh, archive 8vh, join 22vh). Radius 0 everywhere except the ScrollExpand frame (24px collapsing to 0) and the cursor ring. No cards. Brass 1px hairlines only where they separate real rows.

## Motion
Scroll drives the page. Every chapter plays itself: the shelf of projects pans sideways under vertical scroll, photographs lift out of the grade as they reach the middle of the screen, the credits portrait follows whichever name is level with the middle, and the film scrubs. Hover refines what scroll has already shown; clicks are for navigation and for going deeper only.

Lenis 1.2 duration, exponential ease. GSAP ScrollTrigger for pins and scrubs (scrub 1.2). Reveals 0.9 to 1.4s on `expo.out`. Hover 0.6s cubic-bezier(0.22, 1, 0.36, 1). Cursor follow 0.18s. No bounce, elastic or spring. three.js only for `LiquidImage` (shader crossfade with pointer ripples) and `PointField`. Reduced motion renders every chapter static; all content is in the DOM without JS.

## Voice
Declarative, specific, unhurried. No em or en dashes. No pills, eyebrows, numbered section labels (the rooms index is a real sequence and the one exception), no marketing verbs. Numbers are data and are set in mono.
