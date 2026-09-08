"use client";

/**
 * RevealWords
 * The serif voice. Words flip in on the Y axis, one after another, like cards
 * turning face up, and flip out the opposite way.
 *
 * <RevealWords as="p" className="voice">The campus sleeps.</RevealWords>
 *
 * Deliberately not masked: a line mask would clip the flip at the moment the
 * word is edge on, which is exactly the frame that sells it. That is also why
 * this is a sibling component rather than a variant prop on one reveal, since
 * the three metaphors need different DOM and different CSS, not just different
 * tween values.
 */

import { createElement, useRef } from "react";
import { STAGGER } from "@/lib/easings";
import { useSplitReveal } from "./useSplitReveal";
import type { RevealProps } from "./RevealLines";

export function RevealWords({
  as = "p",
  children,
  className,
  id,
  stagger = STAGGER.words,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useSplitReveal(ref, {
    type: "lines,words",
    pick: (s) => s.words,
    from: { rotationY: -92, y: "0.2em", opacity: 0 },
    exitVars: (f) => ({ ...f, rotationY: 92, y: "-0.2em" }),
    stagger,
    ...rest,
  });

  return createElement(
    as,
    { ref, className, id, style: { perspective: "600px", transformStyle: "preserve-3d" } },
    children,
  );
}
