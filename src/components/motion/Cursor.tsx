"use client";

/**
 * Cursor
 * A small bone dot that follows the pointer on a 0.18s ease and inverts what
 * it crosses (mix-blend difference). Over anything marked `data-cursor`
 * it grows into a thin brass ring; if the attribute has a value
 * (`data-cursor="Drag"`) that word appears beside it in mono.
 *
 * Fine pointers only. Reduced motion: never mounted.
 * Mark interactive elements with data-cursor; nothing else to wire.
 */

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useFinePointer, useReducedMotion } from "@/lib/useMedia";
import { DUR } from "@/lib/easings";

export function Cursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const enabled = fine && !reduced;
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (!enabled || !root.current || !dot.current || !ring.current) return;
    const html = document.documentElement;
    html.classList.add("has-cursor");

    const xTo = gsap.quickTo(root.current, "x", { duration: DUR.cursor, ease: "power3.out" });
    const yTo = gsap.quickTo(root.current, "y", { duration: DUR.cursor, ease: "power3.out" });
    let visible = false;

    const move = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      if (!visible) {
        visible = true;
        gsap.to(root.current, { opacity: 1, duration: 0.4, ease: "power2.out" });
      }
    };
    const leave = () => {
      visible = false;
      gsap.to(root.current, { opacity: 0, duration: 0.4, ease: "power2.out" });
    };

    // Delegated: the whole tree can change under us and this keeps working.
    const over = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest<HTMLElement>("[data-cursor], a, button");
      const active = Boolean(target);
      const text = target?.dataset.cursor ?? "";
      setLabel(text);
      gsap.to(ring.current, {
        scale: active ? 1 : 0.4,
        opacity: active ? 1 : 0,
        duration: 0.5,
        ease: "expo.out",
        overwrite: true,
      });
      gsap.to(dot.current, {
        scale: active ? 0.5 : 1,
        duration: 0.5,
        ease: "expo.out",
        overwrite: true,
      });
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);

    return () => {
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 opacity-0"
      style={{ zIndex: "var(--z-cursor)" }}
    >
      <div
        ref={dot}
        className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-primary"
        style={{ mixBlendMode: "difference" }}
      />
      <div
        ref={ring}
        className="absolute -left-7 -top-7 h-14 w-14 rounded-full border border-rule opacity-0"
        style={{ transform: "scale(0.4)" }}
      />
      {label ? (
        <span className="mono absolute left-9 top-9 whitespace-nowrap bg-base px-1.5 py-0.5 text-primary">
          {label}
        </span>
      ) : null}
    </div>
  );
}
