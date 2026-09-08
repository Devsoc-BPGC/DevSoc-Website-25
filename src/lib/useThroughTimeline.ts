"use client";

/**
 * The through timeline.
 *
 * Every reveal on this site has a matching, opposite direction exit, and
 * scrolling back up rewinds the exact sequence rather than re triggering
 * effects out of order. Authoring two animations per element would make that a
 * discipline nobody keeps. This makes it structural instead.
 *
 * One timeline, three poses:
 *
 *     time 0 ────────── label "rest" ────────── end
 *      before                 at                after
 *   (off stage below)      (settled)      (off stage above)
 *
 * Entering from below tweens the playhead from 0 to "rest". Leaving out of the
 * top tweens it from "rest" to the end. Scrolling back up runs the same tweens
 * backwards along the same curve, by definition. You never author an exit.
 *
 * Why not `toggleActions: "play none none reverse"`: that pattern has only two
 * states, so text leaving the top of the viewport reverses back *down* the way
 * it came. That reads as a stutter, not as an exit. Three poses give a real
 * opposite direction departure and an exact rewind at the same time.
 *
 * The playhead tween always uses EASE.none. The eases and staggers baked into
 * the timeline are what you are meant to see; a second ease out here would
 * compound them.
 */

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { EASE, DUR } from "@/lib/easings";
import { useReducedMotion } from "@/lib/useMedia";

export type Pose = "before" | "rest" | "after";

export type ThroughOptions = {
  /**
   * Builds the three poses onto a paused timeline. Called once, and again on
   * every rebuild (a SplitText re-split, a resize). Must be pure: it may not
   * read scroll position or start its own tweens.
   */
  build: (tl: gsap.core.Timeline) => void;
  /** Where the element arrives. ScrollTrigger `start` syntax. */
  enter?: string;
  /** Where it leaves out of the top. ScrollTrigger `start` syntax. */
  exit?: string;
  /** Play straight through to rest on mount instead of waiting for scroll. */
  immediate?: boolean;
  /** Seconds to wait before an `immediate` play. */
  delay?: number;
  /** Rebuild when any of these change. */
  deps?: unknown[];
};

const REST = "rest";

/**
 * Attaches a through timeline to `ref`. Returns nothing: the timeline is owned
 * here and torn down with the effect.
 *
 * Under reduced motion the timeline is built and parked at rest, so the settled
 * pose is the only thing that ever renders and no trigger is created.
 */
export function useThroughTimeline(
  ref: React.RefObject<HTMLElement | null>,
  { build, enter = "top 88%", exit = "top 6%", immediate = false, delay = 0, deps = [] }: ThroughOptions,
) {
  const reduced = useReducedMotion();
  /**
   * Normalised playhead, kept outside the timeline so a rebuild can restore it.
   * Without this, resizing while a headline is mid exit snaps it back to pose
   * one and it replays on the way up.
   */
  const held = useRef(0);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const tl = gsap.timeline({ paused: true });
      build(tl);
      if (!tl.labels[REST]) {
        // A build that never marked its settled pose has no exit to run, so
        // treat the whole timeline as the entrance and park the exit on top.
        tl.addLabel(REST, tl.duration());
      }

      const restAt = tl.labels[REST];
      const to = (position: number, duration: number) =>
        gsap.to(tl, {
          time: position,
          duration,
          ease: EASE.none,
          overwrite: true,
          onUpdate: () => {
            held.current = tl.duration() ? tl.time() / tl.duration() : 0;
          },
        });

      if (reduced) {
        tl.time(restAt);
        return () => {
          tl.kill();
        };
      }

      tl.time(held.current * tl.duration());

      if (immediate) {
        const t = gsap.delayedCall(delay, () => to(restAt, restAt));
        return () => {
          t.kill();
          gsap.killTweensOf(tl);
          tl.kill();
        };
      }

      /** The lower edge: arriving from below, and leaving back down. */
      const lower = ScrollTrigger.create({
        trigger: el,
        start: enter,
        onEnter: () => to(restAt, restAt || DUR.reveal),
        onLeaveBack: () => to(0, DUR.exit),
        // A fling past the section should land on the end pose, not animate
        // something that is already off screen.
        fastScrollEnd: 2500,
      });

      /** The upper edge: leaving out of the top, and coming back down into rest. */
      const upper = ScrollTrigger.create({
        trigger: el,
        start: exit,
        onEnter: () => to(tl.duration(), DUR.exit),
        onLeaveBack: () => to(restAt, DUR.exit),
        fastScrollEnd: 2500,
      });

      return () => {
        lower.kill();
        upper.kill();
        gsap.killTweensOf(tl);
        tl.kill();
      };
    },
    { dependencies: [reduced, immediate, delay, enter, exit, ...deps] },
  );
}
