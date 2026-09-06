"use client";

/**
 * WaveDivider
 * The transition between two grounds. Instead of a straight edge or a rule,
 * the next section's colour rises into this one on a soft organic curve, so
 * the page reads as continuous terrain rather than as stacked boxes.
 *
 * Place it as the last child of a section, with `fill` set to the colour of
 * the section that follows.
 *
 *   <section className="bg-base">
 *     ...
 *     <WaveDivider fill="var(--surface-raised)" />
 *   </section>
 *
 * `flip` mirrors the curve so consecutive dividers never repeat the same
 * silhouette. Purely presentational and never interactive.
 */

type Props = {
  /** Colour of the section below. Usually a role token. */
  fill?: string;
  /** Height of the curve in viewport width, so it scales with the page. */
  height?: number;
  flip?: boolean;
  className?: string;
};

const CREST = "M0,64 C160,120 340,8 520,44 C700,80 860,140 1040,108 C1200,80 1320,20 1440,40 L1440,160 L0,160 Z";
const TROUGH = "M0,40 C180,8 320,92 520,104 C720,116 880,36 1060,20 C1220,6 1340,52 1440,72 L1440,160 L0,160 Z";

export function WaveDivider({ fill = "var(--surface-raised)", height = 9, flip = false, className }: Props) {
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 bottom-0 w-full ${className ?? ""}`}
      style={{ height: `${height}vw`, minHeight: "56px" }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        className="block h-full w-full"
        style={flip ? { transform: "scaleX(-1)" } : undefined}
      >
        <path d={flip ? TROUGH : CREST} fill={fill} />
      </svg>
    </div>
  );
}
