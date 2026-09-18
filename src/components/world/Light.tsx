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
 * scene's progress, so scrolling back up un-draws it the way it came. Where one
 * scene's light leaves the frame is exactly where the next scene's begins; the
 * handoff points live in `lightRoute.ts` so no two scenes can disagree.
 *
 * Built in three strokes, the way a lit tube actually reads: a wide soft halo,
 * a tighter glow, and a thin hot core. The halo is the only blurred thing and
 * the blur is a static SVG gaussian in user space. It has to be in user space:
 * a straight horizontal tube has a zero-height bounding box, and a filter sized
 * against the bounding box renders nothing at all.
 *
 * The route is given in 0..1 of the host box and rebuilt in pixels on resize,
 * so strokes stay a true pixel width at any aspect ratio instead of being
 * stretched by `preserveAspectRatio="none"`.
 */

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useMedia";
import { useStage } from "@/components/motion/stageContext";

export type LightKind = "tube" | "cable" | "scan" | "horizon";
export type LightPoint = readonly [number, number];

/** A tube lights once per visit, with a starter's stutter. Only the first. */
let hasFlickered = false;

const STROKES: Record<LightKind, { halo: number; glow: number; core: number }> = {
  tube: { halo: 18, glow: 5, core: 1.75 },
  cable: { halo: 12, glow: 3.5, core: 1.4 },
  scan: { halo: 26, glow: 6, core: 2 },
  horizon: { halo: 44, glow: 9, core: 2 },
};

function buildPath(points: readonly LightPoint[], w: number, h: number, kind: LightKind, sag: number) {
  if (points.length < 2) return "";
  const px = points.map(([x, y]) => [x * w, y * h] as const);
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
   * Seconds before the first-light stutter starts. Until then the halo shows
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
  const fid = useId().replace(/:/g, "");

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
  const s = STROKES[kind];
  /**
   * The blur only has to cover the route, not the whole host. On a long wall
   * or a tall sheet the host is thousands of pixels, and a blur region that
   * size is re-rendered every time the drawn length changes.
   */
  const region = useMemo(() => {
    if (!points.length) return { x: 0, y: 0, w: 0, h: 0 };
    const xs = points.map(([x]) => x * size.w);
    const ys = points.map(([, y]) => y * size.h);
    let span = 0;
    for (let i = 1; i < points.length; i++) span = Math.max(span, Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1]));
    const pad = s.halo * 2 + 20;
    const x0 = Math.min(...xs) - pad;
    const y0 = Math.min(...ys) - pad;
    return {
      x: x0,
      y: y0,
      w: Math.max(...xs) + pad - x0,
      h: Math.max(...ys) + pad + (kind === "cable" ? span * sag : 0) - y0,
    };
  }, [points, size.w, size.h, s.halo, kind, sag]);

  useGSAP(
    () => {
      const g = group.current;
      if (!g || !d) return;
      const paths = Array.from(g.querySelectorAll<SVGPathElement>("path"));
      const probe = paths[paths.length - 1];
      const length = probe.getTotalLength();

      const placeCap = (cap: SVGRectElement | null, at: number) => {
        if (!cap || kind !== "tube") return;
        const l = Math.max(0.5, Math.min(length - 0.5, at * length));
        const p = probe.getPointAtLength(l);
        const q = probe.getPointAtLength(Math.min(length, l + 0.5));
        const angle = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
        cap.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(${angle})`);
      };

      let lit = false;
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
          // Dim straight away, then strike after the delay.
          gsap.set(core.current, { opacity: 0.15 });
          gsap
            .timeline({ delay: flickerDelay })
            .to(core.current, { opacity: 0.9, duration: 0.05, ease: "none" }, 0.08)
            .to(core.current, { opacity: 0.2, duration: 0.04, ease: "none" }, 0.2)
            .to(core.current, { opacity: 1, duration: 0.05, ease: "none" }, 0.34)
            .to(core.current, { opacity: 0.45, duration: 0.04, ease: "none" }, 0.52)
            .to(core.current, { opacity: 1, duration: 0.18, ease: "none" }, 0.6);
        }
      };

      if (!stage) {
        apply(1);
        return;
      }
      return stage.subscribe(apply);
    },
    { dependencies: [d, stage, draw, intensity, flicker, flickerDelay, reduced, kind] },
  );

  return (
    <div ref={host} className={`pointer-events-none absolute inset-0 ${className ?? ""}`} aria-hidden="true">
      {size.w > 0 && d ? (
        <svg width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} className="absolute inset-0 overflow-visible">
          <defs>
            <filter id={fid} filterUnits="userSpaceOnUse" x={region.x} y={region.y} width={region.w} height={region.h}>
              <feGaussianBlur stdDeviation={s.halo / 3} />
            </filter>
          </defs>
          <g ref={group} style={{ opacity: 0 }} fill="none" strokeLinecap={kind === "tube" ? "butt" : "round"} strokeLinejoin="round">
            <path d={d} stroke="var(--light-halo)" strokeWidth={s.halo} strokeOpacity={0.3} filter={`url(#${fid})`} />
            <path d={d} stroke="var(--light-halo)" strokeWidth={s.glow} strokeOpacity={0.55} />
            <g ref={core}>
              <path d={d} stroke="var(--light-core)" strokeWidth={s.core} />
            </g>
            {kind === "tube" ? (
              <>
                <rect ref={capA} x={-2} y={-4.5} width={4} height={9} fill="var(--c-steel)" />
                <rect ref={capB} x={-2} y={-4.5} width={4} height={9} fill="var(--c-steel)" />
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
