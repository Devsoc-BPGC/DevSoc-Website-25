"use client";

/**
 * Through the door.
 *
 * This is the hinge of the whole site, and the thing that makes it one piece
 * rather than a stack of sections. The night chapter ends on a building with
 * one door open and light falling out of it. Instead of that image ending and a
 * new section beginning, the scroll walks into the door: the facade pushes past
 * you, the doorway grows until it is the only thing left, and the light coming
 * out of it opens up and takes the entire frame. You come out the other side
 * standing in the light, and that is where the questions get answered.
 *
 * So the transition is not a divider between two sections. It is the same light
 * source, continuous, changing scale. Nothing cuts.
 *
 * The chapter's own content is handed in as children and rides on top of the
 * plate, because this *is* the chapter, not a divider bolted after it. An
 * earlier cut had the door as a still hero and then this stage below it
 * re-showing the same plate from scale one, so the building arrived twice and
 * the push read as a second, unrelated door. There is one door.
 *
 * The choreography, as one function of progress:
 *
 *   0.00 - 0.16   nothing moves. The chapter is readable and the search box is
 *                 usable before the floor starts moving under it.
 *   0.16 - 0.38   the content leaves, so nothing is mid sentence when the walls
 *                 start to pass.
 *   0.16 - 0.62   the camera pushes in. The facade scales up from the doorway,
 *                 so the doorway holds still in the frame while the building
 *                 grows past the edges. This is why the origin matters: scale
 *                 from the centre and it reads as an image zooming, scale from
 *                 the doorway and it reads as walking toward it.
 *   0.35 - 0.80   the light inside the door swells out of that same point and
 *                 washes the frame from the middle out.
 *   0.80 - 1.00   the wash finishes as flat dawn, matched exactly to the ground
 *                 the questions sit on, so the seam between the two is invisible.
 *
 * Everything is a pure function of one number, so scrolling back up walks you
 * out of the door backwards, the light shuts back down to a doorway, and the
 * night closes over it again.
 */

import { useCallback, useRef, type ReactNode } from "react";
import Image from "next/image";
import { StickyStage } from "@/components/motion/StickyStage";

/**
 * Where the lit doorway sits in the plate, as a share of the frame. Everything
 * in this section grows out of this point, so it is the one measurement that
 * has to be right, and it was measured off the plate rather than guessed:
 * a row profile of warm, bright pixels through the central columns of
 * door-wide.jpg puts the opening between 71 and 99 percent of the frame, so its
 * centre is 85.
 *
 * Both earlier values were wrong in the same direction and it showed. Guessing
 * 63 walked the camera up the wall above the door. Taking the single brightest
 * pixel gave 72, which is the top edge of the opening rather than its middle,
 * so the doorway still sat low and the approach read as too high.
 *
 * The plate is wider than any viewport it lands in, so `object-cover` crops the
 * sides and leaves the full height showing. Vertical percentages therefore map
 * straight through, which is what lets one number serve both crops.
 */
const DOOR_X = 50;
const DOOR_Y = 85;

/** Where the doorway ends up once you are standing in it. */
const LIFT_TO = 50;

/** Eases the middle of a range to 0..1. */
function ramp(p: number, from: number, to: number) {
  return Math.min(1, Math.max(0, (p - from) / (to - from)));
}

export function DoorLight({ children }: { children?: ReactNode }) {
  const facade = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const bloom = useRef<HTMLDivElement>(null);
  const flat = useRef<HTMLDivElement>(null);

  const onProgress = useCallback((p: number) => {
    // The push. Exponential rather than linear, so the last part of the
    // approach accelerates the way walking through a doorway does.
    // A hold before the push. Content that starts moving the instant you touch
    // the wheel never gets read, and this chapter carries the search box.
    const push = ramp(p, 0.16, 0.62);

    // The chapter clears out before the walls start to pass.
    if (hero.current) {
      const out = 1 - ramp(p, 0.16, 0.38);
      hero.current.style.opacity = out.toFixed(3);
      hero.current.style.pointerEvents = out > 0.6 ? "" : "none";
    }
    // Scaling about the doorway keeps it pinned where it sits in the plate, low
    // in the frame. Lifting by the difference walks it up to eye level as you
    // approach, which is the part that makes it read as movement through a
    // space rather than an image being enlarged.
    const lift = (LIFT_TO - DOOR_Y) * push;
    if (facade.current) {
      const scale = 1 + Math.pow(push, 1.7) * 7.5;
      facade.current.style.transform = `translateY(${lift.toFixed(3)}vh) scale(${scale.toFixed(4)})`;
      // The walls fall dark as they pass, so the eye keeps the doorway.
      facade.current.style.opacity = (1 - ramp(p, 0.55, 0.85) * 0.9).toFixed(3);
    }

    // The light swelling out of the doorway.
    const open = ramp(p, 0.3, 0.82);
    if (bloom.current) {
      bloom.current.style.opacity = open.toFixed(3);
      bloom.current.style.transform = `translateY(${lift.toFixed(3)}vh) scale(${(0.12 + Math.pow(open, 0.75) * 3.4).toFixed(4)})`;
    }

    // The last of it flattens to the ground the questions stand on.
    if (flat.current) flat.current.style.opacity = ramp(p, 0.72, 0.97).toFixed(3);
  }, []);

  return (
    <StickyStage
      vh={300}
      vhMobile={220}
      tone="media"
      settled={1}
      onProgress={onProgress}
      stageClassName="bg-base"
    >
      {/* The facade, pushed through. */}
      <div
        ref={facade}
        className="absolute inset-0 will-change-transform"
        style={{ transformOrigin: `${DOOR_X}% ${DOOR_Y}%` }}
        aria-hidden="true"
      >
        <Image
          src="/images/dawn/door-wide.jpg"
          alt=""
          fill
          sizes="100vw"
          className="hidden object-cover md:block"
        />
        <Image src="/images/dawn/door-tall.jpg" alt="" fill sizes="100vw" className="object-cover md:hidden" />
      </div>

      {/* The chapter, and the scrim that makes it legible over the plate. The
          scrim lives inside the fading group on purpose: it exists only so the
          type can be read, so it has to leave when the type does. Left on its
          own it survives as a dark band across the foot of the frame at exactly
          the point the light is supposed to have taken everything. */}
      <div ref={hero} className="absolute inset-0 z-10 flex flex-col justify-end">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(to bottom, var(--scrim) 4%, transparent 34%, var(--scrim) 88%)" }}
          aria-hidden="true"
        />
        <div className="relative w-full">{children}</div>
      </div>

      {/* The light coming out of it. */}
      <div
        ref={bloom}
        className="pointer-events-none absolute inset-0 z-20 will-change-transform"
        style={{
          opacity: 0,
          transform: "scale(0.12)",
          transformOrigin: `${DOOR_X}% ${DOOR_Y}%`,
          background: `radial-gradient(circle at ${DOOR_X}% ${DOOR_Y}%, var(--c-dawn) 0%, color-mix(in oklch, var(--c-dawn) 78%, transparent) 34%, transparent 68%)`,
        }}
        aria-hidden="true"
      />

      {/* And the ground it becomes. */}
      <div
        ref={flat}
        className="pointer-events-none absolute inset-0 z-30"
        style={{ opacity: 0, background: "var(--c-dawn)" }}
        aria-hidden="true"
      />
    </StickyStage>
  );
}
