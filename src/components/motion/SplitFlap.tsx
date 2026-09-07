"use client";

/**
 * SplitFlap
 * A departure board. Each character riffles through a few wrong glyphs before
 * it lands on the right one, left to right, the way the boards at a station
 * settle a row at a time.
 *
 * The final string is rendered underneath at full opacity zero, in the same
 * grid cell, so the box is always exactly the width of the finished text and
 * the flapping never reflows anything around it.
 *
 * <SplitFlap text="Once a year" play={inView} />
 *
 * Nothing happens until `play` turns true, and it only ever plays once.
 * Reduced motion renders the finished string and never flaps.
 */

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/useMedia";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
/** How long one character spends being wrong. */
const FLAP = 42;
/** Delay between one character settling and the next starting. */
const STEP = 46;

export function SplitFlap({
  text,
  play,
  delay = 0,
  className,
  style,
}: {
  text: string;
  play: boolean;
  /** Seconds to wait after `play` before the first character moves. */
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const live = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = live.current;
    if (!el) return;
    // Settling here rather than only in the loop matters: the media query
    // resolves a beat after mount, so a reader on reduced motion can start
    // flapping and then be told to stop, and the last scrambled string would
    // otherwise stay in the DOM for good.
    if (!play || done || reduced) {
      el.textContent = text;
      return;
    }
    const chars = [...text];
    // Every character gets its own settle time and its own number of flaps.
    const settle = chars.map((c, i) => (c === " " ? 0 : delay * 1000 + i * STEP + (4 + (i % 3)) * FLAP));
    const end = Math.max(...settle, 0);
    const start = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      const t = now - start;
      el.textContent = chars
        .map((c, i) => (c === " " || t >= settle[i] ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
        .join("");
      if (t < end) raf = requestAnimationFrame(frame);
      else {
        el.textContent = text;
        setDone(true);
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      el.textContent = text;
    };
  }, [play, done, reduced, text, delay]);

  return (
    <span className={`inline-grid ${className ?? ""}`} style={style}>
      {/* Holds the box open at the finished width. */}
      <span className="invisible col-start-1 row-start-1" aria-hidden="true">
        {text}
      </span>
      {/* Always rendered settled. The loop scrambles it in place, so there is
          never a frame where the value is missing. */}
      <span ref={live} className="col-start-1 row-start-1">
        {text}
      </span>
    </span>
  );
}
