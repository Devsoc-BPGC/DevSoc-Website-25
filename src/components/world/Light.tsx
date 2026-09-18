"use client";

/**
 * Light
 * The one object that is in every scene. A fluorescent tube in the hero's
 * window and above the build desk, a lit cable across the archive and the crew
 * board, a scanner bar over the roll, the horizon at dawn. It changes shape;
 * it never changes identity, and that is what makes eleven chapters read as
 * one night instead of eleven designs.
 *
 * It is drawn, not faded. Its length along its route is a pure function of the
 * scene's progress, so scrolling back up un-draws it the way it came.
 *
 * Built in strokes, the way a lit tube actually reads: a wide, faint spill, a
 * tighter glow, and a thin hot core. There is no blur filter: a filter on a
 * stroke that is being redrawn is re-rasterised over its whole region on every
 * frame, which is what made long routes (the archive's cable) stutter. Three
 * stacked translucent strokes read as the same soft glow for nothing.
 *
 * A `fixture` is a tube you can see is a thing: a steel channel housing over
 * the tube, hung from the ceiling on two wires, with end caps. The fixture is
 * there whether the tube is lit or not, the way a switched-off light still is.
 *
 * The route is given in 0..1 of the host box and rebuilt in pixels on resize,
 * so strokes stay a true pixel width at any aspect ratio.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useMedia";
import { useStage } from "@/components/motion/stageContext";

export type LightKind = "tube" | "fixture" | "cable" | "scan" | "horizon";
export type LightPoint = readonly [number, number];

/** A tube lights once per visit, with a starter's stutter. Only the first. */
let hasFlickered = false;

/** Stroke widths, widest first: spill, glow, then the core. */
const STROKES: Record<LightKind, { spill: number[]; glow: number; core: number }> = {
  tube: { spill: [26, 14], glow: 5, core: 1.75 },
  fixture: { spill: [30, 16], glow: 7, core: 3.4 },
  cable: { spill: [16, 9], glow: 3.5, core: 1.4 },
  scan: { spill: [34, 18], glow: 6, core: 2 },
  horizon: { spill: [70, 34], glow: 10, core: 2 },
};

function toPixels(points: readonly LightPoint[], w: number, h: number) {
  return points.map(([x, y]) => [x * w, y * h] as const);
}

function buildPath(points: readonly LightPoint[], w: number, h: number, kind: LightKind, sag: number) {
  if (points.length < 2) return "";
  const px = toPixels(points, w, h);
  let d = `M${px[0][0].toFixed(1)} ${px[0][1].toFixed(1)}`;
  for (let i = 1; i < px.length; i++) {
    const [ax, ay] = px[i - 1];
    const [bx, by] = px[i];
    if (kind === "cable") {
      // A cable hangs: the control point sits below the midpoint by a share
      // of the span, which is close enough to a catenary at these lengths.
      const len = Math.hypot(bx - ax, by - ay);
      const cx = (ax + bx) / 2;
      const cy = (ay + by) / 2 + len * sag;
      d += ` Q${cx.toFixed(1)} ${cy.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`;
    } else {
      d += ` L${bx.toFixed(1)} ${by.toFixed(1)}`;
    }
  }
  return d;
}

