"use client";

/**
 * RevealChars
 * Display type. Characters rotate in from ninety degrees with a horizontal
 * offset, and rotate out the other way, so what flew in forward flies out
 * backward rather than reversing back down the way it came.
 *
 * <RevealChars as="h2" className="display">How a fest site gets built.</RevealChars>
 *
 * Needs perspective on the container for the rotation to read as depth rather
 * than as a squash, and a line mask so the characters are clipped to their own
 * line while they turn.
 */

import { createElement, useRef } from "react";
import { STAGGER } from "@/lib/easings";
import { useSplitReveal } from "./useSplitReveal";
import type { RevealProps } from "./RevealLines";

export function RevealChars({
  as = "h2",
  children,
  className,
  id,
  stagger = STAGGER.chars,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useSplitReveal(ref, {
    type: "lines,words,chars",
    mask: true,
    pick: (s) => s.chars,
    from: { rotate: 90, x: "0.55em", opacity: 0, transformOrigin: "0% 50%" },
    exitVars: (f) => ({ ...f, rotate: -90, x: "-0.55em" }),
    stagger,
    ...rest,
  });

  return createElement(
    as,
    { ref, className, id, style: { perspective: "800px" } },
    children,
  );
}
