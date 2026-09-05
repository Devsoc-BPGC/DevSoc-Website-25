"use client";

/**
 * ParticleText
 * Renders a word as a field of small dots on a canvas. The dots gather from
 * a scattered cloud into the letterforms, drift very slowly at rest, and
 * part around the pointer. Pointillism, applied to the wordmark.
 *
 * <ParticleText text="DEVSOC" className="display h-[28vw] w-full" />
 *
 * The canvas inherits font-family from className; width is fit to the box.
 * Reduced motion or no canvas: the dots sit still at their targets.
 */

import { useEffect, useRef } from "react";
import { useFinePointer, useReducedMotion } from "@/lib/useMedia";

type Props = {
  text: string;
  className?: string;
  /** Sample step in CSS px. Smaller is denser and heavier. */
  density?: number;
  size?: number;
  color?: string;
  accent?: string;
  /** Share of dots that take the accent colour. */
  accentShare?: number;
  scatter?: number;
  repelRadius?: number;
};

type Dot = {
  tx: number;
  ty: number;
  x: number;
  y: number;
  sx: number;
  sy: number;
  seed: number;
  delay: number;
  accent: boolean;
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function ParticleText({
  text,
  className,
  density = 5,
  size = 2,
  color = "oklch(0.93 0.02 85)",
  accent = "oklch(0.72 0.11 185)",
  accentShare = 0.08,
  scatter = 160,
  repelRadius = 110,
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const fine = useFinePointer();

  useEffect(() => {
    const box = wrap.current;
    const cv = canvas.current;
    if (!box || !cv) return;
    const ctx = cv.getContext("2d", { alpha: true });
    if (!ctx) return;

    let dots: Dot[] = [];
    let raf = 0;
    let start = 0;
    let running = false;
    let width = 0;
    let height = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const pointer = { x: -9999, y: -9999 };

    const sample = () => {
      width = box.clientWidth;
      height = box.clientHeight;
      if (!width || !height) return;
      cv.width = Math.round(width * dpr);
      cv.height = Math.round(height * dpr);
      cv.style.width = `${width}px`;
      cv.style.height = `${height}px`;

      const family = getComputedStyle(box).fontFamily;
      const off = document.createElement("canvas");
      off.width = width;
      off.height = height;
      const o = off.getContext("2d");
      if (!o) return;
      // Fit the word to the box width, then cap by height.
      const probe = 100;
      o.font = `900 ${probe}px ${family}`;
      if ("fontStretch" in o) (o as CanvasRenderingContext2D & { fontStretch: string }).fontStretch = "expanded";
      const w = o.measureText(text).width || 1;
      const fs = Math.min((probe * width * 0.98) / w, height * 1.05);
      o.font = `900 ${fs}px ${family}`;
      if ("fontStretch" in o) (o as CanvasRenderingContext2D & { fontStretch: string }).fontStretch = "expanded";
      o.textBaseline = "middle";
      o.textAlign = "center";
      o.fillStyle = "#fff";
      o.fillText(text, width / 2, height * 0.54);
      const data = o.getImageData(0, 0, width, height).data;

      const next: Dot[] = [];
      let step = density;
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          if (data[(y * width + x) * 4 + 3] > 120) {
            const seed = Math.random();
            const a = Math.random() * Math.PI * 2;
            const r = scatter * (0.4 + Math.random());
            next.push({
              tx: x,
              ty: y,
              x: x + Math.cos(a) * r,
              y: y + Math.sin(a) * r,
              sx: x + Math.cos(a) * r,
              sy: y + Math.sin(a) * r,
              seed,
              delay: Math.random() * 0.5,
              accent: Math.random() < accentShare,
            });
          }
        }
      }
      // Keep it under ~9000 dots on very wide boxes.
      while (next.length > 9000) {
        step += 1;
        next.length = 0;
        for (let y = 0; y < height; y += step)
          for (let x = 0; x < width; x += step)
            if (data[(y * width + x) * 4 + 3] > 120)
              next.push({ tx: x, ty: y, x, y, sx: x, sy: y, seed: Math.random(), delay: Math.random() * 0.5, accent: Math.random() < accentShare });
      }
      dots = next;
      start = performance.now();
    };

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      for (const d of dots) {
        const p = reduced ? 1 : easeOutCubic(Math.min(1, Math.max(0, (t - d.delay) / 2.2)));
        let gx = d.sx + (d.tx - d.sx) * p;
        let gy = d.sy + (d.ty - d.sy) * p;
        if (!reduced) {
          gx += Math.sin(t * 0.6 + d.seed * 6.283) * 0.9;
          gy += Math.cos(t * 0.5 + d.seed * 12.0) * 0.9;
          const dx = gx - pointer.x;
          const dy = gy - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < repelRadius) {
            const f = (1 - dist / repelRadius) ** 2 * repelRadius * 0.55;
            gx += (dx / (dist || 1)) * f;
            gy += (dy / (dist || 1)) * f;
          }
        }
        d.x += (gx - d.x) * 0.16;
        d.y += (gy - d.y) * 0.16;
        ctx.fillStyle = d.accent ? accent : color;
        ctx.globalAlpha = 0.35 + 0.55 * p;
        ctx.fillRect(d.x, d.y, size, size);
      }
      ctx.globalAlpha = 1;
      if (running && !reduced) raf = requestAnimationFrame(draw);
    };

    const startLoop = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(draw);
    };
    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        startLoop();
      } else stopLoop();
    });
    const ro = new ResizeObserver(() => {
      sample();
      if (reduced) draw(performance.now());
    });

    document.fonts?.ready.then(() => {
      sample();
      io.observe(cv);
      ro.observe(box);
      if (reduced) draw(performance.now());
    });

    if (fine && !reduced) {
      cv.addEventListener("pointermove", onMove, { passive: true });
      cv.addEventListener("pointerleave", onLeave);
    }

    return () => {
      stopLoop();
      io.disconnect();
      ro.disconnect();
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerleave", onLeave);
    };
  }, [text, density, size, color, accent, accentShare, scatter, repelRadius, reduced, fine]);

  return (
    <div ref={wrap} className={className} role="img" aria-label={text}>
      <canvas ref={canvas} className="block h-full w-full" />
    </div>
  );
}
