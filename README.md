# DevSoc 2026

The website of the Developers' Society, BITS Pilani K.K. Birla Goa Campus. An atelier of instruments in an obsidian room: six verticals, one flagship, the people, the archive, the door.

Design spec: `docs/superpowers/specs/2026-09-05-devsoc-website-design.md`. Design system: `DESIGN.md`. Product context: `PRODUCT.md`. Image prompts: `docs/assets/image-prompts.md`.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000. The motion tools have a demo page at `/lab` (development only).

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
src/components/chapters home page chapters in order: Hero, Manifesto, Rooms, Work, DevFest, Credits, Archive, Join, Colophon
src/components/shell    Nav, Menu, Rail (right-edge ticks), Overture, Timecode
src/components/motion   reusable motion tools, documented in motion/README.md
src/components/ui       FitText, TextLink, Lightbox, Faq
src/content             all copy and lists: site.ts, verticals.ts, projects.ts, people.ts, events.ts, faq.ts, gallery.ts, inductees.json
public/images           hero, rooms, devfest, atelier, join, texture, people, work, gallery, brand
```

Every word on the site comes from `src/content`. Edit there, not in components.

## Content to confirm

Set in `src/content/site.ts` and `src/content/events.ts`:

- `foundedYear` (renders "since {year}" in the atelier line when set)
- `inducteesLive` (turns the inductees moment on the home page on or off)
- DevFest `when` and `sponsor`
- Engine Development head in `src/content/verticals.ts` (currently `null`)

## Images

Generated instrument photography lives in `public/images/**` as compressed JPGs. The raw PNGs are in `assets-src/` (gitignored). Two are still placeholders, generated from the prompts in `docs/assets/image-prompts.md`:

- `public/images/rooms/04-ai-ml.jpg` (the Orrery, R4)
- `public/images/devfest/sunburst-tall.jpg` (F1, portrait crop for phones)

Drop a new file at the same path and it is picked up. The hero sphere is keyed out of its black studio into `armillary-wide-cut.webp` and `armillary-tall-cut.webp`; regenerate them with the snippet in the commit history if the hero image changes.

The DS mark is `public/images/brand/mark.png`; a vector version would sharpen the nav and the point field.

## Fonts

Archivo (display and body), Bodoni Moda (voice), Martian Mono (technical) and DotGothic16 (timecode) are loaded through `next/font/google` in `src/app/layout.tsx`. To use licensed Wild World, Heming or Disket Mono instead, add the files under `public/fonts`, switch the matching loader to `next/font/local`, and keep the CSS variable names.

## Motion rules

Slow and smooth. Reveals run 0.9 to 1.4s on `expo.out`, hovers 0.6s, nothing bounces. Reduced motion renders every chapter static and all content is in the DOM without JavaScript. See `src/components/motion/README.md`.
