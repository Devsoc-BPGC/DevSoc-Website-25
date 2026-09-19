/**
 * CrewTitle
 * The coordinators' title, stencilled on the wall of the stage.
 *
 * It is behind the DevFest poster the whole time the poster is up, and it is
 * the first thing the crew scene shows, in the same place, so when the poster
 * comes down the next scene is already there. Both scenes place it with
 * `crewTitleAt`, so they cannot disagree about where it is.
 */

import type { CSSProperties } from "react";
import { crewCopy } from "@/content/home";

/** Where the title's centre sits on the frame: where the poster's centre is. */
export function crewTitleAt() {
  return { x: 0.5, y: 0.55 };
}

export function CrewTitle({ className, style, id }: { className?: string; style?: CSSProperties; id?: string }) {
  return (
    <div className={`text-center ${className ?? ""}`} style={style}>
      <p className="meta text-[0.8rem] text-[var(--c-gray)]">{crewCopy.label}</p>
      {/* On two lines and sized to the poster, so it never shows past the
          poster that covers it. */}
      <h2 id={id} className="display mt-3 text-[clamp(2.6rem,6vw,5.8rem)] leading-[0.82] text-[var(--c-bone)]">
        {crewCopy.title.split(" ").map((w) => (
          <span key={w} className="block">
            {w}{" "}
          </span>
        ))}
      </h2>
    </div>
  );
}
