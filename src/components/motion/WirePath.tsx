"use client";

/**
 * WirePath
 * The thread that makes seven thousand pixels feel like one journey.
 *
 * A thin conduit runs the height of the page. It draws itself as you scroll,
 * and a single lit window rides the head of the drawn line, so the light you
 * are following is the same light that ends up over the door at dawn.
 *
 * Independently of the scroll, a pulse runs a short distance down the wire
 * every sixteen seconds. That long gap is the point: seen once it reads as a
 * signal going somewhere, seen constantly it would be decoration.
 *
 * Desktop only, purely presentational. Reduced motion draws the wire in full,
 * parks the window at the end and runs no pulse.
 */

import { useRef } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useMedia";

/** A gentle conduit down a 100 x 1000 box, stretched to the document. */
const D =
  "M 20 0 C 20 90, 74 130, 74 220 C 74 320, 22 350, 22 450 C 22 545, 78 575, 78 670 C 78 765, 26 795, 26 880 C 26 950, 52 975, 52 1000";

export function WirePath() {
  const wrap = useRef<HTMLDivElement>(null);
  const wire = useRef<SVGPathElement>(null);
  const pulse = useRef<SVGPathElement>(null);
  const marker = useRef<SVGGElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const w = wire.current;
      const m = marker.current;
      const p = pulse.current;
      if (!w) return;

      const len = w.getTotalLength();
      w.style.strokeDasharray = String(len);

      const place = (at: number) => {
        if (!m) return;
        const pt = w.getPointAtLength(Math.min(len, Math.max(0.1, at)));
        m.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
      };

      if (reduced) {
        w.style.strokeDashoffset = "0";
        place(len);
        if (p) p.style.display = "none";
        return;
      }

      w.style.strokeDashoffset = String(len);
      place(0);

      // The pulse: a short lit segment sliding down the same wire on a loop.
      if (p) {
        const seg = Math.max(24, len * 0.035);
        p.style.strokeDasharray = `${seg} ${len}`;
        p.style.strokeDashoffset = String(seg);
        p.animate(
          [{ strokeDashoffset: seg }, { strokeDashoffset: -len }],
          { duration: 16000, iterations: Infinity, easing: "cubic-bezier(0.4, 0, 0.6, 1)" },
        );
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
          strokeOpacity="0.35"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
        />
        <path
          ref={pulse}
          d={D}
          fill="none"
          stroke="var(--accent-warm)"
          strokeWidth="1.6"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
        />
      </svg>

      {/* The lit window rides the head of the drawn wire. Kept in its own
          non-stretched svg so it never skews with preserveAspectRatio none. */}
      <svg viewBox="0 0 100 1000" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <g ref={marker}>
          <rect
            x="-2.2"
            y="-3.4"
            width="4.4"
            height="6.8"
            rx="0.6"
            fill="var(--accent-warm)"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </svg>
    </div>
  );
}
