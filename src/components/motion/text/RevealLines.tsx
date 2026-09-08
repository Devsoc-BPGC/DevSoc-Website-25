"use client";

/**
 * RevealLines
 * Body copy. Lines rise from behind a mask, like a blind lifting, and sink
 * back the way they came on the way out.
 *
 * This is the metaphor for prose, and prose only. Headlines use RevealChars
 * and the serif voice uses RevealWords, so the three type roles never share a
 * movement.
 *
 * <RevealLines as="p" className="body-copy">Long copy here.</RevealLines>
 *
 * The text is in the DOM and readable before JavaScript runs, and is left
 * alone entirely under reduced motion.
 */

import { createElement, useRef, type ElementType, type ReactNode } from "react";
import { STAGGER } from "@/lib/easings";
import { useSplitReveal } from "./useSplitReveal";

export type RevealProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  id?: string;
  delay?: number;
  stagger?: number;
  /** ScrollTrigger start for the arrival. */
  enter?: string;
  /** ScrollTrigger start for the departure out of the top. */
  exit?: string;
  /** Play on mount rather than waiting for scroll. */
  immediate?: boolean;
};

export function RevealLines({
  as = "p",
  children,
  className,
  id,
  stagger = STAGGER.lines,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useSplitReveal(ref, {
    type: "lines",
    mask: true,
    pick: (s) => s.lines,
    from: { yPercent: 110 },
    // Prose sinks back rather than flying on through: it is being read, not
    // performed, and a body paragraph leaving upward reads as a glitch.
    exitVars: () => ({ yPercent: 110 }),
    stagger,
    ...rest,
  });

  return createElement(as, { ref, className, id }, children);
}
