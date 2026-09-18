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
 * `--count` overrides that colour, which the night shift does once, at the
 * alarm. Children are laid over the screen; the terminal lines go there.
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
      <div data-readout className="relative text-[var(--count,var(--c-acid))]">
        <span
          data-count
          className="display block leading-[0.8]"
          style={{ fontSize: "min(118vw, 84vh)", fontVariantNumeric: "tabular-nums" }}
        >
          {value}
        </span>
        {/* Beside the number on a wide frame, under it on a tall one, and
            never part of the centring: the number is what sits in the middle. */}
        <span className="absolute right-0 top-full mt-3 flex items-center gap-2 whitespace-nowrap md:bottom-[0.4em] md:left-full md:right-auto md:top-auto md:ml-5 md:mt-0">
          <span data-unit className="meta text-[clamp(1rem,1.6vw,1.6rem)]">
            {unit}
          </span>
          <span aria-hidden="true" className="screen-cursor inline-block h-[1.2em] w-[0.5em] bg-current text-[clamp(1rem,1.6vw,1.6rem)]" />
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

/**
 * The camera move into a monitor, or out of one run backwards.
 *
 * `t` is 0 with the camera at rest and 1 with the screen's picture exactly
 * filling the frame. The scale runs exponentially, which is how a dolly reads
 * (the same apparent speed all the way in), and the picture's centre travels
 * to the frame's centre in step with it.
 *
 * Returns the transform for the layer that holds the monitor (origin at its
 * top left), and where the picture itself lands, for drawing a sharp copy of
 * the screen over the top when the move goes far enough to blur the original.
 */
export function dolly(
  t: number,
  glass: { x: number; y: number },
  fit: { s: number; x: number; y: number },
  W: number,
  H: number,
) {
  const x0 = glass.x + fit.x;
  const y0 = glass.y + fit.y;
  const z1 = 1 / fit.s;
  const z = Math.pow(z1, t);
  const q = z1 > 1 ? (z - 1) / (z1 - 1) : 1;
  const cx = x0 + (W * fit.s) / 2;
  const cy = y0 + (H * fit.s) / 2;
  const tx = cx + (W / 2 - cx) * q - z * cx;
  const ty = cy + (H / 2 - cy) * q - z * cy;
  return {
    layer: `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${z.toFixed(5)})`,
    picture: `translate3d(${(tx + z * x0).toFixed(2)}px, ${(ty + z * y0).toFixed(2)}px, 0) scale(${(z * fit.s).toFixed(5)})`,
  };
}
