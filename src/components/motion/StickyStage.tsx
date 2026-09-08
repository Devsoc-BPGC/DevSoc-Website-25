"use client";

/**
 * StickyStage
 * The scaffold every scroll-driven section on this site sits on.
 *
 * A tall track with a sticky stage inside it, and one scrubbed trigger that
 * hands you a single normalised progress. That progress is the only input a
 * section gets, which is the rule that makes the whole design language work:
 * if everything a section renders is a pure function of one number, then
 * scrolling back up evaluates that function backwards and the exit is exact
 * and free. Nothing here ever authors an exit.
 *
 *   <StickyStage vh={280} onProgress={(p) => write(p)}>
 *     {stage}
 *   </StickyStage>
 *
 * Progress is written to `--p` on the stage as well, so simple sections can
 * stay in CSS and never touch JavaScript.
 *
 * There is no GSAP pin. A pin would build its own spacer and take the element
 * out of flow; this measures a spacer and uses `position: sticky`, which is
 * cheaper, never fights the smooth scroll layer, and leaves the stage in the
 * document where the tone watcher can still see it.
 *
 * Under reduced motion the track collapses to its natural height, the stage
 * stops sticking, and progress is reported once at `settled` so the section
 * renders its finished state.
 */

import { useMemo, useRef, type ReactNode } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { SCRUB } from "@/lib/easings";
import { useIsMobile, useReducedMotion } from "@/lib/useMedia";
import { StageContext, type StageProgress } from "./stageContext";

export type StickyStageProps = {
  children: ReactNode;
  /** Track height in viewport heights. 100 of it is the stage itself. */
  vh?: number;
  /** Shorter track on a phone, where the same content needs less travel. */
  vhMobile?: number;
  /** Called on every scroll frame with progress 0..1. */
  onProgress?: (p: number) => void;
  /** Where a still version should sit. Reduced motion reports this once. */
  settled?: number;
  className?: string;
  stageClassName?: string;
  id?: string;
  /** Section tone, read by the fixed chrome. */
  tone?: "ground" | "inverted" | "accent" | "media";
  "aria-labelledby"?: string;
};

export function StickyStage({
  children,
  vh = 200,
  vhMobile,
  onProgress,
  settled = 1,
  className,
  stageClassName,
  id,
  tone = "ground",
  ...rest
}: StickyStageProps) {
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  /** Everything inside reads its own motion off this one number. */
  const listeners = useRef(new Set<(p: number) => void>());
  const latest = useRef(0);
  const published = useMemo<StageProgress>(
    () => ({
      subscribe(fn) {
        listeners.current.add(fn);
        fn(latest.current);
        return () => {
          listeners.current.delete(fn);
        };
      },
      get: () => latest.current,
    }),
    [],
  );
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const still = reduced;
  const height = mobile && vhMobile ? vhMobile : vh;

  useGSAP(
    () => {
      const t = track.current;
      const s = stage.current;
      if (!t || !s) return;

      const write = (p: number) => {
        latest.current = p;
        s.style.setProperty("--p", p.toFixed(4));
        onProgress?.(p);
        listeners.current.forEach((fn) => fn(p));
      };

      if (still) {
        write(settled);
        return;
      }

      write(0);
      const st = ScrollTrigger.create({
        trigger: t,
        start: "top top",
        end: "bottom bottom",
        scrub: SCRUB.normal,
        invalidateOnRefresh: true,
        onUpdate: (self) => write(self.progress),
        // Promoted only while the stage is the thing on screen.
        onToggle: (self) => {
          s.style.willChange = self.isActive ? "transform" : "";
        },
      });
      return () => {
        st.kill();
        s.style.willChange = "";
      };
    },
    { dependencies: [still, settled, height, onProgress] },
  );

  return (
    <StageContext.Provider value={published}>
    <section
      ref={track}
      id={id}
      data-tone={tone}
      className={`relative ${className ?? ""}`}
      style={still ? undefined : { height: `${height}vh` }}
      {...rest}
    >
      <div
        ref={stage}
        className={
          still
            ? `relative overflow-hidden ${stageClassName ?? ""}`
            : `sticky top-0 h-[100dvh] overflow-hidden ${stageClassName ?? ""}`
        }
      >
        {children}
      </div>
    </section>
    </StageContext.Provider>
  );
}
