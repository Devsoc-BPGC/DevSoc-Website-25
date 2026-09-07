# DevSoc 2026

The website of the Developers' Society, BITS Pilani K.K. Birla Goa Campus. One night on campus, dusk to dawn: the campus sleeps and six rooms stay lit. A clock in the nav runs 18:42 to 05:58 across seven chapters.

Design spec: `docs/superpowers/specs/2026-09-07-devsoc-night-shift-design.md`. Design system: `DESIGN.md`. Product context: `PRODUCT.md`. Image prompts: `docs/assets/PROMPTS-COPY-PASTE.md` and `docs/assets/HERO-PROMPTS.md`.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000, or whatever port it reports. The motion tools have a demo page at `/lab` (development only).

```bash
npm run build      # production build, all routes static
npm run typecheck  # tsc
npm run lint       # eslint
npm run format     # prettier
```

## Stack

Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind v4 with tokens in `src/styles/globals.css`, GSAP 3.13 with ScrollTrigger and SplitText, Lenis, three.js through React Three Fiber, motion (Framer Motion), Embla.

## Where things live

```
src/app/                routes: /, /projects, /team, /gallery, /inductees, /lab
src/components/chapters the seven chapters in order: Dusk, Society, Rooms (the flywheel), Log, DevFest, Crew, Dawn, then Colophon
src/components/shell    Nav, Menu, Rail (right-edge ticks), Overture, Timecode
src/components/motion   reusable motion tools, documented in motion/README.md
src/components/ui       FitText, TextLink, Lightbox
src/content             all copy and lists: site.ts, verticals.ts, projects.ts, people.ts, events.ts, faq.ts, gallery.ts, inductees.json
public/images           hero, rooms, devfest, dawn, people, work, gallery, brand
```

Every word on the site comes from `src/content`. Edit there, not in components.

## Content to confirm

Set in `src/content/site.ts` and `src/content/events.ts`:

- `foundedYear` (renders "since {year}" in the society line when set)
- `inducteesLive` (turns the inductees moment on the home page on or off)
- DevFest `when` and `sponsor`
- Engine Development head in `src/content/verticals.ts` (currently `null`)

## Images

Artwork lives in `public/images/**`. The set is one building through one night (four hero facades, DevFest with every window lit, Dawn with the door open) plus six posters, one per vertical. Every prompt, with its exact pixel size and ratio, is in `docs/assets/PROMPTS-COPY-PASTE.md` and `docs/assets/HERO-PROMPTS.md`. Drop a new file at the same path and it is picked up.

The four hero facades must stay the same building: same floor count, same pier rhythm, same entrance. `next.config.ts` serves WebP and not AVIF on purpose, because the AVIF encoder crushed the amber windows in the night facade to black.

Photographic assets are capped at 2400px on the long edge; screenshots and portraits are JPEG, not PNG. Anything over 400 KB gets a progressive re-encode.

The DS mark is `public/images/brand/mark.png`; a vector version would sharpen the nav and the point field.

## Fonts

Archivo (display and body), Bodoni Moda (voice), IBM Plex Mono (technical) and DotGothic16 (timecode) are loaded through `next/font/google` in `src/app/layout.tsx`. To use licensed Wild World, Heming or Disket Mono instead, add the files under `public/fonts`, switch the matching loader to `next/font/local`, and keep the CSS variable names.

## Motion rules

Slow and smooth. Reveals run 0.9 to 1.4s on `expo.out`, hovers 0.6s, nothing bounces. Reduced motion renders every chapter static and all content is in the DOM without JavaScript. See `src/components/motion/README.md`.
