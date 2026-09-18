/**
 * Tape
 * What holds a sheet to a wall, or crosses a poster with a printed message.
 *
 * Masking tape is a translucent warm strip with ragged short ends. Production
 * tape is opaque, printed, and long; it carries the second ticker's copy across
 * the DevFest poster the way a crew tapes over a board.
 *
 * Placement is the caller's: position it absolutely over a sheet's corner.
 */

import type { CSSProperties } from "react";

/** Ragged short ends, the long edges straight, as tape actually tears. */
const RAGGED =
  "polygon(0% 8%, 1.4% 0%, 98.2% 0%, 100% 12%, 99% 34%, 100% 58%, 98.8% 80%, 100% 100%, 1.6% 100%, 0% 88%, 1.1% 64%, 0% 41%, 1.3% 22%)";

export function Tape({
  className,
  style,
  rotate = -4,
}: {
  className?: string;
  style?: CSSProperties;
  rotate?: number;
}) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute block h-[1.35rem] w-[5.5rem] ${className ?? ""}`}
      style={{
        rotate: `${rotate}deg`,
        clipPath: RAGGED,
        background: "color-mix(in srgb, var(--c-paper) 78%, transparent)",
        backgroundImage: "url('/textures/paper.jpg')",
        backgroundBlendMode: "multiply",
        backgroundSize: "384px 384px",
        boxShadow: "0 1px 2px rgb(13 14 12 / 0.25)",
        ...style,
      }}
    />
  );
}

/**
 * Printed production tape. The words repeat to fill whatever length it is laid
 * at; a separating square keeps them apart the way printed tape does.
 */
export function PrintedTape({
  words,
  className,
  style,
  rotate = -6,
}: {
  words: string[];
  className?: string;
  style?: CSSProperties;
  rotate?: number;
}) {
  const run = [...words, ...words, ...words];
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute flex items-center overflow-hidden whitespace-nowrap ${className ?? ""}`}
      style={{
        rotate: `${rotate}deg`,
        background: "var(--c-blue)",
        color: "var(--c-bone)",
        boxShadow: "0 2px 3px rgb(13 14 12 / 0.35)",
        ...style,
      }}
    >
      {run.map((w, i) => (
        <span key={`${w}-${i}`} className="display flex items-center gap-4 px-4 text-[1.05rem] tracking-[0.04em]">
          {w}
          <span className="inline-block h-[0.4em] w-[0.4em] bg-current" />
        </span>
      ))}
    </div>
  );
}
