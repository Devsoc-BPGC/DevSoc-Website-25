"use client";

/**
 * 11 Colophon
 * Back outside, in the morning. One room still lit.
 *
 * The questions end on the paper-coloured ground of the morning; the camera
 * comes back out to the building from the opening shot, now an ink silhouette
 * against the day, drawn from the same measured window grid as the hero plate
 * and with the same name on its roof. All six rooms are still lit. They go out
 * in the reverse of the order they came on at dusk, and the last one, the first
 * that came on, stays lit, with the light closing round its window: where the
 * night started.
 *
 * The building's ground floor is the directory: the pages, the elsewhere, the
 * address, and the one action, back to the top.
 *
 * Progress:
 *   0.00 - 0.12   the line, in the sky
 *   0.16 - 0.52   five rooms go out, one after another
 *   0.50 - 0.72   the light closes round the one that is left
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { Scene } from "@/components/world/Scene";
import { Light, span, type LightPoint } from "@/components/world/Light";
import { ActionLink } from "@/components/world/ActionLink";
import { facadeTall, facadeWide, type Plate } from "@/components/world/building";
import { useIsMobile, useReducedMotion } from "@/lib/useMedia";
import { colophon, hero } from "@/content/home";

/** The rooms that go out, in the reverse of the order they came on; the first to come on stays. */
const outOrder = [...hero.lightingOrder].reverse().slice(0, -1);
const stays = hero.lightingOrder[0];
const OUT_FROM = 0.16;
const OUT_STEP = 0.08;

/** A room's light: on, a starter's stutter as it goes, then off. Seeded by progress so it replays exactly. */
function roomLight(p: number, id: string) {
  const k = outOrder.indexOf(id);
  if (k < 0) return 1;
  const at = OUT_FROM + k * OUT_STEP;
  if (p < at) return 1;
  const t = p - at;
  if (t > 0.022) return 0;
  const h = Math.sin(Math.floor(t * 800) * 71.3 + k * 13.1) * 43758.5453;
  return h - Math.floor(h) > 0.5 ? 0.85 : 0.08;
}

/** The roof line above the top floor, in plate pixels. */
const roofOf = (plate: Plate) => plate.rows[0][0] - Math.round((plate.rows[1][0] - plate.rows[0][1]) * 0.9);

/**
 * Where the drawing is cut: at the floor slab under the lowest floor with a
 * room on it, so the frame ends on a whole floor and the ground floor below is
 * the directory, in the same ink.
 */
function cutOf(plate: Plate) {
  const lowest = Math.max(...Object.values(plate.rooms).map(([, r]) => r));
  const below = plate.rows[lowest + 1];
  return below ? Math.round((plate.rows[lowest][1] + below[0]) / 2) : plate.h;
}

/** The sign's height as a share of the building's width: letters, then legs. */
const SIGN = 0.14 * 0.78 + 0.02;

/** Height over width of the sign and the building together, so it can be sized to fit under the line. */
function tallness(plate: Plate) {
  const left = plate.cols[0][0] - 40;
  const right = plate.cols[plate.cols.length - 1][1] + 40;
  return (cutOf(plate) - roofOf(plate) + 24) / (right - left) + SIGN;
}

/** The building, drawn flat from the plate's measured grid. */
function Building({ plate, lampRefs }: { plate: Plate; lampRefs?: (id: string) => (n: SVGGElement | null) => void }) {
  const roof = roofOf(plate);
  const left = plate.cols[0][0] - 40;
  const right = plate.cols[plate.cols.length - 1][1] + 40;
  const byWindow = new Map(Object.entries(plate.rooms).map(([id, [c, r]]) => [`${c},${r}`, id]));
  return (
    <svg viewBox={`${left} ${roof - 24} ${right - left} ${cutOf(plate) - roof + 24}`} className="block h-auto w-full" aria-hidden="true">
      {/* The parapet, then the body. */}
      <rect x={left - 12} y={roof - 24} width={right - left + 24} height={30} fill="var(--c-ink)" />
      <rect x={left} y={roof} width={right - left} height={plate.h - roof} fill="var(--c-ink)" />
      {plate.rows.map(([y0, y1], r) =>
        plate.cols.map(([x0, x1], c) => {
          const room = byWindow.get(`${c},${r}`);
          const bar = y0 + (y1 - y0) * plate.mullion;
          return (
            <g key={`${c}-${r}`}>
              <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="color-mix(in srgb, var(--c-steel) 22%, var(--c-ink))" />
              {room ? (
                <g ref={lampRefs?.(room)}>
                  {/* The glow round a lit window, then the glass. */}
                  <rect x={x0 - 14} y={y0 - 14} width={x1 - x0 + 28} height={y1 - y0 + 28} fill="var(--light-core)" opacity={0.14} />
                  <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="var(--light-core)" />
                </g>
              ) : null}
              <rect x={x0} y={bar} width={x1 - x0} height={4} fill="var(--c-ink)" />
            </g>
          );
        }),
      )}
    </svg>
  );
}

