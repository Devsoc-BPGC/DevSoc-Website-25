"use client";

/**
 * FlowField
 * A Perlin noise flow field on a 2D canvas. A few hundred particles are
 * carried by a slowly turning noise field and leave thin fading trails, so
 * the surface reads as air moving over the page rather than as a graphic.
 *
 * It lives in the footer and nowhere else. That is the one place on the site
 * where nothing else is moving, and the last thing under the wordmark should
 * be the night still drifting after the reader has stopped scrolling.
 *
 * Colours are read from the theme tokens and re-read when the theme changes,
 * so it is bone over obsidian at night and ink over haze in the morning, with
 * a few strands in the warm accent. Trails are erased with destination-out,
 * never painted over, so the canvas stays transparent and the footer ground
 * shows through.
 *
 * The loop runs only while the footer is on screen and the tab is visible.
 * Reduced motion draws one settled field and stops.
 */

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useMedia";

/** Classic 2D Perlin gradient noise, roughly -1 to 1. */
function makeNoise(seed: number) {
  const perm = Array.from({ length: 256 }, (_, i) => i);
  let s = seed >>> 0;
  const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  const p = new Uint8Array(512);
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255];

  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a: number, b: number, t: number) => a + t * (b - a);
  const grad = (h: number, x: number, y: number) => {
    switch (h & 3) {
      case 0:
        return x + y;
      case 1:
        return -x + y;
      case 2:
        return x - y;
      default:
        return -x - y;
    }
  };

  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const X = xi & 255;
    const Y = yi & 255;
    const fx = x - xi;
    const fy = y - yi;
    const u = fade(fx);
    const v = fade(fy);
    const A = p[X] + Y;
    const B = p[X + 1] + Y;
    return lerp(
      lerp(grad(p[A], fx, fy), grad(p[B], fx - 1, fy), u),
      lerp(grad(p[A + 1], fx, fy - 1), grad(p[B + 1], fx - 1, fy - 1), u),
      v,
    );
  };
}

/**
 * How far the field turns, how fast it drifts, how long a strand lives.
 * A trail is roughly SPEED / FADE pixels long before it is erased, so these
 * two are the pair that decide whether this reads as filaments or as specks.
 */
const SCALE = 0.0016;
const DRIFT = 0.00006;
const SPEED = 0.7;
const FADE = 0.022;
const LIFE = 260;
const WARM_SHARE = 0.16;

export function FlowField({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = canvas.current;
    const host = el?.parentElement;
    if (!el || !host) return;
    const ctx = el.getContext("2d", { alpha: true });
    if (!ctx) return;

    const noise = makeNoise(20260907);
    let dpr = 1;
    let w = 0;
    let h = 0;
    let count = 0;
    let px = new Float32Array(0);
    let py = new Float32Array(0);
    let age = new Float32Array(0);
    let warm = new Uint8Array(0);

    /** Reads the two ink colours straight off the theme. */
    let inks = ["#fff", "#fff"];
    const readInks = () => {
      const before = el.style.color;
      el.style.color = "var(--text-primary)";
      const primary = getComputedStyle(el).color;
      el.style.color = "var(--accent-warm)";
      const accent = getComputedStyle(el).color;
      el.style.color = before;
      inks = [primary, accent];
    };

    const seed = (i: number) => {
      px[i] = Math.random() * w;
      py[i] = Math.random() * h;
      age[i] = Math.random() * LIFE;
      warm[i] = Math.random() < WARM_SHARE ? 1 : 0;
    };

    const size = () => {
      const r = host.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = Math.round(r.width);
      h = Math.round(r.height);
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineWidth = 1;
      ctx.lineCap = "round";

      // Enough strands to read as a field, scaled to the area, capped so a
      // wide desktop footer does not cost more than a phone one.
      count = Math.round(Math.min(900, Math.max(220, (w * h) / 1600)));
      px = new Float32Array(count);
      py = new Float32Array(count);
      age = new Float32Array(count);
      warm = new Uint8Array(count);
      for (let i = 0; i < count; i++) seed(i);
      ctx.clearRect(0, 0, w, h);
      return true;
    };

    /** One step of the whole field, drawn in two batches to keep state changes low. */
    const step = (t: number, fade: boolean) => {
      if (fade) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.globalAlpha = 1;
        ctx.fillStyle = `rgba(0,0,0,${FADE})`;
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = "source-over";
      }

      for (let pass = 0; pass < 2; pass++) {
        ctx.beginPath();
        ctx.strokeStyle = inks[pass];
        ctx.globalAlpha = pass === 0 ? 0.16 : 0.3;
        for (let i = 0; i < count; i++) {
          if (warm[i] !== pass) continue;
          const x = px[i];
          const y = py[i];
          const a = noise(x * SCALE, y * SCALE + t * DRIFT) * Math.PI * 2.2;
          const nx = x + Math.cos(a) * SPEED;
          const ny = y + Math.sin(a) * SPEED;
          px[i] = nx;
          py[i] = ny;
          age[i] += 1;
          if (age[i] > LIFE || nx < -20 || nx > w + 20 || ny < -20 || ny > h + 20) {
            seed(i);
            age[i] = 0;
            continue;
          }
          ctx.moveTo(x, y);
          ctx.lineTo(nx, ny);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    if (!size()) return;
    readInks();

    if (reduced) {
      // One settled field, then nothing. A still is the right amount of this
      // for someone who asked the page to hold still.
      for (let n = 0; n < 90; n++) step(n, false);
      return;
    }

    let raf = 0;
    let frame = 0;
    let onScreen = true;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!onScreen || document.hidden) return;
      step(frame++, true);
    };

    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
    });
    io.observe(host);

    const ro = new ResizeObserver(() => {
      if (size()) readInks();
    });
    ro.observe(host);

    const themes = new MutationObserver(readInks);
    themes.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      themes.disconnect();
    };
  }, [reduced]);

  return <canvas ref={canvas} className={className} aria-hidden="true" />;
}
