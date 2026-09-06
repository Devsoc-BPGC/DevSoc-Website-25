"use client";

/**
 * Timecode
 * Pixel-font counter that runs with page scroll: 00:00:00:00 at the top,
 * 00:08:00:00 at the end, 24 frames a second. Writes straight to the DOM.
 */

import { useRef } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function Timecode({ className }: { className?: string }) {
  const code = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const el = code.current;
    if (!el) return;
    const total = 8 * 60 * 24;
    const st = ScrollTrigger.create({
      start: 0,
      end: () => ScrollTrigger.maxScroll(window),
      onUpdate(self) {
        const f = Math.round(self.progress * total);
        const s = Math.floor(f / 24);
        el.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f % 24)}`;
      },
    });
    return () => st.kill();
  });

  return (
    <span ref={code} className={`hud text-light ${className ?? ""}`} aria-hidden="true">
      00:00:00:00
    </span>
  );
}
