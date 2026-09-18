"use client";

/**
 * LedSign
 * The only true marquee on the site: a dot-matrix sign fixed to the build desk.
 *
 * The dots belong to the sign, not to the words. The pitch is a mask on the
 * housing, so the lettering slides underneath a grid that stays put, which is
 * what an LED board does; the unlit dots show faintly the whole time. The
 * words move with the stage's progress rather than a clock, so the sign only
 * runs while you do, and runs backwards when you scroll back.
 */

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { useStage } from "@/components/motion/stageContext";

export function LedSign({
  words,
  travel = 0.5,
  className,
}: {
  words: readonly string[];
  /** Share of the run's own length it travels across the whole scene. */
  travel?: number;
  className?: string;
}) {
  const rails = useRef<HTMLDivElement>(null);
  const stage = useStage();

  useGSAP(
    () => {
      const host = rails.current;
      if (!host || !stage) return;
      const tracks = Array.from(host.querySelectorAll<HTMLElement>("[data-rail]"));
      return stage.subscribe((p) => {
        const x = `translate3d(${(-p * travel * 100).toFixed(3)}%, 0, 0)`;
        tracks.forEach((t) => {
          t.style.transform = x;
        });
      });
    },
    { dependencies: [stage, travel] },
  );

  const run = [...words, ...words, ...words, ...words];
  const line = (
    <>
      {run.map((w, i) => (
        <span key={`${w}-${i}`} className="flex items-center gap-[0.9em] pr-[0.9em]">
          {w}
          <span className="inline-block h-[0.34em] w-[0.34em] bg-current" />
        </span>
      ))}
    </>
  );

  return (
    <div
      aria-hidden="true"
      className={`led relative overflow-hidden bg-[#050605] ${className ?? ""}`}
      // A steel housing with the panel set into it.
      style={{
        boxShadow:
          "0 0 0 3px #1d1f21, 0 0 0 4px color-mix(in srgb, var(--c-steel) 55%, transparent), inset 0 2px 6px rgb(0 0 0 / 0.8), 0 18px 40px -12px color-mix(in srgb, var(--light-core) 18%, transparent)",
      }}
    >
      <div ref={rails} className="absolute inset-0">
        {/* A faint copy outside the dots, blurred, reads as the glow off them. */}
        <div data-rail className="display absolute inset-y-0 left-0 flex w-max items-center whitespace-nowrap text-[var(--light-core)] opacity-60 blur-[7px] will-change-transform">
          {line}
        </div>
        <div className="led-dots absolute inset-0">
          <div data-rail className="display absolute inset-y-0 left-0 flex w-max items-center whitespace-nowrap text-[var(--light-core)] will-change-transform">
            {line}
          </div>
        </div>
      </div>
    </div>
  );
}
