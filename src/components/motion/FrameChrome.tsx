"use client";

/**
 * FrameChrome
 * The film-frame device from the reference: four thin brass corner marks
 * fixed to the viewport and a pixel-font timecode at the top right that
 * runs with page scroll (00:00:00:00 at the top, 00:08:00:00 at the end,
 * 24 frames a second). Purely presentational; pointer events pass through.
 */

import { useRef } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function FrameChrome() {
  const code = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const el = code.current;
    if (!el) return;
    const total = 8 * 60 * 24; // frames across the whole page
    const st = ScrollTrigger.create({
      start: 0,
      end: () => ScrollTrigger.maxScroll(window),
      onUpdate(self) {
        const f = Math.round(self.progress * total);
        const frames = f % 24;
        const s = Math.floor(f / 24);
        el.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(frames)}`;
      },
    });
    return () => st.kill();
  });

  const mark = "pointer-events-none absolute h-4 w-4 border-brass/70";
  return (
    <div className="pointer-events-none fixed inset-0" style={{ zIndex: "var(--z-frame)" }} aria-hidden="true">
      <span className={`${mark} left-5 top-5 border-l border-t`} />
      <span className={`${mark} right-5 top-5 border-r border-t`} />
      <span className={`${mark} bottom-5 left-5 border-b border-l`} />
      <span className={`${mark} bottom-5 right-5 border-b border-r`} />
      <span
        ref={code}
        className="hud absolute right-10 top-[1.35rem] hidden text-verdigris md:block"
      >
        00:00:00:00
      </span>
    </div>
  );
}
