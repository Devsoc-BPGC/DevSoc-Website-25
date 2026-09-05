"use client";

/**
 * MaskReveal
 * Two layers. The base sits in verdigris duotone; the reveal layer (full
 * colour, or anything else) shows through a soft-edged window that follows
 * the pointer with a slight lag and breathes a little, so it reads as a
 * lens moving over the image rather than a hard spotlight.
 *
 * <MaskReveal base={<img src=... />} reveal={<img src=... />} radius={170} />
 *
 * Touch: tapping toggles the whole image to colour. Reduced motion: colour.
 */

import { useState, type PointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useMotionTemplate, useTransform, useAnimationFrame, animate } from "motion/react";
import { useFinePointer, useReducedMotion } from "@/lib/useMedia";
import { EASE_OUT_ARR } from "@/lib/easings";

type Props = {
  base: ReactNode;
  reveal: ReactNode;
  radius?: number;
  className?: string;
  cursorLabel?: string;
};

export function MaskReveal({ base, reveal, radius = 170, className, cursorLabel }: Props) {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const interactive = fine && !reduced;
  const [tapped, setTapped] = useState(false);

  const x = useMotionValue(-2000);
  const y = useMotionValue(-2000);
  const r = useMotionValue(0);
  const wobble = useMotionValue(0);

  useAnimationFrame((t) => {
    if (!interactive) return;
    wobble.set(Math.sin(t / 900) * 0.05 + Math.sin(t / 530) * 0.03);
  });

  const rx = useTransform([r, wobble], ([rv, w]) => (rv as number) * (1 + (w as number)));
  const ry = useTransform([r, wobble], ([rv, w]) => (rv as number) * (1.12 - (w as number)));
  const mask = useMotionTemplate`radial-gradient(${rx}px ${ry}px at ${x}px ${y}px, #000 50%, transparent 100%)`;

  const move = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    animate(x, e.clientX - rect.left, { duration: 0.35, ease: EASE_OUT_ARR });
    animate(y, e.clientY - rect.top, { duration: 0.35, ease: EASE_OUT_ARR });
  };
  const enter = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.jump(e.clientX - rect.left);
    y.jump(e.clientY - rect.top);
    animate(r, radius, { duration: 0.7, ease: EASE_OUT_ARR });
  };
  const leave = () => {
    animate(r, 0, { duration: 0.5, ease: EASE_OUT_ARR });
  };

  if (!interactive) {
    return (
      <div
        className={`duotone ${tapped || reduced ? "is-color" : ""} ${className ?? ""}`}
        onClick={() => setTapped((v) => !v)}
      >
        {base}
      </div>
    );
  }

  return (
    <div
      className={`relative ${className ?? ""}`}
      onPointerMove={move}
      onPointerEnter={enter}
      onPointerLeave={leave}
      data-cursor={cursorLabel}
    >
      <div className="duotone absolute inset-0 [&>img]:h-full [&>img]:w-full [&>img]:object-cover">{base}</div>
      <motion.div
        className="absolute inset-0 [&>img]:h-full [&>img]:w-full [&>img]:object-cover"
        style={{ WebkitMaskImage: mask, maskImage: mask }}
        aria-hidden="true"
      >
        {reveal}
      </motion.div>
    </div>
  );
}
