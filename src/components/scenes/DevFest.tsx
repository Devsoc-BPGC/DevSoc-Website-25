"use client";

/**
 * 08 DevFest
 * The flagship, as a risograph poster wheat-pasted in the middle of a wall of
 * the year's other posters.
 *
 * One ink per poster, on bone or warm stock. The DevFest poster sits in the
 * middle: the name as large as the sheet allows with a second pass of the drum
 * just off register, the edition in a halftone that runs from speck to solid,
 * the blurb, and the fest's own site printed in the same blue. Around it, the
 * rest of the year, each with its own poster: Quark, Waves, the workshops and
 * the inductions. Everything printed sits under one ink mask, so it all has the
 * specks a riso leaves.
 *
 * Three stage tubes hang over the middle and strike one after another. The
 * middle poster comes up out of the dark with them; the others only catch the
 * spill. Production tape gets laid across two corners, and the camera comes in
 * on the flagship.
 *
 * Then the tape comes off, the poster falls forward off the wall, the tubes go
 * out, and what was stencilled on the wall behind it is the next scene's title.
 *
 * Unconfirmed facts (the date, the sponsor) are null in the content and print
 * nothing at all. There is no placeholder on any poster.
 *
 * Progress:
 *   0.02 - 0.12   the tubes strike, one by one
 *   0.14 - 0.30   tape goes down across two corners
 *   0.00 - 0.60   the poster turns square; the camera comes in
 *   0.72 - 0.80   the tape comes off
 *   0.78 - 0.96   the poster falls; the wall goes dark
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { Scene } from "@/components/world/Scene";
import { Light, span, type LightPoint } from "@/components/world/Light";
import { PrintedTape, Tape } from "@/components/world/Tape";
import { CrewTitle, crewTitleAt } from "@/components/world/CrewTitle";
import { useReducedMotion } from "@/lib/useMedia";
import { colophon, devfest, devfestCopy, events, hero, type Event } from "@/content/home";

const ease = (t: number) => t * t * (3 - 2 * t);

/** When each tube strikes. */
const STRIKE = [0.02, 0.055, 0.09];
const FALL_FROM = 0.78;

/** A tube's brightness: dark, a starter's stutter, then on. Seeded by progress so it replays exactly. */
function tube(p: number, at: number) {
  if (p < at) return 0;
  const t = p - at;
  if (t > 0.018) return 1;
  const k = Math.floor(t * 900);
  const h = Math.sin(k * 91.7 + at * 1000) * 43758.5453;
  return h - Math.floor(h) > 0.5 ? 0.9 : 0.1;
}
const lightsOut = (p: number) => 1 - span(p, 0.9, 0.99);

/** The tubes over the middle poster, in shares of the frame. */
function tubesFor(w: number): LightPoint[][] {
  const narrow = w < 768;
  const y = narrow ? 0.2 : 0.1;
  const [a, b, c, d] = narrow ? [0.06, 0.3, 0.7, 0.94] : [0.3, 0.42, 0.58, 0.7];
  return [
    [
      [a, y + 0.03],
      [b, y - 0.015],
    ],
    [
      [b + 0.035, y - 0.035],
      [c - 0.035, y - 0.035],
    ],
    [
      [c, y - 0.015],
      [d, y + 0.03],
    ],
  ];
}

