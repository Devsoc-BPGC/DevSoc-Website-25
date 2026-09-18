"use client";

/**
 * Cursor
 * A registration mark, the crosshair printed at the corners of a drawing so
 * the sheets line up. It follows the pointer on a short ease and inverts what
 * it crosses, so it reads on ink and on paper. Over anything marked
 * `data-cursor`, or any link or button, four corner brackets close in around
 * it; if the attribute has a value (`data-cursor="R-03"`) that word is printed
 * beside it as a small blueprint tag.
 *
 * Fine pointers only, never required to understand anything, and never
 * mounted under reduced motion.
 */

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useFinePointer, useReducedMotion } from "@/lib/useMedia";
import { DUR } from "@/lib/easings";

/** A hairline of ink round the bone marks, built from four tight shadows. */
const OUTLINE =
  "drop-shadow(1px 0 0 rgb(13 14 12 / 0.85)) drop-shadow(-1px 0 0 rgb(13 14 12 / 0.85)) drop-shadow(0 1px 0 rgb(13 14 12 / 0.85)) drop-shadow(0 -1px 0 rgb(13 14 12 / 0.85))";

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
    let frame = 0;
    const at = { x: -1, y: -1 };

    const move = (e: PointerEvent) => {
      at.x = e.clientX;
      at.y = e.clientY;
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
    const settle = (el: Element | null) => {
      const target = el?.closest<HTMLElement>("[data-cursor], a, button");
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
        scale: active ? 0.6 : 1,
        duration: 0.5,
        ease: "expo.out",
        overwrite: true,
      });
    };

    const over = (e: PointerEvent) => settle(e.target as Element | null);

    // Scrolling moves the page under a still pointer, and that fires no
    // pointer event at all, so the ring would keep whatever label it had
    // when the page last moved beneath it. Re-read what is under it.
    const recheck = () => {
      if (!visible) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => settle(document.elementFromPoint(at.x, at.y)));
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    window.addEventListener("scroll", recheck, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);

    return () => {
      cancelAnimationFrame(frame);
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("scroll", recheck);
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
      {/* The mark. */}
      {/* Bone with a hairline of ink round it, so it reads on the night and on
          the morning ground alike. A blend mode cannot do this here: the
          cursor is its own stacking context, so it would only blend with itself. */}
      <div ref={dot} className="absolute -left-[9px] -top-[9px] h-[18px] w-[18px]" style={{ filter: OUTLINE }}>
        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[var(--c-bone)]" />
        <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-[var(--c-bone)]" />
        <span className="absolute left-1/2 top-1/2 h-[8px] w-[8px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--c-bone)]" />
      </div>
      {/* The brackets. */}
      <div
        ref={ring}
        className="absolute -left-[18px] -top-[18px] h-9 w-9 opacity-0"
        style={{ transform: "scale(0.4)", filter: OUTLINE }}
      >
        <span className="absolute left-0 top-0 h-2 w-2 border-l border-t border-[var(--c-bone)]" />
        <span className="absolute right-0 top-0 h-2 w-2 border-r border-t border-[var(--c-bone)]" />
        <span className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-[var(--c-bone)]" />
        <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-[var(--c-bone)]" />
      </div>
      {label ? (
        <span className="meta absolute left-6 top-6 whitespace-nowrap bg-[var(--c-blue)] px-1.5 py-0.5 text-[var(--c-bone)]">
          {label}
        </span>
      ) : null}
    </div>
  );
}
