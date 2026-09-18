/**
 * Layer
 * One plane of depth inside a Scene.
 *
 * Movement is entirely CSS: the scene writes `--p` and `--mx/--my` once per
 * frame on its stage, and `.layer` in globals.css turns them into a translate
 * scaled by this layer's depth. Five layers cost the same as one, and a layer
 * needs no JavaScript and no ref.
 *
 *   depth   how far the pointer moves it. 0 is pinned to the frame; the
 *           recommended ladder is 0.15 background, 0.35 midground, 0.6
 *           primary object, 0.8 text, 1.2 foreground.
 *   drift   how far scroll moves it across the scene, same scale.
 *
 * Server component: it renders a div and nothing else.
 */

import type { CSSProperties, ReactNode } from "react";

export function Layer({
  children,
  depth = 0,
  drift = 0,
  className,
  style,
  ariaHidden,
}: {
  children?: ReactNode;
  depth?: number;
  drift?: number;
  className?: string;
  style?: CSSProperties;
  ariaHidden?: boolean;
}) {
  return (
    <div
      className={`layer ${className ?? ""}`}
      style={{ ["--d" as string]: depth, ["--ds" as string]: drift, ...style }}
      aria-hidden={ariaHidden || undefined}
    >
      {children}
    </div>
  );
}
