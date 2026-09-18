/**
 * Paper
 * A sheet. Everything readable in the world is printed on one of these.
 *
 * A torn sheet is clipped, and a clip-path cuts off an element's own box
 * shadow, so a torn sheet carries its shadow on an outer wrapper as a
 * `drop-shadow` filter instead, which follows the torn outline rather than the
 * rectangle. An untorn sheet uses the cheaper box shadow.
 */

import type { CSSProperties, ReactNode } from "react";
import { tornEdge, type TearSides } from "./tornEdge";

export type PaperTone = "bone" | "warm" | "grid";

const DROP =
  "drop-shadow(0 1px 1px rgb(13 14 12 / 0.55)) drop-shadow(0 6px 10px rgb(13 14 12 / 0.4)) drop-shadow(0 20px 26px rgb(13 14 12 / 0.45))";

export function Paper({
  children,
  as: Tag = "div",
  tone = "bone",
  tear = "none",
  seed = 1,
  rotate = 0,
  className,
  innerClassName,
  style,
}: {
  children?: ReactNode;
  as?: "div" | "article" | "li" | "figure" | "section";
  tone?: PaperTone;
  tear?: TearSides;
  seed?: number;
  /** Degrees. Keep between -3 and 3; paper on a wall is never quite square. */
  rotate?: number;
  className?: string;
  innerClassName?: string;
  style?: CSSProperties;
}) {
  const toneClass = tone === "warm" ? "paper--warm" : tone === "grid" ? "paper--grid" : "";
  const clip = tornEdge(seed, tear);

  if (!clip) {
    return (
      <Tag
        className={`paper ${toneClass} ${className ?? ""} ${innerClassName ?? ""}`}
        style={{ rotate: rotate ? `${rotate}deg` : undefined, ...style }}
      >
        {children}
      </Tag>
    );
  }

  return (
    <div className={className} style={{ filter: DROP, rotate: rotate ? `${rotate}deg` : undefined, ...style }}>
      <Tag className={`paper ${toneClass} h-full ${innerClassName ?? ""}`} style={{ clipPath: clip, boxShadow: "none" }}>
        {children}
      </Tag>
    </div>
  );
}
