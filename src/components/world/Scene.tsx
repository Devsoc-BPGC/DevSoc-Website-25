"use client";

/**
 * Scene
 * One chapter of the night: a tall track with a sticky stage inside it, and one
 * scrubbed trigger that hands everything inside a single progress, 0 to 1.
 *
 * The rule the whole site is built on lives here. If everything a scene
 * renders is a pure function of that one number, scrolling back up evaluates
 * the same function backwards, and the exit is the entrance reversed, exactly,
 * for free. Nothing in a scene authors an exit.
 *
 * Progress reaches the scene three ways, and they cost nothing extra:
 *   - `--p` on the stage, for anything that can stay in CSS (see `.layer`)
 *   - `onProgress(p)`, for the scene's own choreography
 *   - StageContext, which the text reveals and the Light subscribe to, so no
 *     child ever makes a ScrollTrigger of its own. One trigger per scene keeps
 *     the home page far under the 24 trigger budget.
 *
 * With `depth`, the stage also carries the pointer as `--mx` / `--my` (-1 to 1,
 * eased) so layers can shift against each other by depth. Fine pointers only,
 * and only while the scene is on screen.
 *
 * There is no GSAP pin. A pin builds its own spacer and lifts the element out
 * of flow; this is `position: sticky` over a measured track, which never
 * fights the smooth scroll layer. Under reduced motion the track collapses to
 * its natural height, nothing sticks, and progress is reported once at
 * `settled` so the scene renders its finished composition.
 */

import { useMemo, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { SCRUB } from "@/lib/easings";
import { useIsMobile, useReducedMotion } from "@/lib/useMedia";
import { StageContext, type StageProgress } from "@/components/motion/stageContext";

export type SceneProps = {
  children: ReactNode;
  id?: string;
  /** Track height in viewport heights. 100 of it is the stage itself. */
  vh?: number;
  /** Shorter track on a phone, where the same content needs less travel. */
  vhMobile?: number;
  /** Called on every scroll frame with progress 0..1. */
  onProgress?: (p: number) => void;
  /** Where a still version sits. Reduced motion reports this once. */
  settled?: number;
  /** Carry the pointer on the stage for depth layers. */
  depth?: boolean;
  className?: string;
  stageClassName?: string;
  "aria-labelledby"?: string;
  "aria-label"?: string;
};

export function Scene({
  children,
  id,
  vh = 200,
  vhMobile,
  onProgress,
  settled = 1,
  depth = false,
  className,
  stageClassName,
  ...rest
}: SceneProps) {
  const track = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);

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

      if (reduced) {
        write(settled);
        return;
      }

      write(0);
      let active = false;
      const st = ScrollTrigger.create({
        trigger: t,
        start: "top top",
        end: "bottom bottom",
        scrub: SCRUB.normal,
        invalidateOnRefresh: true,
        onUpdate: (self) => write(self.progress),
        onToggle: (self) => {
          active = self.isActive;
          s.style.willChange = self.isActive ? "transform" : "";
        },
      });

      // Pointer depth, eased so layers drift after the hand rather than
      // snapping to it. quickTo reuses one tween per axis.
      let off: (() => void) | undefined;
      if (depth && window.matchMedia("(pointer: fine)").matches) {
        const toX = gsap.quickTo(s, "--mx", { duration: 1.1, ease: "power3.out" });
        const toY = gsap.quickTo(s, "--my", { duration: 1.1, ease: "power3.out" });
        const move = (e: PointerEvent) => {
          if (!active) return;
          toX((e.clientX / window.innerWidth) * 2 - 1);
          toY((e.clientY / window.innerHeight) * 2 - 1);
        };
        window.addEventListener("pointermove", move, { passive: true });
        off = () => window.removeEventListener("pointermove", move);
      }

      return () => {
        st.kill();
        off?.();
        s.style.willChange = "";
      };
    },
    { dependencies: [reduced, settled, height, onProgress, depth] },
  );

  return (
    <StageContext.Provider value={published}>
      <section
        ref={track}
        id={id}
        className={`relative ${className ?? ""}`}
        style={reduced ? undefined : { height: `${height}vh` }}
        {...rest}
      >
        <div
          ref={stage}
          // Scene compositions are mostly absolutely positioned, so the still
          // stage still needs a screen's height or it collapses to nothing.
          className={
            reduced
              ? `relative min-h-[100dvh] overflow-hidden ${stageClassName ?? ""}`
              : `sticky top-0 h-[100dvh] overflow-hidden ${stageClassName ?? ""}`
          }
          style={{ ["--mx" as string]: 0, ["--my" as string]: 0 }}
        >
          {children}
        </div>
      </section>
    </StageContext.Provider>
  );
}
