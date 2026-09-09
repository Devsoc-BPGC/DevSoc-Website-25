"use client";

/**
 * The engine behind RevealChars, RevealWords and RevealLines.
 *
 * Three type roles get three different physical metaphors, and they are never
 * mixed: display type rotates in character by character, the serif voice flips
 * word by word on the Y axis, and body copy rises line by line from behind a
 * mask. Applying the same reveal to all three would make the page feel
 * uniform rather than composed.
 *
 * Every one of them is a through timeline, so the exit is the entrance
 * evaluated backwards and scrolling up rewinds rather than replays.
 *
 * Two things here are load bearing and easy to get wrong.
 *
 * `autoSplit` re-splits on resize and after the fonts land, which throws away
 * the old nodes. So the timeline and both triggers are built inside `onSplit`
 * and torn down in `onRevert`, and the playhead is carried across the rebuild
 * in a ref. Without that, resizing while a headline is mid exit snaps it back
 * to its first pose and it replays on the way up.
 *
 * SplitText measures line breaks against whatever face is loaded, so a split
 * that runs before the display font arrives breaks the lines in the wrong
 * places. `autoSplit` handles that by re-splitting on `fonts.ready`.
 *
 * Inside a sticky stage, pass an `exit` that points at the end of the track.
 * A sticky element reports its unstuck position to ScrollTrigger, which is the
 * top of the track, so the default exit fires the instant the stage starts
 * sticking and the heading leaves before the section has even begun.
 */

import { useRef, type RefObject } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { DUR, EASE } from "@/lib/easings";
import { useReducedMotion } from "@/lib/useMedia";
import { stageTime, useStage } from "../stageContext";

export type ExitMode = "mirror" | "rewind";

export type SplitRevealOptions = {
  /** What SplitText carves the text into. */
  type: "lines" | "lines,words" | "lines,words,chars";
  /** Which of those pieces the tween moves. */
  pick: (self: SplitText) => Element[];
  /** The off stage pose, before arrival. */
  from: gsap.TweenVars;
  /**
   * The departure pose. `mirror` negates the arrival, so type that flew in
   * rotating forward flies out rotating backward. `rewind` sinks it back the
   * way it came, which is right for body copy.
   */
  exitVars: (from: gsap.TweenVars) => gsap.TweenVars;
  mask?: boolean;
  stagger: number;
  duration?: number;
  delay?: number;
  enter?: string;
  exit?: string;
  immediate?: boolean;
  exitMode?: ExitMode;
  /** Inside a stage, settle and stay settled for the rest of the section. */
  hold?: boolean;
};

export function useSplitReveal(
  ref: RefObject<HTMLElement | null>,
  {
    type,
    pick,
    from,
    exitVars,
    mask = false,
    stagger,
    duration = DUR.reveal,
    delay = 0,
    enter = "top 88%",
    exit = "top 6%",
    immediate = false,
    hold = false,
  }: SplitRevealOptions,
) {
  const reduced = useReducedMotion();
  /**
   * Inside a sticky stage, the playhead is driven by the stage's progress
   * rather than by triggers of our own. See stageContext for why.
   */
  const stage = useStage();
  /** Normalised playhead, carried across a re-split. */
  const held = useRef(0);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reduced) return;

      // SplitText auto-kills whatever onSplit returns, but the triggers and the
      // delayed call are ours. Held here so onRevert can reach them.
      let teardown: (() => void) | null = null;

      const split = SplitText.create(el, {
        type,
        mask: mask ? "lines" : undefined,
        linesClass: "split-line",
        autoSplit: true,
        onSplit(self) {
          const targets = pick(self);
          if (!targets.length) return;

          const tl = gsap.timeline({ paused: true });
          tl.from(targets, { ...from, duration, stagger, ease: EASE.out })
            .addLabel("rest")
            .to(targets, {
              ...exitVars(from),
              duration: DUR.exit,
              stagger: stagger * 0.7,
              ease: EASE.in,
            });

          const restAt = tl.labels.rest;
          const to = (time: number, dur: number) =>
            gsap.to(tl, {
              time,
              duration: dur,
              ease: EASE.none,
              overwrite: true,
              onUpdate: () => {
                held.current = tl.duration() ? tl.time() / tl.duration() : 0;
              },
            });

          tl.time(held.current * tl.duration());

          let lower: ScrollTrigger | null = null;
          let upper: ScrollTrigger | null = null;
          let call: gsap.core.Tween | null = null;
          let unsub: (() => void) | null = null;

          if (immediate) {
            call = gsap.delayedCall(delay, () => to(restAt, restAt));
          } else if (stage) {
            unsub = stage.subscribe((p) => {
              const t = stageTime(p, restAt, tl.duration(), hold);
              tl.time(t);
              held.current = tl.duration() ? t / tl.duration() : 0;
            });
          } else {
            lower = ScrollTrigger.create({
              trigger: el,
              start: enter,
              onEnter: () => to(restAt, restAt || duration),
              onLeaveBack: () => to(0, DUR.exit),
              fastScrollEnd: 2500,
            });
            upper = ScrollTrigger.create({
              trigger: el,
              start: exit,
              onEnter: () => to(tl.duration(), DUR.exit),
              onLeaveBack: () => to(restAt, DUR.exit),
              fastScrollEnd: 2500,
            });
          }

          teardown?.();
          teardown = () => {
            lower?.kill();
            upper?.kill();
            call?.kill();
            unsub?.();
            gsap.killTweensOf(tl);
          };
          return tl;
        },
        onRevert() {
          teardown?.();
          teardown = null;
        },
      });

      return () => {
        teardown?.();
        split.revert();
      };
    },
    { scope: ref, dependencies: [reduced, immediate, delay, enter, exit, stage, hold] },
  );
}
