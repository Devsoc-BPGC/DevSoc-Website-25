"use client";

/**
 * Magnetic
 * Pulls its child a few pixels toward the pointer while hovered and eases
 * back when it leaves. Use on one call to action per page, no more.
 *
 * <Magnetic strength={22}><a href="...">Write to us</a></Magnetic>
 */

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { useFinePointer, useReducedMotion } from "@/lib/useMedia";

export function Magnetic({
  children,
  strength = 22,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !fine || reduced) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo(((e.clientX - r.left) / r.width - 0.5) * strength);
      yTo(((e.clientY - r.top) / r.height - 0.5) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [fine, reduced, strength]);

  return (
    <span ref={ref} className={className ? `inline-block ${className}` : "inline-block"}>
      {children}
    </span>
  );
}
