"use client";

/**
 * A sticky stage's progress, published to everything inside it.
 *
 * Reveals normally make their own ScrollTriggers off their own position. That
 * does not work inside a sticky stage. The element stops moving once the stage
 * sticks, but ScrollTrigger measures it at its unstuck position, so a short
 * heading crosses both its enter and its exit thresholds within a few hundred
 * pixels and lands on its exit pose before the section has properly begun. The
 * heading is then rotated away and invisible for the whole section.
 *
 * Pointing the triggers at the track instead only moves the problem: the track
 * is metres tall and ScrollTrigger's start/end arithmetic against a sticky
 * child stays awkward either way.
 *
 * So a stage publishes the one number it already computes, and reveals inside
 * map their playhead onto a window of it. No extra triggers at all, and it
 * obeys the rule the rest of the site is built on: everything in a scrubbed
 * section is a pure function of that section's progress, which is what makes
 * the reverse exact and free.
 */

import { createContext, useContext } from "react";

export type StageProgress = {
  /** Calls back with 0..1 whenever the stage moves. Returns an unsubscribe. */
  subscribe: (fn: (p: number) => void) => () => void;
  /** The latest value, for anything mounting mid-section. */
  get: () => number;
};

export const StageContext = createContext<StageProgress | null>(null);

export function useStage() {
  return useContext(StageContext);
}

/**
 * Where a reveal sits inside its section: arriving over the first slice,
 * settled through the middle, leaving over the last. Widening the middle is
 * what keeps a heading readable for most of a long stage.
 */
export const REVEAL_IN = 0.1;
export const REVEAL_OUT = 0.86;

/**
 * Maps stage progress to a playhead time in seconds.
 *
 * It has to be told where rest actually is. A through timeline is not
 * symmetric: the entrance carries the full stagger and the exit is shorter and
 * tighter, so rest sits nowhere near the halfway mark. Seeking to a fixed
 * fraction instead of to the label lands mid entrance and leaves the
 * last staggered characters permanently short of their settled pose, which
 * looks like a broken reveal rather than a mistimed one.
 */
export function stageTime(p: number, restAt: number, duration: number) {
  if (p <= REVEAL_IN) return (Math.max(0, p) / REVEAL_IN) * restAt;
  if (p < REVEAL_OUT) return restAt;
  const out = Math.min(1, (p - REVEAL_OUT) / (1 - REVEAL_OUT));
  return restAt + out * (duration - restAt);
}