/** The housing and hangers for each straight run of a fixture. */
function buildFixture(points: readonly LightPoint[], w: number, h: number) {
  const px = toPixels(points, w, h);
  const parts: { housing: string; lip: string; hangers: [number, number, number][] }[] = [];
  for (let i = 1; i < px.length; i++) {
    const [ax, ay] = px[i - 1];
    const [bx, by] = px[i];
    const len = Math.hypot(bx - ax, by - ay) || 1;
    const dx = (bx - ax) / len;
    const dy = (by - ay) / len;
    // The normal that points up the frame: the housing sits above the tube.
    let nx = dy;
    let ny = -dx;
    if (ny > 0) {
      nx = -nx;
      ny = -ny;
    }
    const over = 10;
    const at = (t: number, off: number, along = 0) => [ax + dx * (t * len + along) + nx * off, ay + dy * (t * len + along) + ny * off] as const;
    const q = [at(0, 3, -over), at(1, 3, over), at(1, 13, over - 4), at(0, 13, -over + 4)];
    const housing = `M${q.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L")} Z`;
    const l0 = at(0, 3.5, -over + 2);
    const l1 = at(1, 3.5, over - 2);
    const lip = `M${l0[0].toFixed(1)} ${l0[1].toFixed(1)} L${l1[0].toFixed(1)} ${l1[1].toFixed(1)}`;
    // Two wires, a fifth in from each end, straight up to the ceiling.
    const hangers = [0.2, 0.8].map((t) => {
      const [x, y] = at(t, 13);
      return [x, y, 0] as [number, number, number];
    });
    parts.push({ housing, lip, hangers });
  }
  return parts;
}

/** Whether the page's opening is still covering it; lights wait for it to open. */
function overtureOpen(start: () => void) {
  if (
    typeof document === "undefined" ||
    document.documentElement.classList.contains("overture-seen") ||
    !document.querySelector(".overture:not([data-open])")
  ) {
    start();
    return () => {};
  }
  window.addEventListener("overture:open", start, { once: true });
  return () => window.removeEventListener("overture:open", start);
}

export type LightProps = {
  points: readonly LightPoint[];
  kind?: LightKind;
  /** Cable sag, as a share of each span. */
  sag?: number;
  /**
   * Which stretch of the route is lit at scene progress `p`, as [start, end]
   * shares of its length. Omit for a light that is simply on.
   */
  draw?: (p: number) => readonly [number, number];
  /** Brightness at progress `p`, 0 to 1. */
  intensity?: (p: number) => number;
  /** Stutter on first light, once per visit. */
  flicker?: boolean;
  /**
   * Seconds before the first-light stutter starts. Until then the glow shows
   * faintly and the core stays dark, which is what a tube does while its
   * starter is still trying.
   */
  flickerDelay?: number;
  className?: string;
};