/** The name on the roof, as a silhouette against the morning: letters on legs. */
function RoofSign() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-fit">
      <p className="display text-center text-[14cqw] leading-[0.78] text-[var(--c-ink)]">{hero.wordmark}</p>
      <div className="mx-[6%] flex h-[2cqw] justify-between">
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <span key={k} className="block h-full w-[0.35cqw] min-w-[3px] bg-[var(--c-ink)]" />
        ))}
      </div>
    </div>
  );
}

/** Back to the top: the one action, with its line pointing up. */
function BackToTop() {
  const lenis = useLenis();
  return (
    <button
      type="button"
      onClick={() => (lenis ? lenis.scrollTo(0, { duration: 2.4 }) : window.scrollTo({ top: 0 }))}
      className="group inline-flex items-center gap-3 font-medium leading-none text-[var(--c-bone)]"
    >
      <span
        aria-hidden="true"
        className="relative block h-9 w-px bg-current transition-[height] duration-700 ease-[var(--ease-out-expo)] group-hover:h-12 group-focus-visible:h-12"
      >
        <span className="absolute -top-px left-1/2 block h-[7px] w-[7px] -translate-x-1/2 rotate-[-45deg] border-r border-t border-current" />
      </span>
      {colophon.backToTop}
    </button>
  );
}

/** The ground floor: the directory, set like the plaque in a lobby. */
function GroundFloor() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[var(--c-ink)] px-[var(--gutter)] pb-[max(6vh,env(safe-area-inset-bottom))] pt-[6vh] text-[var(--c-bone)] md:pb-[8vh] md:pt-[8vh]">
      {/* Two columns on a phone (the pages beside the elsewhere) to keep the
          footer short; the note and the address take the full width. */}
      <div className="mx-auto grid max-w-[80rem] grid-cols-2 gap-x-6 gap-y-9 border-t border-[var(--c-steel)]/40 pt-8 md:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,0.7fr))] md:gap-12 md:pt-10">
        <div className="col-span-2 md:col-span-1">
          <p className="max-w-[44ch] text-[1.02rem] leading-[1.6] text-[var(--c-bone)]/85">{colophon.body}</p>
          <div className="mt-6">
            <ActionLink href={`mailto:${colophon.email}`} className="text-[1rem] text-[var(--c-bone)]" cursor="Write">
              {colophon.email}
            </ActionLink>
          </div>
        </div>
        <nav aria-label={colophon.headings.pages}>
          <p className="meta text-[0.78rem] text-[var(--c-gray)]">{colophon.headings.pages}</p>
          <ul className="mt-3 md:mt-4 md:space-y-2">
            {colophon.pages.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="block py-1.5 text-[1rem] hover:text-[var(--c-blue)] focus-visible:text-[var(--c-blue)] md:inline md:py-0">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="meta text-[0.78rem] text-[var(--c-gray)]">{colophon.headings.elsewhere}</p>
          <ul className="mt-3 md:mt-4 md:space-y-2">
            {colophon.elsewhere.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="block py-1.5 text-[1rem] hover:text-[var(--c-blue)] focus-visible:text-[var(--c-blue)] md:inline md:py-0">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-2 md:col-span-1">
          <p className="meta text-[0.78rem] text-[var(--c-gray)]">{colophon.headings.where}</p>
          <address className="mt-3 not-italic md:mt-4">
            {colophon.where.map((l, i) => (
              <span key={l} className="text-[1rem] leading-[1.7] md:block">
                {l}
                {i < colophon.where.length - 1 ? <span className="md:hidden">{", "}</span> : null}
              </span>
            ))}
          </address>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-[80rem] flex-wrap items-end justify-between gap-x-6 gap-y-5 md:mt-14">
        <p className="meta text-[0.78rem] text-[var(--c-gray)]">{colophon.credit(year)}</p>
        <BackToTop />
      </div>
    </footer>
  );
}

