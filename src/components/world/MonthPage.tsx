/**
 * MonthPage
 * The first month's page: pinned up folded at the end of the log, then hung as
 * the calendar in the next scene.
 *
 * The log's camera brings the folded sheet forward until it sits exactly where
 * the calendar hangs, and the calendar starts from that frame. Both scenes
 * draw the page with `MonthCover` and place it with `monthPageRect`, and every
 * size on the page is a share of its own width (cqw), so the same page drawn
 * at two sizes is the same picture.
 */

import type { CSSProperties, ReactNode } from "react";
import { firstMonth } from "@/content/home";

/** Portrait, the shape of a sheet of paper. */
export const PAGE_RATIO = 1.32;

/** Where the calendar hangs on a frame of `W` by `H`: its centre and size, in pixels. */
export function monthPageRect(W: number, H: number) {
  if (W < 768) {
    const w = W * 0.86;
    const h = w * PAGE_RATIO;
    return { cx: W / 2, cy: H * 0.085 + h / 2, w, h };
  }
  const h = H * 0.8;
  const w = h / PAGE_RATIO;
  return { cx: W * 0.44, cy: H * 0.54, w, h };
}

/** The page's slight tilt on its pin. */
export const PAGE_TILT = 0.8;

/** A round pin head, for anything pinned to the wall. */
export function Pin({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute block -translate-x-1/2 -translate-y-1/2 rounded-full ${className ?? ""}`}
      style={{
        background: "radial-gradient(circle at 35% 30%, #d8d6d0, #777872 55%, #3a3b38)",
        boxShadow: "0 2px 3px rgb(13 14 12 / 0.6)",
        ...style,
      }}
    />
  );
}

/**
 * The page itself: the title across the top, the creases it was folded
 * along, and its pin. Whatever the calendar adds goes in `children`.
 */
export function MonthCover({ children, creases = 1, className }: { children?: ReactNode; creases?: number | string; className?: string }) {
  return (
    <div className={`paper paper--quiet relative h-full w-full [container-type:inline-size] ${className ?? ""}`}>
      {/* Big Shoulders has an optical size axis, so the same title set at two
          sizes would wrap differently. Pinned to one design, it scales as a
          picture does, and the log's small page and the calendar's large one
          break the title on the same word. */}
      <p
        className="display px-[8cqw] pt-[11cqw] text-[12cqw] leading-[0.88] text-[var(--c-ink)]"
        style={{ fontOpticalSizing: "none", fontVariationSettings: '"opsz" 72' }}
      >
        {firstMonth.title}
      </p>
      {/* The folds: each crease a hairline with the panel below it a shade darker. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/3 h-1/3 border-t border-[var(--c-ink)]/10 bg-[linear-gradient(rgb(13_14_12/0.07),transparent_40%)]"
        style={{ opacity: creases }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-2/3 h-1/3 border-t border-[var(--c-ink)]/10 bg-[linear-gradient(rgb(13_14_12/0.05),transparent_40%)]"
        style={{ opacity: creases }}
      />
      {children}
      <Pin className="left-1/2 top-[4cqw] h-[3.6cqw] w-[3.6cqw]" />
    </div>
  );
}
