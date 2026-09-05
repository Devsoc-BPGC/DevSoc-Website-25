"use client";

/**
 * ScrollResolve
 * A photograph that arrives graded into the room's verdigris and resolves to
 * full colour as it climbs to the middle of the viewport. Scroll does all of
 * it: nothing to hover, nothing to click. Once resolved it stays resolved.
 *
 * <ScrollResolve className="aspect-[3/4]"><Image ... /></ScrollResolve>
 * <ScrollResolve to={0.72}>...</ScrollResolve>   // stops short of full colour
 *
 * Reduced motion or no JavaScript: full colour from the start.
 */

import { useRef, type ReactNode } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useMedia";

export function ScrollResolve({
  children,
  className,
  /** Where the grade starts lifting and where it finishes, as ScrollTrigger positions. */
  start = "top 88%",
  end = "center 58%",
  to = 1,
}: {
  children: ReactNode;
  className?: string;
  start?: string;
  end?: string;
  /** Ceiling for the grade lift. Below 1 the photograph keeps some of the room. */
  to?: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = box.current;
      if (!el) return;
      if (reduced) {
        el.style.setProperty("--resolve", String(to));
        return;
      }
      el.style.setProperty("--resolve", "0");
      let peak = 0;
      const st = ScrollTrigger.create({
        trigger: el,
        start,
        end,
        scrub: true,
        onUpdate(self) {
          // hold the highest point reached, so a photo never falls back to grade
          if (self.progress <= peak) return;
          peak = self.progress;
          el.style.setProperty("--resolve", String(peak * to));
        },
      });
      return () => st.kill();
    },
    { scope: box, dependencies: [reduced, to] },
  );

  return (
    <div ref={box} className={`resolve ${className ?? ""}`} style={{ ["--resolve" as string]: to }}>
      {children}
    </div>
  );
}
