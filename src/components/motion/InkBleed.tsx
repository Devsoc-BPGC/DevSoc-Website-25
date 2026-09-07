"use client";

/**
 * InkBleed
 * A tonal takeover. Whatever you put inside is revealed through a mask that
 * floods diagonally across the box with a grainy, dissolving edge, like ink
 * soaking into paper rather than a wipe crossing a screen.
 *
 * Give it the inverted copy of a section (light ground, dark type) and drive
 * `set(progress)` from a ScrollTrigger. The section reads as the night turning
 * over into daylight in place, without either state ever cutting to the other.
 *
 *   const ink = useRef<InkBleedHandle>(null);
 *   <InkBleed ref={ink}>{invertedCopy}</InkBleed>
 *   // in onUpdate: ink.current?.set(self.progress)
 *
 * The mask is a small canvas turned into a data URL and stretched over the
 * box. It is repainted only when the quantised progress step changes, so a
 * whole section costs about sixty repaints of a 220 by 130 bitmap rather than
 * one per frame.
 *
 * Presentational: always aria-hidden, never interactive. The uninverted copy
 * underneath is the one that carries the real content.
 */

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, type ReactNode } from "react";

export type InkBleedHandle = { set(progress: number): void };

/**
 * Mask resolution. Stretched to the box, so this is what sets the size of a
 * grain speck. Coarser than this and the dissolve reads as blocky dither.
 */
const W = 460;
const H = 270;
/** Quantisation of the scrub, so the mask is repainted rarely. */
const STEPS = 64;
/** How much the grain breaks up the edge, and how tight the edge is. */
const GRAIN = 0.4;
const EDGE = 0.17;

export const InkBleed = forwardRef<InkBleedHandle, { children: ReactNode; className?: string }>(
  function InkBleed({ children, className }, ref) {
    const box = useRef<HTMLDivElement>(null);
    const step = useRef(-1);

    /**
     * The flood field, fixed for the life of the component: for each pixel,
     * how late it should be reached. Distance runs from the bottom left, and
     * the noise term is what makes the edge dissolve instead of sweep.
     */
    const field = useMemo(() => {
      const f = new Float32Array(W * H);
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const dist = (x / W) * 0.55 + (1 - y / H) * 0.45;
          f[y * W + x] = dist + Math.random() * GRAIN;
        }
      }
      return f;
    }, []);

    const canvas = useMemo(() => {
      if (typeof document === "undefined") return null;
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      return c;
    }, []);

    const paint = useMemo(() => {
      if (!canvas) return null;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      const image = ctx.createImageData(W, H);
      const data = image.data;
      for (let i = 0; i < W * H; i++) {
        data[i * 4] = 255;
        data[i * 4 + 1] = 255;
        data[i * 4 + 2] = 255;
      }
      return (p: number) => {
        // 1.7 rather than 1.0 so the last pixel is fully covered at p = 1.
        const front = p * 1.7;
        for (let i = 0; i < W * H; i++) {
          const a = (front - field[i]) / EDGE;
          data[i * 4 + 3] = a <= 0 ? 0 : a >= 1 ? 255 : (a * 255) | 0;
        }
        ctx.putImageData(image, 0, 0);
        return canvas.toDataURL();
      };
    }, [canvas, field]);

    const apply = useMemo(
      () => (p: number) => {
        const el = box.current;
        if (!el || !paint) return;
        const s = Math.round(Math.min(1, Math.max(0, p)) * STEPS);
        if (s === step.current) return;
        step.current = s;
        if (s === 0) {
          el.style.opacity = "0";
          return;
        }
        el.style.opacity = "1";
        const url = `url(${paint(s / STEPS)})`;
        el.style.maskImage = url;
        el.style.webkitMaskImage = url;
      },
      [paint],
    );

    useImperativeHandle(ref, () => ({ set: apply }), [apply]);

    // Start closed, so nothing flashes before the first scroll update.
    useEffect(() => {
      if (box.current) box.current.style.opacity = "0";
    }, []);

    return (
      <div
        ref={box}
        className={`pointer-events-none absolute inset-0 ${className ?? ""}`}
        style={{
          opacity: 0,
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
        }}
        aria-hidden="true"
      >
        {children}
      </div>
    );
  },
);
