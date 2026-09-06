"use client";

/**
 * Ambient
 * One soft field of light behind a chapter, placed where that chapter wants
 * it. Breathes on a twelve second period, slow enough to read as a room
 * rather than as an animation.
 *
 *   <Ambient x={72} y={30} intensity={0.4} />
 *
 * Purely presentational. Static under reduced motion.
 */

export function Ambient({
  x = 60,
  y = 40,
  intensity = 0.5,
  className,
}: {
  x?: number;
  y?: number;
  intensity?: number;
  className?: string;
}) {
  return (
    <div
      className={`ambient-field ${className ?? ""}`}
      style={
        {
          "--ax": `${x}%`,
          "--ay": `${y}%`,
          "--ai": intensity,
        } as React.CSSProperties
      }
      aria-hidden="true"
    />
  );
}
