/**
 * MonthPage
 * The first month, as a folded leaflet: pinned up at the end of the log, then
 * unfolded in the next scene.
 *
 * The log's camera brings the leaflet forward until it sits exactly where the
 * next scene unfolds it, and that scene starts from that frame. Both draw the
 * cover with `MonthCover` and place it with `monthPageRect`, and every size on
 * the leaflet is a share of its own width (cqw), so the same cover drawn at two
 * sizes is the same picture.
 *
 * On a wide frame it is a tri-fold that opens sideways into three panels; on a
 * narrow one it opens downwards. The cover is always the panel that is folded
 * over the middle one, so the folded leaflet sits where the middle panel will.
 */

import type { CSSProperties, ReactNode } from "react";
import { firstMonth } from "@/content/home";

/** Where the leaflet's middle panel sits on a frame of `W` by `H`, and which way it opens. */
export function monthPageRect(W: number, H: number) {
  const panel = Math.min(W * 0.3, H * 0.6);
  if (W / H >= 1.2 && panel >= 380) {
    return { wide: true, cx: W / 2, cy: H * 0.54, w: panel, h: panel * 1.32, ratio: 1.32 };
  }
  const ratio = 1.5;
  const w = Math.min(W * 0.86, 520, (H * 0.84) / ratio);
  return { wide: false, cx: W / 2, cy: H * 0.52, w, h: w * ratio, ratio };
}

/** The leaflet's slight tilt on its pin. */
export const PAGE_TILT = 0.8;

/** A round pin head, for anything pinned to the wall. */
export function Pin({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute block -translate-x-1/2 -translate-y-1/2 rounded-full ${className ?? ""}`}
      style={{
        background: "radial-gradient(circle at 35% 30%, #d8d6d0, #777872 55%, #3a3b38)",
        boxShadow: "0 2px 3px rgb(13 14 12 / 0.6)",
        ...style,
      }}
    />
  );
}

/**
 * The cover, printed like the DevFest poster: one ink, electric blue, on bone.
 * A solid block of blue with the title knocked out of it in paper, a halftone
 * falling away under it, and the leaflet's contents as a row of five tabs,
 * one per week, the way a printed programme lists what is inside. At the
 * open edge, the edges of the panels folded in behind it, which is what makes
 * it read as folded rather than as one sheet.
 */
export function MonthCover({ opens, children }: { opens: "side" | "foot"; children?: ReactNode }) {
  const edges =
    opens === "side"
      ? ["right-[-0.9cqw] inset-y-[0.6cqw] w-[1.2cqw]", "right-[-1.8cqw] inset-y-[1.2cqw] w-[1.2cqw]"]
      : ["bottom-[-0.9cqw] inset-x-[0.6cqw] h-[1.2cqw]", "bottom-[-1.8cqw] inset-x-[1.2cqw] h-[1.2cqw]"];
  const words = firstMonth.title.toUpperCase().split(" ");
  return (
    <div className="relative h-full w-full [container-type:inline-size]">
      {edges.map((e, i) => (
        <span key={e} aria-hidden="true" className={`paper paper--quiet absolute ${e}`} style={{ filter: `brightness(${0.94 - i * 0.05})`, boxShadow: "none" }} />
      ))}
      <div className="paper paper--quiet relative flex h-full w-full flex-col overflow-hidden">
        <div className="riso flex flex-1 flex-col text-[var(--c-blue)]">
          {/* The block, with the title knocked out of it. */}
          <div className="relative bg-current px-[7cqw] pb-[7cqw] pt-[12cqw]">
            {/* Big Shoulders has an optical size axis, so the same title set at
                two sizes would wrap differently. Pinned to one design, it
                scales as a picture does, and the small leaflet on the wall and
                the large one break the title on the same word. */}
            <p
              className="display text-[17.5cqw] leading-[0.82] text-[var(--paper)]"
              style={{ fontOpticalSizing: "none", fontVariationSettings: '"opsz" 72' }}
            >
              <span className="block">{words.slice(0, 2).join(" ")}</span>
              <span className="block">{words.slice(2, 3).join(" ")}</span>
              {/* The last word in outline: printed as the paper showing through a stroke of ink. */}
              <span className="block text-transparent [-webkit-text-stroke:0.45cqw_var(--paper)]">{words.slice(3).join(" ")}</span>
            </p>
          </div>
          {/* The tone falling away under it. */}
          <div aria-hidden="true" className="halftone-ramp h-[16cqw] rotate-180 bg-current" />

          {/* What is inside, one tab a week. */}
          <ol className="mx-[7cqw] mt-auto grid grid-cols-5 border-t-[0.5cqw] border-current">
            {[0, 1, 2, 3, 4].map((w) => (
              <li key={w} className="border-l border-current/40 px-[1.4cqw] pb-[2cqw] pt-[1.6cqw] first:border-l-0 first:pl-0">
                <span className="display block text-[9cqw] leading-[0.8]">{w}</span>
                <span className="meta mt-[1cqw] block text-[2.1cqw] leading-tight">{`Week ${w}`}</span>
              </li>
            ))}
          </ol>
          <div className="mx-[7cqw] mb-[6cqw] mt-[3cqw] flex items-end justify-between gap-[4cqw]">
            <p className="meta max-w-[60%] text-[2.6cqw] leading-snug text-[var(--c-ink)]/70">{firstMonth.line}</p>
            <p className="display text-[4.2cqw] leading-none">DEVSOC</p>
          </div>
        </div>
        {children}
        <Pin className="left-1/2 top-[4.5cqw] h-[4cqw] w-[4cqw]" />
      </div>
    </div>
  );
}
