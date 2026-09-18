/**
 * MonitorScreen
 * What is on the screen at the middle of the rooms, and on the desk in the
 * night shift. The same component in both places, because the camera pushes
 * into one and comes out of the other: the rotary ends with this screen
 * filling the frame and the night shift begins from exactly that frame.
 *
 * It is always laid out at the size of the frame. A monitor in the scene shows
 * it scaled down (see `screenFit`), so the push into a monitor is one scale
 * from the monitor's rectangle to the frame, and the picture never reflows or
 * crops on the way.
 *
 * The count is the point of the screen, so it is set as large as the frame
 * allows, centred, in the signal colour (the one live indicator on the site).
 * Children are printed under it, which is where the terminal lines go at T-0.
 */

import type { ReactNode } from "react";

export function MonitorScreen({
  value,
  unit,
  children,
  className,
}: {
  value: string;
  unit: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[var(--screen)] ${className ?? ""}`}>
      <div className="relative">
        <span
          data-count
          className="display block leading-[0.8] text-[var(--c-acid)]"
          style={{ fontSize: "min(118vw, 84vh)", fontVariantNumeric: "tabular-nums" }}
        >
          {value}
        </span>
        {/* Beside the number on a wide frame, under it on a tall one, and
            never part of the centring: the number is what sits in the middle. */}
        <span className="absolute right-0 top-full mt-3 flex items-center gap-2 whitespace-nowrap md:bottom-[0.4em] md:left-full md:right-auto md:top-auto md:ml-5 md:mt-0">
          <span data-unit className="meta text-[clamp(1rem,1.6vw,1.6rem)] text-[var(--c-acid)]">
            {unit}
          </span>
          <span aria-hidden="true" className="screen-cursor inline-block h-[1.2em] w-[0.5em] bg-[var(--c-acid)] text-[clamp(1rem,1.6vw,1.6rem)]" />
        </span>
      </div>
      {children}
    </div>
  );
}

/**
 * How a frame-sized screen sits inside a monitor of `sw` by `sh`: the scale
 * that fits the whole frame in, and the offset that centres it. The monitor's
 * own background fills whatever the frame's shape leaves over.
 */
export function screenFit(sw: number, sh: number, W: number, H: number) {
  const s = Math.min(sw / W, sh / H);
  return { s, x: (sw - W * s) / 2, y: (sh - H * s) / 2 };
}