/** A poster's paper and ink. Posters are sized in their own width (cqw), so they print the same at any size. */
function Sheet({ tone, ink, foot = true, children }: { tone: "bone" | "warm"; ink: "blue" | "ink"; foot?: boolean; children: ReactNode }) {
  return (
    <div className={`paper ${tone === "warm" ? "paper--warm" : ""} relative h-full w-full overflow-hidden [container-type:inline-size]`}>
      <div className={`riso absolute inset-0 flex flex-col ${ink === "blue" ? "text-[var(--c-blue)]" : "text-[var(--c-ink)]"}`}>
        {children}
        {/* The printer's registration marks, in two corners. */}
        <Register className="right-[2.2cqw] top-[2.2cqw]" />
        <Register className="bottom-[2.2cqw] left-[2.2cqw]" />
        {/* Who printed it and where, along the foot. */}
        {foot ? (
          <div className="absolute inset-x-[6cqw] bottom-[3.2cqw] flex items-end justify-between border-t-[0.35cqw] border-current pt-[1.6cqw]">
            <span className="display text-[3.6cqw] leading-none">{hero.wordmark}</span>
            <span className="meta text-[2.1cqw] leading-none">{colophon.where[1]}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** A registration mark: the crosshair a printer lines the passes up on. */
function Register({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={`absolute h-[3.4cqw] w-[3.4cqw] opacity-70 ${className}`}>
      <circle cx="10" cy="10" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M10 0 V20 M0 10 H20" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/** The flagship. */
function DevFestPoster() {
  const facts = [devfest.when, devfest.sponsor].filter((f): f is string => Boolean(f));
  return (
    <Sheet tone="bone" ink="blue" foot={false}>
      <div className="flex h-full flex-col px-[6cqw] pt-[5cqw]">
        <div className="meta flex justify-between gap-4 text-[2.2cqw] leading-tight">
          <span>{devfest.venue}</span>
          {facts.length ? <span className="text-right">{facts.join("  ")}</span> : null}
        </div>

        <div className="relative mt-[2.5cqw]">
          {/* The drum's second pass, a hair off register. */}
          <span aria-hidden="true" className="display absolute left-[0.5cqw] top-[0.35cqw] block text-[27.5cqw] leading-[0.78] opacity-25">
            {devfest.name}
          </span>
          <h2 id="devfest-title" className="display relative text-[27.5cqw] leading-[0.78]">
            {devfest.name}
          </h2>
        </div>

        <div className="mt-[1cqw] flex items-end justify-between gap-[4cqw]">
          <p className="display mb-[3cqw] max-w-[34%] text-[4.8cqw] leading-[0.95]">{devfestCopy.facts.join("  ")}</p>
          {/* The edition, printed as a tone. */}
          <span aria-label={`Edition ${devfest.edition}`} className="halftone-ramp display block text-[44cqw] leading-[0.76]">
            {devfest.edition}
          </span>
        </div>

        <p className="mt-[3.5cqw] max-w-[78%] text-[3.1cqw] leading-[1.42]">{devfest.blurb}</p>

        {/* The fest's own site, printed in the same one ink. */}
        {/* Cropped to the logos, which sit at the middle of the screenshot
            (the nav is above the crop and the button below it), so the print
            is centred on what it is for. Full width and high quality: at a
            phone's pixel density a small rendition is what read as blur. */}
        <div className="relative -mx-[6cqw] mt-auto h-[33cqw] overflow-hidden bg-[var(--c-blue)] [isolation:isolate]">
          <Image
            src="/images/work/devfest-site.jpg"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            quality={92}
            className="object-cover mix-blend-screen grayscale"
            style={{ objectPosition: "50% 51.3%" }}
          />
        </div>
      </div>
    </Sheet>
  );
}

/** The year's other posters, each laid out for what it is. */
function EventPoster({ event, index }: { event: Event; index: number }) {
  if (index === 0) {
    // Quark: the name up the side, the rest beside it.
    return (
      <Sheet tone="bone" ink="blue">
        <div className="flex h-full pb-[10cqw]">
          <p className="display shrink-0 rotate-180 px-[3cqw] text-[34cqw] leading-[0.8] [writing-mode:vertical-rl]">{event.name}</p>
          <div className="flex min-w-0 flex-1 flex-col justify-between pb-[13cqw] pl-[2cqw] pr-[6cqw] pt-[7cqw]">
            <p className="meta text-[4.4cqw] leading-tight">{event.kind}</p>
            <span aria-hidden="true" className="halftone-ramp mx-auto block aspect-square w-[80%] rounded-full bg-current" />
            <div>
              <p className="display text-[10cqw] leading-[0.9]">{event.when}</p>
              <p className="mt-[3cqw] text-[5cqw] leading-[1.3]">{event.note}</p>
            </div>
          </div>
        </div>
      </Sheet>
    );
  }
  if (index === 1) {
    // Waves: the name across the top, a tone falling away under it.
    return (
      <Sheet tone="warm" ink="ink">
        <div className="flex h-full flex-col px-[6cqw] pb-[12cqw] pt-[6cqw]">
          <p className="display text-[34cqw] leading-[0.78]">{event.name}</p>
          <div aria-hidden="true" className="halftone-ramp mt-[4cqw] h-[34cqw] rotate-180 bg-current" />
          <div className="mt-auto flex items-end justify-between gap-[4cqw]">
            <p className="display text-[11cqw] leading-[0.88]">{event.when}</p>
            <p className="meta max-w-[46%] text-right text-[4.2cqw] leading-tight">{event.kind}</p>
          </div>
          <p className="mt-[3cqw] text-[5cqw] leading-[1.3]">{event.note}</p>
        </div>
      </Sheet>
    );
  }
  if (index === 2) {
    // Workshops: the list of rooms is the poster.
    return (
      <Sheet tone="warm" ink="blue">
        <div className="flex h-full flex-col px-[6cqw] pb-[12cqw] pt-[6cqw]">
          <p className="meta text-[4.4cqw]">{event.kind}</p>
          <p className="display mt-[2cqw] text-[19cqw] leading-[0.8]">{event.name}</p>
          <p className="display mt-auto text-[13cqw] leading-[0.88]">{event.note}</p>
          <p className="meta mt-[4cqw] border-t-2 border-current pt-[2cqw] text-[4.4cqw]">{event.when}</p>
        </div>
      </Sheet>
    );
  }
  // Inductions: a notice, set plainly.
  return (
    <Sheet tone="bone" ink="ink">
      <div className="flex h-full flex-col px-[6cqw] pb-[12cqw] pt-[6cqw]">
        <p className="display border-b-[1.2cqw] border-current pb-[2cqw] text-[17cqw] leading-[0.8]">{event.name}</p>
        <p className="meta mt-[4cqw] text-[4.4cqw]">{event.kind}</p>
        <p className="display mt-auto text-[16cqw] leading-[0.86]">{event.note}</p>
        <p className="display mt-[4cqw] text-[9cqw] leading-none">{event.when}</p>
      </div>
    </Sheet>
  );
}

/**
 * Where the other posters are pasted: centre (shares of the frame), height
 * (share of the frame's height), tilt. On a wide frame two go either side of
 * the flagship. On a phone there is no room beside it, so they go above and
 * below it, two and two, tucked in behind its edges, instead of being cut to
 * unreadable fragments at the sides.
 */
const PASTED = [
  { x: 0.17, y: 0.33, h: 0.47, r: -2.2, phone: { x: 0.27, y: 0.155, h: 0.2, r: -3 } },
  { x: 0.2, y: 0.755, h: 0.4, r: 1.6, phone: { x: 0.73, y: 0.155, h: 0.2, r: 2.5 } },
  { x: 0.83, y: 0.335, h: 0.48, r: 2, phone: { x: 0.27, y: 0.895, h: 0.2, r: 2.5 } },
  { x: 0.8, y: 0.765, h: 0.39, r: -1.4, phone: { x: 0.73, y: 0.895, h: 0.2, r: -2.5 } },
];
const others = events.filter((e) => e.name !== devfest.name);

export function DevFest() {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <Scene id="devfest" aria-labelledby="devfest-title" stageClassName="px-[var(--gutter)] py-[10vh]">
        <div className="relative mx-auto aspect-[1/1.414] w-[min(62vh,88vw)]">
          <DevFestPoster />
          <div className="absolute -left-[7%] top-[1.5%]" style={{ rotate: "-10deg" }}>
            <PrintedTape words={devfestCopy.tape.slice(0, 2)} repeat={1} flow rotate={0} />
          </div>
        </div>
        <div className="mx-auto mt-12 grid max-w-[64rem] grid-cols-2 gap-8 md:grid-cols-4">
          {others.map((e, i) => (
            <div key={e.name} className="aspect-[1/1.414]">
              <EventPoster event={e} index={i} />
            </div>
          ))}
        </div>
      </Scene>
    );
  }
  return <MovingDevFest />;
}

function MovingDevFest() {
  const camera = useRef<HTMLDivElement>(null);
  const poster = useRef<HTMLDivElement>(null);
  const dim = useRef<HTMLDivElement>(null);
  const spill = useRef<HTMLDivElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLDivElement>(null);
  const tapes = useRef<(HTMLDivElement | null)[]>([]);
  const cones = useRef<(HTMLDivElement | null)[]>([]);
  const pasted = useRef<(HTMLDivElement | null)[]>([]);
  const [lights, setLights] = useState<LightPoint[][]>([]);
  const last = useRef(0);
  const apply = useRef<(p: number) => void>(() => {});
  const titleAt = crewTitleAt();

  useEffect(() => {
    const measure = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const narrow = w < 768;
      setLights(tubesFor(w));
      pasted.current.forEach((n, i) => {
        if (!n) return;
        const at = narrow ? PASTED[i].phone : PASTED[i];
        n.style.setProperty("left", `${at.x * 100}%`);
        n.style.setProperty("top", `${at.y * 100}%`);
        n.style.setProperty("height", `${at.h * h}px`);
        n.style.setProperty("width", `${(at.h * h) / 1.414}px`);
        n.style.setProperty("rotate", `${at.r}deg`);
      });
      requestAnimationFrame(() => apply.current(last.current));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const onProgress = useCallback((p: number) => {
    last.current = p;
    const po = poster.current;
    const cam = camera.current;
    if (!po || !cam) return;

    // The stage comes up as each tube catches; the other posters only get the spill.
    const lit = STRIKE.reduce((sum, at) => sum + tube(p, at), 0) / STRIKE.length;
    const out = lightsOut(p);
    // Never quite black: before the tubes strike, the poster is just made out in the dark.
    dim.current?.style.setProperty("opacity", (0.82 * Math.max(0, 1 - lit * out)).toFixed(3));
    spill.current?.style.setProperty("opacity", (1 - lit * out * 0.62).toFixed(3));
    cones.current.forEach((c, i) => c?.style.setProperty("opacity", (tube(p, STRIKE[i]) * out).toFixed(3)));
    // When the tubes go out the wall goes with them, leaving only what is stencilled on it.
    pasted.current.forEach((n) => n?.style.setProperty("opacity", out.toFixed(3)));
    board.current?.style.setProperty("opacity", out.toFixed(3));
    // What is stencilled behind the flagship only shows once it is coming down,
    // so nothing of the next scene is given away round its edges before then.
    title.current?.style.setProperty("opacity", span(p, FALL_FROM + 0.05, 0.93).toFixed(3));

    // The camera comes in on the flagship.
    const near = ease(span(p, 0.12, 0.62));
    cam.style.setProperty("transform", `scale(${(0.94 + near * 0.18).toFixed(4)})`);

    // Square to the camera; then off the wall, the top first, then it drops.
    const turn = ease(span(p, 0, 0.6));
    const fall = ease(span(p, FALL_FROM, 0.96));
    const drop = Math.pow(span(p, FALL_FROM + 0.04, 0.96), 1.6);
    po.style.setProperty(
      "transform",
      `translate3d(-50%, calc(-50% + ${(drop * 70).toFixed(2)}vh), 0) rotateY(${(-9 * (1 - turn)).toFixed(2)}deg) rotateX(${(3 * (1 - turn) - fall * 62).toFixed(2)}deg)`,
    );
    po.style.setProperty("opacity", (1 - span(p, 0.9, 0.96)).toFixed(3));

    // Tape down across two corners, and off again before the fall.
    const on = [span(p, 0.14, 0.24), span(p, 0.2, 0.3)];
    const off = [span(p, 0.72, 0.78), span(p, 0.74, 0.8)];
    tapes.current.forEach((t, i) => {
      t?.style.setProperty("clip-path", `inset(0 ${((1 - ease(on[i])) * 100).toFixed(2)}% 0 ${(ease(off[i]) * 100).toFixed(2)}%)`);
    });
  }, []);

  useEffect(() => {
    apply.current = onProgress;
  }, [onProgress]);

  const intensities = [
    useCallback((p: number) => tube(p, STRIKE[0]) * lightsOut(p), []),
    useCallback((p: number) => tube(p, STRIKE[1]) * lightsOut(p), []),
    useCallback((p: number) => tube(p, STRIKE[2]) * lightsOut(p), []),
  ];

  return (
    <Scene id="devfest" vh={440} vhMobile={340} settled={0.4} onProgress={onProgress} aria-labelledby="devfest-title">
      <div className="absolute inset-0 [perspective:1700px]">
        {/* The light off each tube, falling on the wall. */}
        {lights.map((pts, i) => {
          const [a, b] = pts;
          const left = Math.min(a[0], b[0]);
          const right = Math.max(a[0], b[0]);
          return (
            <div
              key={i}
              ref={(n) => {
                cones.current[i] = n;
              }}
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0"
              style={{
                left: `${(left - 0.08) * 100}%`,
                width: `${(right - left + 0.16) * 100}%`,
                top: `${Math.min(a[1], b[1]) * 100}%`,
                opacity: 0,
                background: "radial-gradient(50% 85% at 50% 0%, color-mix(in srgb, var(--c-bone) 11%, transparent), transparent 100%)",
              }}
            />
          );
        })}

        {/* Stencilled on the wall behind the flagship. */}
        <div
          ref={title}
          aria-hidden="true"
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${titleAt.x * 100}%`, top: `${titleAt.y * 100}%`, opacity: 0 }}
        >
          <CrewTitle />
        </div>

        <div ref={camera} className="absolute inset-0 origin-[50%_55%]">
          {/* The notice board: a painted board in a steel frame, bolted at the
              corners, that everything is pinned to. */}
          <div
            ref={board}
            aria-hidden="true"
            className="absolute inset-x-[2.5vw] bottom-[2.5vh] top-[6.5vh] max-md:inset-x-[1.5vw]"
            style={{
              backgroundColor: "#16181a",
              // The board's painted texture, knocked well back.
              backgroundImage: "linear-gradient(rgb(22 24 26 / 0.86), rgb(22 24 26 / 0.86)), url('/textures/grain.png')",
              backgroundSize: "auto, 128px 128px",
              boxShadow:
                "inset 0 0 0 1px rgb(255 255 255 / 0.04), inset 0 30px 60px -30px rgb(0 0 0 / 0.8), 0 0 0 10px #232528, 0 0 0 11px color-mix(in srgb, var(--c-steel) 45%, transparent), 0 40px 80px -30px rgb(0 0 0 / 0.9)",
            }}
          >
            {["-left-[6px] -top-[6px]", "-right-[6px] -top-[6px]", "-bottom-[6px] -left-[6px]", "-bottom-[6px] -right-[6px]"].map((pos) => (
              <span
                key={pos}
                className={`absolute ${pos} block h-[7px] w-[7px] rounded-full`}
                style={{ background: "radial-gradient(circle at 35% 30%, #c9c7c0, #6d6e69 60%, #33342f)" }}
              />
            ))}
          </div>

          {/* The rest of the year, pinned up round it. */}
          {others.map((e, i) => (
            <div
              key={e.name}
              ref={(n) => {
                pasted.current[i] = n;
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <EventPoster event={e} index={i} />
              <Tape className={i % 2 ? "-top-2 right-6" : "-top-2 left-6"} rotate={i % 2 ? 5 : -5} />
            </div>
          ))}
          {/* The spill: the other posters sit in the dark the tubes only half reach. */}
          <div
            ref={spill}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ opacity: 1, background: "radial-gradient(60% 70% at 50% 45%, transparent 30%, color-mix(in srgb, var(--c-ink) 88%, transparent) 75%)" }}
          />

          <div
            ref={poster}
            className="absolute left-1/2 top-[55%] aspect-[1/1.414] w-[min(56.5vh,86vw)] origin-bottom"
            style={{ transform: "translate3d(-50%, -50%, 0)" }}
          >
            <DevFestPoster />
            {/* Unlit: the dark of the stage over the paper, lifting as the tubes catch. */}
            <div ref={dim} aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[var(--c-ink)]" style={{ opacity: 0.82 }} />
            {/* Tape is laid along its own length: the clip is on a box turned
                to the tape's angle, so it reveals end to end. */}
            {[
              { className: "-left-[7%] -top-[0.5%]", rotate: -10, words: devfestCopy.tape.slice(0, 2) },
              { className: "-right-[8%] top-[68.5%]", rotate: 6, words: devfestCopy.tape.slice(2) },
            ].map((t, i) => (
              <div
                key={i}
                ref={(n) => {
                  tapes.current[i] = n;
                }}
                aria-hidden="true"
                className={`absolute ${t.className}`}
                style={{ rotate: `${t.rotate}deg`, clipPath: "inset(0 100% 0 0)" }}
              >
                <PrintedTape words={t.words} repeat={1} flow rotate={0} />
              </div>
            ))}
          </div>
        </div>

        {lights.map((pts, i) => (
          <Light key={i} kind="fixture" points={pts} intensity={intensities[i]} />
        ))}
      </div>
    </Scene>
  );
}
