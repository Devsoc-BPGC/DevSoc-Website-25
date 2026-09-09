"use client";

/**
 * The door behind you.
 *
 * The reverse of DoorLight, and the reason the site reads as one night rather
 * than a run of chapters. You walked into the lit doorway and the light took
 * the whole frame; the questions were answered standing in it. Now you keep
 * going, and the light does what light does when you walk away from its source:
 * it draws back to the shape of the doorway, gets smaller, and the dark closes
 * around it until there is nothing left but the room you started in.
 *
 * So the page opens with light growing out of a point and closes with light
 * shrinking back into one. That is the site's only punctuation, and using it at
 * both ends is what makes the ending feel like an ending rather than a
 * stopping.
 *
 * Two earlier versions of this are worth knowing about, because both failed in
 * ways that look like a styling problem and are actually a shape problem.
 *
 * A hard edged rectangle contracting evenly from the full frame spends almost
 * all of its travel as a landscape slab, so it reads as a yellow panel sitting
 * on a dark one. A soft radial pool fixes the edges and loses the shape: it
 * reads as a brown smudge, because dawn dimmed over near black is brown.
 *
 * What works is keeping the aperture door shaped the whole way. The horizontal
 * closes first and fast, so within moments the light is taller than it is wide
 * and stays that way; the vertical closes slowly behind it. The frame becomes a
 * portrait, then a tall slit, then a small bright door a long way off. The edge
 * blurs as it recedes, which is both what distant light does and what keeps it
 * from reading as a shape with a border.
 *
 * The choreography, as one function of progress:
 *
 *   0.00 - 0.30   the flat ground hands over to the aperture. Same colour, so
 *                 nothing visibly happens: this exists only so the seam from
 *                 the questions above is invisible.
 *   0.06 - 0.52   the sides come in. This is the part that makes it a door.
 *   0.06 - 0.88   the top and bottom follow, slower.
 *   0.88 - 1.00   the last of it goes out, and the night is closed.
 */

import { useCallback, useRef } from "react";
import { StickyStage } from "@/components/motion/StickyStage";

/** What is left of the light at the end, as a share of the frame. */
const DOOR_W = 8;
const DOOR_H = 20;

/**
 * How far into this section the light stops reaching the chrome at the top of
 * the screen. Dawn owns the tone across both sections and needs this number;
 * the chrome loses the light early, so it is a sliver of the section, not half
 * of it. Getting it wrong leaves the chrome inverted over night, which is
 * exactly as invisible as the problem it was there to fix.
 */
export const LIGHT_LEAVES_CHROME = 0.27;

function ramp(p: number, from: number, to: number) {
  return Math.min(1, Math.max(0, (p - from) / (to - from)));
}

export function DoorBehind({ trackRef }: { trackRef?: React.Ref<HTMLDivElement> }) {
  const flat = useRef<HTMLDivElement>(null);
  const light = useRef<HTMLDivElement>(null);
  const soften = useRef<HTMLDivElement>(null);
  const halo = useRef<HTMLDivElement>(null);

  const onProgress = useCallback((p: number) => {
    if (flat.current) flat.current.style.opacity = (1 - ramp(p, 0.03, 0.3)).toFixed(3);

    // Sides first and fast, top and bottom slowly behind them.
    const sides = ramp(p, 0.06, 0.52);
    const ends = ramp(p, 0.06, 0.88);
    const gone = ramp(p, 0.88, 1);

    if (light.current) {
      const x = ((100 - DOOR_W) / 2) * sides;
      const y = ((100 - DOOR_H) / 2) * ends;
      light.current.style.clipPath = `inset(${y.toFixed(2)}% ${x.toFixed(2)}% ${y.toFixed(2)}% ${x.toFixed(2)}%)`;
      light.current.style.opacity = (1 - gone).toFixed(3);
    }

    // The blur has to be on the parent. On the clipped element itself the clip
    // is applied after the filter, so the softened edge is cut straight back
    // off and the light reads as a card again.
    if (soften.current) soften.current.style.filter = `blur(${(4 + sides * 20).toFixed(1)}px)`;

    if (halo.current) {
      halo.current.style.transform = `scale(${(1 - ends * 0.62).toFixed(3)})`;
      halo.current.style.opacity = ((1 - gone) * (0.5 + sides * 0.5)).toFixed(3);
    }
  }, []);

  return (
    <div ref={trackRef}>
      <StickyStage vh={180} vhMobile={130} tone="ground" settled={1} onProgress={onProgress} stageClassName="bg-base">
        {/* What the doorway throws into the room around it. */}
        <div
          ref={halo}
          className="pointer-events-none absolute inset-0 will-change-transform"
          style={{
            opacity: 0.35,
            background:
              "radial-gradient(34% 46% at 50% 50%, color-mix(in oklch, var(--c-dawn) 55%, transparent), transparent 74%)",
          }}
          aria-hidden="true"
        />

        {/* The doorway itself, receding. */}
        <div ref={soften} className="pointer-events-none absolute inset-0" style={{ filter: "blur(4px)" }} aria-hidden="true">
          <div
            ref={light}
            className="absolute inset-0"
            style={{ background: "var(--c-dawn)", clipPath: "inset(0% 0% 0% 0%)" }}
          />
        </div>

        {/* The ground the questions stood on, handed over. */}
        <div
          ref={flat}
          className="pointer-events-none absolute inset-0"
          style={{ background: "var(--c-dawn)" }}
          aria-hidden="true"
        />
      </StickyStage>
    </div>
  );
}
