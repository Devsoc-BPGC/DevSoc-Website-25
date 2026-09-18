/**
 * Label
 * The small printed things in the world that carry names and numbers. Each
 * variant is a real object with a reason to exist, which is what separates it
 * from an eyebrow: a room plate is on a door, a stamp is on a sheet, a plaque
 * is on a building.
 *
 *   plate    a room plate: room number over the room's name, blueprint blue
 *   stamp    an inked rubber stamp, rotated, with a worn edge
 *   plaque   an address plaque: stacked lines between two rules
 */

import type { CSSProperties, ReactNode } from "react";

export function RoomPlate({
  number,
  name,
  className,
  style,
}: {
  number: string;
  name: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`inline-flex flex-col gap-0.5 bg-[var(--c-blue)] px-2.5 py-1.5 text-[var(--c-bone)] ${className ?? ""}`}
      style={style}
    >
      <span className="display text-[1.35rem] leading-none tracking-[0.02em]">{number}</span>
      <span className="meta text-[0.72rem] leading-tight">{name}</span>
    </span>
  );
}

/**
 * The worn edge is a mask of fine gaps, so the stamp prints unevenly the way a
 * rubber stamp does on paper. It is a static mask, never a filter.
 */
const WORN =
  "radial-gradient(circle at 20% 30%, transparent 0 1.2px, #000 1.6px), radial-gradient(circle at 70% 60%, transparent 0 1px, #000 1.4px)";

export function Stamp({
  children,
  rotate = -8,
  className,
  style,
}: {
  children: ReactNode;
  rotate?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`display inline-block border-[3px] border-current px-3 py-1 leading-none text-[var(--c-blue)] ${className ?? ""}`}
      style={{
        rotate: `${rotate}deg`,
        WebkitMaskImage: WORN,
        maskImage: WORN,
        WebkitMaskSize: "7px 7px, 11px 11px",
        maskSize: "7px 7px, 11px 11px",
        WebkitMaskComposite: "source-in",
        maskComposite: "intersect",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function Plaque({ lines, className }: { lines: readonly string[]; className?: string }) {
  return (
    <p className={`meta border-y border-current/40 py-2 text-muted ${className ?? ""}`}>
      {lines.map((l, i) => (
        <span key={l} className={i === 0 ? "block text-primary" : "block"}>
          {l}
        </span>
      ))}
    </p>
  );
}
