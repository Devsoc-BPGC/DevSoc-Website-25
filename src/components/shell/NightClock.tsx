"use client";

/**
 * NightClock
 * The narrative device. The site is one night on campus, and this counts
 * through it as you scroll: 18:42 at the top, 05:58 at the bottom. The time
 * is interpolated between the surrounding chapters so it advances smoothly
 * rather than jumping at each section boundary.
 *
 * Falls back to the first chapter's time when no chapter sections are on the
 * page, so it is safe on every route.
 *
 * Reduced motion: shows the current chapter's fixed time, no interpolation.
 */

import { useEffect, useRef, useState } from "react";
import { chapters, formatNightTime } from "@/content/chapters";
import { useReducedMotion } from "@/lib/useMedia";

export function NightClock({ className }: { className?: string }) {
  const [label, setLabel] = useState(chapters[0].time);
  const reduced = useReducedMotion();
  const frame = useRef(0);

  useEffect(() => {
    const read = () => {
      const tops = chapters.map((c) => {
        const el = document.getElementById(c.id);
        return el ? el.getBoundingClientRect().top + window.scrollY : null;
      });
      if (tops.every((t) => t === null)) {
        setLabel(chapters[0].time);
        return;
      }

      const mark = window.scrollY + window.innerHeight * 0.4;
      let i = 0;
      for (let k = 0; k < tops.length; k++) {
        const t = tops[k];
        if (t !== null && t <= mark) i = k;
      }

      const current = chapters[i];
      const next = chapters[i + 1];
      const from = tops[i];
      const to = i + 1 < tops.length ? tops[i + 1] : null;

      if (reduced || !next || from === null || to === null) {
        setLabel(current.time);
        return;
      }

      const span = to - from;
      const p = span > 0 ? Math.min(1, Math.max(0, (mark - from) / span)) : 0;
      setLabel(formatNightTime(current.minutes + (next.minutes - current.minutes) * p));
    };

    const onScroll = () => {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  return (
    <span className={`hud text-light ${className ?? ""}`} aria-label={`Time in the story, ${label}`}>
      {label}
    </span>
  );
}
