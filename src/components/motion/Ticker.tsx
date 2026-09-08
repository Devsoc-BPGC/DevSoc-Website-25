"use client";

/**
 * Ticker
 * A strip of type that slides sideways as you scroll past it, and slides back
 * when you scroll up.
 *
 * Its position is driven by scroll position, not by a CSS animation, so it is
 * the one element on the page that visibly knows which direction you are
 * going. That pairs it with the mark in the nav: the mark tells you how fast,
 * this tells you which way.
 *
 * A marquee that runs on its own clock would say nothing. This one is only
 * moving because you are.
 */

import { useRef, type ReactNode } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { SCRUB } from "@/lib/easings";
import { useReducedMotion } from "@/lib/useMedia";

export function Ticker({
  items,
  className,
  /** Viewport widths travelled across the whole pass. */
  travel = 0.55,
  reverse = false,
}: {
  items: ReactNode[];
  className?: string;
  travel?: number;
  reverse?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = root.current;
      const r = rail.current;
      if (!el || !r || reduced) return;
      const dir = reverse ? 1 : -1;
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: SCRUB.loose,
        onUpdate: (self) => {
          r.style.transform = `translate3d(${(dir * (self.progress - 0.5) * travel * 100).toFixed(2)}vw, 0, 0)`;
        },
        onToggle: (self) => {
          r.style.willChange = self.isActive ? "transform" : "";
        },
      });
      return () => {
        st.kill();
        r.style.transform = "";
        r.style.willChange = "";
      };
    },
    { scope: root, dependencies: [reduced] },
  );

  // Doubled so the strip stays full at either end of its travel.
  const run = [...items, ...items];

  return (
    <div
      ref={root}
      className={`relative overflow-hidden border-y border-rule/20 py-5 ${className ?? ""}`}
      aria-hidden="true"
    >
      <div ref={rail} className="flex w-max items-center gap-10 whitespace-nowrap will-change-transform">
        {run.map((item, i) => (
          <span key={i} className="meta flex items-center gap-10 text-muted">
            {item}
            <span className="text-warm">✳</span>
          </span>
        ))}
      </div>
    </div>
  );
}
