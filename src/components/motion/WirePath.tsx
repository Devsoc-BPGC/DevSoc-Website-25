"use client";

/**
 * WirePath
 * The thread that makes a very long page feel like one journey.
 *
 * A thin conduit runs the height of the document in a narrow band down the
 * left. It draws itself as you scroll, and a small lit window rides the head
 * of the drawn line, so the light you follow is the light that ends up over
 * the door at dawn.
 *
 * Independently of scroll, a pulse runs down the wire every sixteen seconds.
 * The long gap is the point: seen once it reads as a signal going somewhere.
 *
 * The marker is an HTML element, not an SVG child. The wire's viewBox is
 * stretched with preserveAspectRatio="none" to span the document, which would
 * scale any shape inside it into a slab; positioning the marker in percentages
 * keeps it a fixed size and unskewed.
 *
 * Desktop only, presentational. Reduced motion draws the wire in full, parks
 * the marker at the end and runs no pulse.
 */

import { useRef } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useMedia";

/**
 * A conduit down a 100 x 1000 box. X stays between 5 and 15 so that once the
 * box is stretched across the viewport it reads as a vertical line with
 * gentle bends rather than a long diagonal.
 */
const D =
  "M 8 0 C 8 90, 14 130, 14 220 C 14 320, 6 350, 6 450 C 6 545, 15 575, 15 670 C 15 765, 7 795, 7 880 C 7 950, 11 975, 11 1000";

export function WirePath() {
  const wrap = useRef<HTMLDivElement>(null);
  const wire = useRef<SVGPathElement>(null);
  const pulse = useRef<SVGPathElement>(null);
  const marker = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const w = wire.current;
      const m = marker.current;
      const p = pulse.current;
      if (!w) return;

      const len = w.getTotalLength();
      w.style.strokeDasharray = String(len);

      /** Places the marker by percentage of the stretched box, so it never skews. */
      const place = (at: number) => {
        if (!m) return;
        const pt = w.getPointAtLength(Math.min(len, Math.max(0.1, at)));
        m.style.left = `${(pt.x / 100) * 100}%`;
        m.style.top = `${(pt.y / 1000) * 100}%`;
      };

      if (reduced) {
        w.style.strokeDashoffset = "0";
        place(len);
        if (p) p.style.display = "none";
        return;
      }

      w.style.strokeDashoffset = String(len);
      place(0);

      if (p) {
        const seg = Math.max(24, len * 0.03);
        p.style.strokeDasharray = `${seg} ${len}`;
        p.animate([{ strokeDashoffset: seg }, { strokeDashoffset: -len }], {
          duration: 16000,
          iterations: Infinity,
          easing: "cubic-bezier(0.4, 0, 0.6, 1)",
        });
      }

      const st = ScrollTrigger.create({
        start: 0,
        end: () => ScrollTrigger.maxScroll(window),
        scrub: 1.2,
        onUpdate(self) {
          const drawn = len * self.progress;
          w.style.strokeDashoffset = String(len - drawn);
          place(drawn);
        },
      });
      return () => st.kill();
    },
    { scope: wrap, dependencies: [reduced] },
  );

  return (
    <div ref={wrap} className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
      <svg viewBox="0 0 100 1000" preserveAspectRatio="none" className="h-full w-full">
        <path
          ref={wire}
          d={D}
          fill="none"
          stroke="var(--rule-color)"
          strokeOpacity="0.3"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
        />
        <path
          ref={pulse}
          d={D}
          fill="none"
          stroke="var(--accent-warm)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
        />
      </svg>

      {/* The lit window. Fixed pixel size, positioned in percentages. */}
      <div
        ref={marker}
        className="absolute h-4 w-[11px] -translate-x-1/2 -translate-y-1/2 rounded-[1px]"
        style={{
          left: "8%",
          top: 0,
          background: "var(--accent-warm)",
          boxShadow: "0 0 14px 2px color-mix(in oklch, var(--accent-warm) 55%, transparent)",
        }}
      />
    </div>
  );
}
