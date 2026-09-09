"use client";

/**
 * Reveal
 * Rises its children into place as they arrive, and sinks them back out as they
 * leave. Scrolling back up rewinds it rather than replaying it.
 *
 * <Reveal stagger={0.06}>{rows}</Reveal>   // staggers direct children
 * <Reveal>{block}</Reveal>                 // moves the block itself
 *
 * On a staggered list the order flips on the way out, so the list unbuilds from
 * the far end. That reads as reversal more strongly than the transform does.
 *
 * Everything is in the DOM and visible without JavaScript, and parked at rest
 * under reduced motion.
 */

import { createElement, useRef, type ElementType, type ReactNode } from "react";
import { DUR, EASE, STAGGER } from "@/lib/easings";
import { useThroughTimeline } from "@/lib/useThroughTimeline";

export function Reveal({
  children,
  className,
  as = "div",
  stagger = 0,
  y = 26,
  delay = 0,
  duration = DUR.reveal,
  immediate = false,
  enter,
  exit,
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** When set, the direct children rise one after another. */
  stagger?: number;
  y?: number;
  delay?: number;
  duration?: number;
  /** Play on mount instead of waiting for scroll. */
  immediate?: boolean;
  /** Overrides for where this arrives and leaves. ScrollTrigger `start` syntax. */
  enter?: string;
  exit?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useThroughTimeline(ref, {
    immediate,
    delay,
    enter,
    exit,
    deps: [stagger, y, duration],
    build(tl) {
      const el = ref.current;
      if (!el) return;
      const targets = stagger ? Array.from(el.children) : [el];
      if (!targets.length) return;

      tl.fromTo(
        targets,
        { y, opacity: 0 },
        { y: 0, opacity: 1, duration, ease: EASE.out, stagger: { each: stagger || 0, from: "start" } },
      )
        .addLabel("rest")
        // Shorter and quicker on the way out. An exit that travels as far as
        // the entrance reads as a second entrance going the wrong way.
        .to(targets, {
          y: -y * 0.6,
          opacity: 0,
          duration: DUR.exit,
          ease: EASE.in,
          stagger: { each: (stagger || 0) * 0.7, from: "end" },
        });
    },
  });

  return createElement(as, { ref, className }, children);
}

/** Kept so call sites can reach the shared row cadence without a second import. */
export const REVEAL_STAGGER = STAGGER;
