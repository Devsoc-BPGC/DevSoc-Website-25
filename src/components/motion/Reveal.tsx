"use client";

/**
 * Reveal
 * Rises its children into place the first time they reach the viewport, then
 * leaves them alone. An IntersectionObserver decides, so late-loading images
 * cannot leave content stranded. Everything is in the DOM and visible without
 * JavaScript, and static under reduced motion.
 *
 * <Reveal stagger={0.06}>{rows}</Reveal>   // staggers direct children
 * <Reveal>{block}</Reveal>                 // moves the block itself
 */

import { createElement, useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useMedia";

export function Reveal({
  children,
  className,
  as = "div",
  stagger = 0,
  y = 26,
  delay = 0,
  duration = 1.1,
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** When set, the direct children rise one after another. */
  stagger?: number;
  y?: number;
  delay?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const targets = stagger ? Array.from(el.children) : [el];
    if (!targets.length) return;

    gsap.set(targets, { y, opacity: 0 });
    let played = false;
    const play = () => {
      if (played) return;
      played = true;
      gsap.to(targets, { y: 0, opacity: 1, duration, delay, stagger, ease: "expo.out", overwrite: true });
    };

    // Already on screen (deep link, jump, short page): show immediately.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
      play();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          play();
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (!played) gsap.set(targets, { clearProps: "all" });
    };
  }, [reduced, stagger, y, delay, duration]);

  return createElement(as, { ref, className }, children);
}
