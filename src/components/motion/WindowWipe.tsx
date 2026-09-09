"use client";

/**
 * WindowWipe
 * A tonal takeover that arrives the way light actually arrives on this site:
 * through openings in a wall, one bay after another.
 *
 * Whatever you put inside is revealed through a mask cut into vertical bays.
 * As progress runs, each bay fills from the left of the frame to the right on
 * a stagger, so the daylight crosses the facade rather than appearing on it,
 * and then keeps going and leaves the same way. Give it the inverted copy of a
 * section and drive `set(progress)` from a ScrollTrigger.
 *
 *   const wipe = useRef<WindowWipeHandle>(null);
 *   <WindowWipe ref={wipe}>{invertedCopy}</WindowWipe>
 *   // in onUpdate: wipe.current?.set(self.progress)
 *
 * This replaced a grainy diagonal ink flood. The flood was a good effect and
 * the wrong one: it spoke print, ink soaking into paper, while everything else
 * here speaks light through an opening. A building whose whole argument is
 * which of its windows are lit should not change state by being spilled on.
 *
 * The hard vertical edges between bays are the point and not an artefact. A
 * feathered wipe is a transition; a row of straight sided panels filling in
 * sequence is a wall of windows. The softness lives in *when* each bay arrives,
 * not in its edge.
 *
 * The mask is one string of CSS gradient layers rewritten per frame, which
 * costs a single style write and no canvas, no bitmap and no repaint budget.
 * Each layer is a flat colour whose alpha is that bay's fill.
 *
 * Presentational: always aria-hidden, never interactive. The uninverted copy
 * underneath carries the real content.
 */

import { forwardRef, useImperativeHandle, useMemo, useRef, type ReactNode } from "react";

export type WindowWipeHandle = { set(progress: number): void };

export type WindowWipeProps = {
  children: ReactNode;
  className?: string;
  /** How many bays the wall is cut into. */
  bays?: number;
  /** Where the light starts arriving, and where the last bay is full. */
  inFrom?: number;
  inTo?: number;
  /** Where it starts leaving, and where the last bay is dark again. */
  outFrom?: number;
  outTo?: number;
};

/** How far each bay reaches past its slot, in percent of the frame. */
const OVERLAP = 0.6;

/** Smooth at both ends, so a bay does not snap on at the edge of its window. */
function smoothstep(t: number) {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

/**
 * One bay's fill. `sweep` is the share of the total travel each bay takes for
 * itself; the rest is the stagger, which is what makes the light cross rather
 * than fade up everywhere at once.
 *
 * It has to be small. The number of bays in transition at any moment is
 * roughly `sweep * (bays - 1) / (1 - sweep)`, and a half filled bay is the
 * bone ground and the night ground averaged, which is grey. Let eight of the
 * twelve be half filled at once and the wall stops reading as windows that are
 * on or off and starts reading as a greyscale ramp. At this value one bay is
 * mid change and the edge between lit and unlit stays hard.
 */
function bay(p: number, from: number, to: number, t: number, sweep = 0.13) {
  const span = to - from;
  if (span <= 0) return p >= to ? 1 : 0;
  const start = from + t * span * (1 - sweep);
  return smoothstep((p - start) / (span * sweep));
}

export const WindowWipe = forwardRef<WindowWipeHandle, WindowWipeProps>(function WindowWipe(
  { children, className, bays = 12, inFrom = 0.18, inTo = 0.58, outFrom = 0.76, outTo = 1 },
  ref,
) {
  const el = useRef<HTMLDivElement>(null);

  /**
   * Bay geometry never changes, so size and position are built once. The
   * percentage for `mask-position` is not the bay's left edge: a percentage
   * positions the mask *within the space it has left over*, so bay i of n sits
   * at i / (n - 1).
   */
  const fixed = useMemo(() => {
    const step = 100 / bays;
    // Each bay is drawn a hair wider than its slot so neighbours overlap.
    // Butted exactly edge to edge they leave a hairline seam at every join,
    // eleven of them across a fully lit wall, because each layer is antialiased
    // against nothing on the other side. The overlap costs nothing: where both
    // neighbours are full the result is still full.
    const w = step + OVERLAP;
    const size: string[] = [];
    const pos: string[] = [];
    for (let i = 0; i < bays; i++) {
      size.push(`${w.toFixed(4)}% 100%`);
      // A percentage positions the mask within the space left over, not at an
      // absolute offset, so the left edge of bay i needs dividing through by
      // what is left after the mask's own width.
      const left = Math.min(100, Math.max(0, ((i * step) / (100 - w)) * 100));
      pos.push(`${left.toFixed(4)}% 0`);
    }
    return { size: size.join(","), pos: pos.join(","), repeat: Array(bays).fill("no-repeat").join(",") };
  }, [bays]);

  useImperativeHandle(
    ref,
    () => ({
      set(p: number) {
        const node = el.current;
        if (!node) return;
        const layers: string[] = [];
        for (let i = 0; i < bays; i++) {
          const t = bays === 1 ? 0 : i / (bays - 1);
          const a = bay(p, inFrom, inTo, t) * (1 - bay(p, outFrom, outTo, t));
          layers.push(`linear-gradient(rgba(0,0,0,${a.toFixed(4)}),rgba(0,0,0,${a.toFixed(4)}))`);
        }
        const image = layers.join(",");
        node.style.maskImage = image;
        node.style.webkitMaskImage = image;
      },
    }),
    [bays, inFrom, inTo, outFrom, outTo],
  );

  return (
    <div
      ref={el}
      className={`pointer-events-none absolute inset-0 ${className ?? ""}`}
      aria-hidden="true"
      style={{
        maskImage: "linear-gradient(rgba(0,0,0,0),rgba(0,0,0,0))",
        WebkitMaskImage: "linear-gradient(rgba(0,0,0,0),rgba(0,0,0,0))",
        maskSize: fixed.size,
        WebkitMaskSize: fixed.size,
        maskPosition: fixed.pos,
        WebkitMaskPosition: fixed.pos,
        maskRepeat: fixed.repeat,
        WebkitMaskRepeat: fixed.repeat,
      }}
    >
      {children}
    </div>
  );
});