export function Light({
  points,
  kind = "tube",
  sag = 0.14,
  draw,
  intensity,
  flicker = false,
  flickerDelay = 0,
  className,
}: LightProps) {
  const host = useRef<HTMLDivElement>(null);
  const group = useRef<SVGGElement>(null);
  const core = useRef<SVGGElement>(null);
  const capA = useRef<SVGRectElement>(null);
  const capB = useRef<SVGRectElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const stage = useStage();
  const reduced = useReducedMotion();
  const tubeLike = kind === "tube" || kind === "fixture";

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((s) => (Math.abs(s.w - width) < 1 && Math.abs(s.h - height) < 1 ? s : { w: width, h: height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const d = useMemo(() => buildPath(points, size.w, size.h, kind, sag), [points, size.w, size.h, kind, sag]);
  const fixture = useMemo(() => (kind === "fixture" && size.w ? buildFixture(points, size.w, size.h) : []), [kind, points, size.w, size.h]);
  const s = STROKES[kind];

  useGSAP(
    () => {
      const g = group.current;
      if (!g || !d) return;
      const paths = Array.from(g.querySelectorAll<SVGPathElement>("path[data-lit]"));
      const probe = paths[paths.length - 1];
      const length = probe.getTotalLength();

      const placeCap = (cap: SVGRectElement | null, at: number) => {
        if (!cap || !tubeLike) return;
        const l = Math.max(0.5, Math.min(length - 0.5, at * length));
        const p = probe.getPointAtLength(l);
        const q = probe.getPointAtLength(Math.min(length, l + 0.5));
        const angle = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
        cap.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(${angle})`);
      };

      let lit = false;
      let cancel = () => {};
      const apply = (p: number) => {
        const [a, b] = draw ? draw(p) : [0, 1];
        const on = b - a > 0.001;
        g.style.opacity = on ? String(intensity ? intensity(p) : 1) : "0";
        if (!on) return;
        gsap.set(paths, { drawSVG: `${(a * 100).toFixed(3)}% ${(b * 100).toFixed(3)}%` });
        placeCap(capA.current, a);
        placeCap(capB.current, b);

        if (flicker && !lit && !hasFlickered && !reduced && core.current) {
          lit = true;
          hasFlickered = true;
          const c = core.current;
          // Dim straight away, then strike once the page is open and the delay is up.
          gsap.set(c, { opacity: 0.15 });
          cancel = overtureOpen(() => {
            gsap
              .timeline({ delay: flickerDelay })
              .to(c, { opacity: 0.9, duration: 0.05, ease: "none" }, 0.08)
              .to(c, { opacity: 0.2, duration: 0.04, ease: "none" }, 0.2)
              .to(c, { opacity: 1, duration: 0.05, ease: "none" }, 0.34)
              .to(c, { opacity: 0.45, duration: 0.04, ease: "none" }, 0.52)
              .to(c, { opacity: 1, duration: 0.18, ease: "none" }, 0.6);
          });
        }
      };

      if (!stage) {
        apply(1);
        return () => cancel();
      }
      const off = stage.subscribe(apply);
      return () => {
        off();
        cancel();
      };
    },
    { dependencies: [d, stage, draw, intensity, flicker, flickerDelay, reduced, kind] },
  );

  const capW = kind === "fixture" ? 7 : 4;
  const capH = kind === "fixture" ? 12 : 9;

  return (
    <div ref={host} className={`pointer-events-none absolute inset-0 ${className ?? ""}`} aria-hidden="true">
      {size.w > 0 && d ? (
        <svg width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} className="absolute inset-0 overflow-visible">
          {/* The fixture itself, lit or not. */}
          {fixture.length ? (
            <g>
              {fixture.map((f, i) => (
                <g key={i}>
                  {f.hangers.map(([x, y], k) => (
                    <line key={k} x1={x} y1={y} x2={x} y2={0} stroke="#3a3c3a" strokeWidth={1} />
                  ))}
                  <path d={f.housing} fill="#1d1f21" stroke="color-mix(in srgb, var(--c-steel) 70%, transparent)" strokeWidth={1} />
                </g>
              ))}
            </g>
          ) : null}

          <g ref={group} style={{ opacity: 0 }} fill="none" strokeLinecap={tubeLike ? "butt" : "round"} strokeLinejoin="round">
            {s.spill.map((wd, i) => (
              <path key={wd} data-lit="" d={d} stroke="var(--light-halo)" strokeWidth={wd} strokeOpacity={i === 0 ? 0.07 : 0.13} strokeLinecap="round" />
            ))}
            <path data-lit="" d={d} stroke="var(--light-halo)" strokeWidth={s.glow} strokeOpacity={0.5} />
            <g ref={core}>
              <path data-lit="" d={d} stroke="var(--light-core)" strokeWidth={s.core} />
            </g>
            {/* The underside of the housing catches the tube. */}
            {fixture.map((f, i) => (
              <path key={`lip${i}`} d={f.lip} stroke="var(--light-core)" strokeOpacity={0.35} strokeWidth={1} />
            ))}
            {tubeLike ? (
              <>
                <rect ref={capA} x={-capW / 2} y={-capH / 2} width={capW} height={capH} fill="var(--c-steel)" />
                <rect ref={capB} x={-capW / 2} y={-capH / 2} width={capW} height={capH} fill="var(--c-steel)" />
              </>
            ) : null}
          </g>
        </svg>
      ) : null}
    </div>
  );
}

/** Eases a stretch of progress into 0..1. The Light's draw functions use it. */
export function span(p: number, from: number, to: number) {
  return Math.min(1, Math.max(0, (p - from) / (to - from)));
}
