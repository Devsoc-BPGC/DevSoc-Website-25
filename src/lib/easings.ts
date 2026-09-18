/**
 * The timing language.
 *
 * Every section on this site moves differently on purpose. What stops that
 * variety from turning into noise is that all of it is drawn from one small set
 * of eases and durations, reused everywhere. The rule that enforces it: no
 * `ease:` or `duration:` literal may appear in a component. If a number is not
 * in this file, it does not go in a tween.
 *
 * Slow, smooth, exponential. No bounce, no elastic, no spring, anywhere.
 */

/** Arrivals, departures, takeovers, and the one that is never anything else. */
export const EASE = {
  /** Arrivals. Also the global gsap default, set in lib/gsap.ts. */
  out: "expo.out",
  /** Departures. The mirror of `out`: same shape, faster tail. */
  in: "power2.in",
  /** Takeovers, veils, chrome swaps. Symmetric, so it reads the same reversed. */
  inOut: "power3.inOut",
  /**
   * Camera moves: pushes, tips, pans between scenes. Slow to leave, slow to
   * arrive, so the frame feels carried by something heavy rather than yanked.
   */
  camera: "expo.inOut",
  /**
   * Scrubs, and the playhead tweens that drive a through-timeline. Never
   * anything else: the eases and staggers baked into the timeline are what you
   * are meant to see, and a second ease on the playhead would double them up.
   */
  none: "none",
} as const;

/** Motion (framer) wants arrays, and CSS wants strings. Same curves. */
export const EASE_OUT_ARR: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_OUT_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";
export const EASE_INOUT_ARR: [number, number, number, number] = [0.65, 0, 0.35, 1];

export const DUR = {
  hover: 0.6,
  reveal: 1.1,
  revealSlow: 1.4,
  /** Exits are always quicker than entrances. Roughly two thirds of `reveal`. */
  exit: 0.72,
  cursor: 0.18,
  scrub: 1.2,
  /** The fixed chrome changing tone under a section boundary. */
  chrome: 0.45,
  /** How long the velocity mark takes to ease back to its resting speed. */
  settle: 1.0,
} as const;

/**
 * How hard a scrub lags the scroll. Named rather than ad hoc, because the
 * difference between 0.6 and 2.0 is the difference between a mechanism that
 * feels attached to your hand and one that feels attached to the page.
 */
export const SCRUB = {
  tight: 0.6,
  normal: 1.2,
  loose: 2.0,
} as const;

/**
 * The ratio is the language: characters are roughly four times tighter than
 * lines, so a forty character headline and a four line paragraph take about the
 * same wall clock time to arrive.
 */
export const STAGGER = {
  chars: 0.018,
  words: 0.045,
  lines: 0.07,
  rows: 0.06,
} as const;
