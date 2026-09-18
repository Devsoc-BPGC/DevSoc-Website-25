/**
 * The ring the six rooms gather into.
 *
 * Society ends with the six room modules lifting off the floor plan and
 * settling in a circle in the middle of the frame; Rooms begins with the same
 * six in the same circle and turns it into the rotary. Both scenes place the
 * modules with this one function, so the last frame of one and the first frame
 * of the next agree to the pixel on any screen.
 */

export const RING_N = 6;

/** Centre and radius of the ring for a frame of `w` by `h` pixels. */
export function ringFrame(w: number, h: number) {
  const narrow = w < 768;
  return {
    cx: w / 2,
    cy: h * (narrow ? 0.5 : 0.54),
    r: narrow ? Math.min(w * 0.34, h * 0.24) : Math.min(w * 0.3, h * 0.3),
  };
}

/** Where module `i` of `n` sits: clockwise from the top. */
export function ringSlot(i: number, w: number, h: number, n = RING_N) {
  const { cx, cy, r } = ringFrame(w, h);
  const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}
