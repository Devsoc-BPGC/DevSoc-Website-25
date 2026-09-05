"use client";

/**
 * SplitLines
 * Splits its text into lines and lets each line rise through a mask when
 * the element scrolls into view. The text is always in the DOM and visible
 * before JavaScript runs; the reveal is layered on top.
 *
 * <SplitLines as="p" className="voice text-4xl">Goa has always been a port.</SplitLines>
 *
 * Props: as (tag), delay (s), start (ScrollTrigger start), once.
 */

import { createElement, useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useMedia";
import { DUR, STAGGER } from "@/lib/easings";

type Props = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  delay?: number;
  start?: string;
  duration?: number;
  stagger?: number;
  /** Play immediately instead of waiting for the scroll trigger. */
  immediate?: boolean;
  id?: string;
};

export function SplitLines({
  as = "p",
  children,
  className,
  delay = 0,
  start = "top 85%",
  duration = DUR.reveal,
  stagger = STAGGER.lines,
  immediate = false,
  id,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reduced) return;
      const split = SplitText.create(el, {
        type: "lines",
        mask: "lines",
        linesClass: "split-line",
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 110,
            duration,
            delay,
            stagger,
            ease: "expo.out",
            scrollTrigger: immediate
              ? undefined
              : { trigger: el, start, once: true },
          });
        },
      });
      return () => split.revert();
    },
    { scope: ref, dependencies: [reduced] },
  );

  return createElement(as, { ref, className, id }, children);
}
