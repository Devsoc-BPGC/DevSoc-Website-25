"use client";

/**
 * VelocityMark
 * The mark in the corner never stops turning, and how fast it turns is how fast
 * you are scrolling.
 *
 * Most feedback on a scrolling page is local: a progress bar, a section
 * indicator, something that belongs to one part of the page. This is global and
 * constant, which is why it reads as a piece of the brand rather than as a
 * widget. Left alone it settles to a slow drift. Flick the page and it spins up
 * in the direction you flicked, then eases back down over about a second.
 *
 * Three details do the work.
 *
 * The boost is signed, so scrolling up turns it backwards. An unsigned version
 * feels like a decoration; a signed one feels like it is listening.
 *
 * The ease back is `1 - exp(-dt / tau)` rather than a fixed lerp factor, so the
 * settle takes the same wall clock time on a 120Hz display as on a 60Hz one.
 *
 * Velocity comes from the scroll position, not from Lenis. It is the same
 * number, it costs one property read per frame, and it means the mark does not
 * care whether a smooth scroll provider is mounted above it.
 *
 * It writes `style.rotate` rather than `transform`, so it composes with any
 * transform a parent or a class puts on the same element instead of fighting it.
 *
 * Reduced motion leaves the mark perfectly still.
 */

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DUR } from "@/lib/easings";

/** Degrees per second with the page still. Slow enough to notice only if you look. */
const REST = 5;
/** Degrees per second per pixel-per-frame of scroll velocity. */
const GAIN = 2.4;
/** Ceiling, so a hard fling spins fast without strobing. */
const MAX = 260;

export function VelocityMark({ className, size = 28 }: { className?: string; size?: number }) {
  const el = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const node = el.current;
      if (!node) return;

      /**
       * The reduced motion check lives in the loop, not in a React dependency.
       * The hooks in lib/useMedia report false on the first render and settle in
       * an effect, so a state driven guard lets the loop start before it is told
       * to stop, and this loop is the one thing on the page that never ends on
       * its own. Reading the query object is a property access, and it is live,
       * so it also handles someone changing the setting while the page is open.
       */
      const still = window.matchMedia("(prefers-reduced-motion: reduce)");
      const tau = DUR.settle / 4;
      let angle = 0;
      let boost = 0;
      let lastY = window.scrollY;

      // Velocity is measured from the scroll position itself rather than taken
      // from Lenis. It costs one property read per frame, it is the same number
      // either way, and it keeps this component independent of whether a smooth
      // scroll provider happens to be mounted above it.
      const tick = (_t: number, dt: number) => {
        if (still.matches) {
          if (node.style.rotate) node.style.rotate = "";
          return;
        }
        const s = dt / 1000;
        const y = window.scrollY;
        const velocity = y - lastY;
        lastY = y;

        const target = gsap.utils.clamp(-MAX, MAX, velocity * GAIN);
        boost += (target - boost) * (1 - Math.exp(-s / tau));
        angle = (angle + (REST + boost) * s) % 360;
        node.style.rotate = `${angle}deg`;
      };

      gsap.ticker.add(tick);
      return () => {
        gsap.ticker.remove(tick);
        node.style.rotate = "";
      };
    },
    { dependencies: [] },
  );

  return (
    <span
      ref={el}
      className={`inline-block will-change-transform ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/images/brand/mark.png"
        alt=""
        width={size}
        height={size}
        priority
        className="h-full w-full"
      />
    </span>
  );
}