export function Colophon() {
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const plate = mobile ? facadeTall : facadeWide;
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const lamps = useRef<Record<string, SVGGElement | null>>({});
  const [outline, setOutline] = useState<LightPoint[]>([]);
  const last = useRef(reduced ? 1 : 0);
  const apply = useRef<(p: number) => void>(() => {});

  // The light's route: round the glass of the window that stays lit.
  useEffect(() => {
    const measure = () => {
      const el = root.current;
      const f = frame.current;
      if (!el || !f) return;
      const e = el.getBoundingClientRect();
      const r = f.getBoundingClientRect();
      const [c, row] = plate.rooms[stays];
      const roof = roofOf(plate);
      const left = plate.cols[0][0] - 40;
      const right = plate.cols[plate.cols.length - 1][1] + 40;
      const s = r.width / (right - left);
      const top = roof - 24;
      const pad = 10;
      const x0 = (r.left - e.left + (plate.cols[c][0] - left - pad) * s) / e.width;
      const x1 = (r.left - e.left + (plate.cols[c][1] - left + pad) * s) / e.width;
      const y0 = (r.top - e.top + (plate.rows[row][0] - top - pad) * s) / e.height;
      const y1 = (r.top - e.top + (plate.rows[row][1] - top + pad) * s) / e.height;
      setOutline([
        [x0, y0],
        [x1, y0],
        [x1, y1],
        [x0, y1],
        [x0, y0],
      ]);
      requestAnimationFrame(() => apply.current(last.current));
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [plate]);

  const onProgress = useCallback((p: number) => {
    last.current = p;
    const el = root.current;
    if (!el) return;
    el.style.setProperty("--line", span(p, 0, 0.1).toFixed(3));
    Object.entries(lamps.current).forEach(([id, g]) => g?.style.setProperty("opacity", roomLight(p, id).toFixed(3)));
  }, []);

  useEffect(() => {
    apply.current = onProgress;
  }, [onProgress]);

  const drawOutline = useCallback((p: number) => [0, span(p, 0.5, 0.72)] as const, []);

  return (
    <>
      <Scene id="colophon" vh={240} vhMobile={200} settled={1} onProgress={onProgress} aria-labelledby="colophon-line">
        {/* On a phone the line and the building stack, the line centred in the
            sky above the sign, so the space over the roof is used and not left
            empty; beside a wide frame they are placed by hand. */}
        <div ref={root} className="lit absolute inset-0 flex flex-col md:block">
          {/* The line, in the sky. */}
          <div
            className="text-center max-md:grid max-md:flex-1 max-md:place-items-center max-md:px-[var(--gutter)] max-md:pb-[3vh] max-md:pt-[calc(var(--nav-h)+1vh)] md:absolute md:inset-x-[var(--gutter)] md:top-[13vh]"
            style={{ opacity: "var(--line, 1)", translate: "0 calc((1 - var(--line, 1)) * 18px)" }}
          >
            {/* In blueprint blue, so it stays clear of the ink sign under it. */}
            <h2 id="colophon-line" className="display mx-auto max-w-[20ch] text-[clamp(2.2rem,min(5.2vw,8.5vh),5.2rem)] leading-[0.88] text-[var(--c-blue)] max-md:text-[clamp(2.6rem,12.5vw,3.6rem)]">
              {colophon.line}
            </h2>
          </div>

          {/* The building: its sign, its top floors, and below the frame its
              ground floor, which is the directory under this scene. */}
          {/* Sized to the frame's height as well as its width, so on a short,
              wide window the sign never reaches up into the line. */}
          <div
            className="relative mx-auto shrink-0 [container-type:inline-size] md:absolute md:bottom-0 md:left-1/2 md:-translate-x-1/2"
            style={{ width: `min(92vw, ${(56 / tallness(plate)).toFixed(1)}vh)` }}
          >
            <RoofSign />
            <div ref={frame}>
              <Building
                plate={plate}
                lampRefs={(id) => (n) => {
                  lamps.current[id] = n;
                }}
              />
            </div>
          </div>
          {outline.length ? <Light points={outline} draw={drawOutline} /> : null}
        </div>
      </Scene>
      <GroundFloor />
    </>
  );
}
