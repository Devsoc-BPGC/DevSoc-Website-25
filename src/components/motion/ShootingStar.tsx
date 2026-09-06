"use client";

/**
 * ShootingStar
 * A rare piece of life in the night sky. A small head with a tapering trail
 * crosses a short diagonal, then waits a long time before doing it again.
 * The long wait is the point: seen once it is a delight, seen constantly it
 * is decoration.
 *
 *   <ShootingStar count={2} />   // inside a relatively positioned sky
 *
 * Reduced motion: nothing renders at all.
 */

import { useReducedMotion } from "@/lib/useMedia";

type Star = { top: string; left: string; delay: number; duration: number; length: number; angle: number };

/** Hand placed so the two never cross the same patch of sky. */
const STARS: Star[] = [
  { top: "18%", left: "8%", delay: 3, duration: 15, length: 150, angle: 24 },
  { top: "9%", left: "52%", delay: 11, duration: 19, length: 110, angle: 18 },
  { top: "31%", left: "68%", delay: 7, duration: 23, length: 130, angle: 30 },
];

export function ShootingStar({ count = 2, className }: { count?: number; className?: string }) {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`} aria-hidden="true">
      {STARS.slice(0, Math.max(0, Math.min(count, STARS.length))).map((s, i) => (
        <span
          key={i}
          className="shooting-star"
          style={{
            top: s.top,
            left: s.left,
            width: `${s.length}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            transform: `rotate(${s.angle}deg)`,
          }}
        />
      ))}
    </div>
  );
}
