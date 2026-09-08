"use client";

/**
 * ScrollResolve
 * A photograph that arrives graded and resolves to full colour as it climbs to
 * the middle of the viewport. Scroll does all of it: nothing to hover, nothing
 * to click, and it grades back down on the way up.
 *
 * <ScrollResolve className="aspect-[3/4]"><Image ... /></ScrollResolve>
 * <ScrollResolve to={0.72}>...</ScrollResolve>   // stops short of full colour
 *
 * Reduced motion or no JavaScript: full colour from the start.
 */

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { EASE, SCRUB } from "@/lib/easings";
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
      // GSAP tweens custom properties natively, and letting it own the scrub
      // buys smoothing for free. Writing --resolve from a raw onUpdate steps
      // visibly on a fast scrub, because every write re-triggers the filter
      // and blend composite that .resolve sets up in globals.css.
      const tween = gsap.fromTo(
        el,
        { "--resolve": 0 },
        {
          "--resolve": to,
          ease: EASE.none,
          scrollTrigger: { trigger: el, start, end, scrub: SCRUB.normal, invalidateOnRefresh: true },
        },
      );
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: box, dependencies: [reduced, to] },
  );

  return (
    <div ref={box} className={`resolve ${className ?? ""}`} style={{ ["--resolve" as string]: to }}>
      {children}
    </div>
  );
}
