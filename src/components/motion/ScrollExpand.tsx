"use client";

/**
 * ScrollExpand
 * A framed piece of media that grows from a small window to full bleed as
 * you scroll, then holds. Port of the folio ScrollExpand (React Bits
 * lineage): a tall track sizes the scroll span, a sticky stage holds the
 * frame, and smoothed progress drives a clip-path inset.
 *
 * <ScrollExpand media={<img .../>} expanded={<p>shown at full bleed</p>}>
 *   <h2>title that fades as the frame opens</h2>
 * </ScrollExpand>
 *
 * Reduced motion: full-bleed media with the expanded content on top.
 */

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useMedia";

type Props = {
  media: ReactNode;
  children?: ReactNode;
  expanded?: ReactNode;
  startWidth?: number;
  startHeight?: number;
  startWidthMobile?: number;
  startHeightMobile?: number;
  /** Viewport heights of scroll spent expanding, then holding. */
  scrollDistance?: number;
  holdDistance?: number;
  radius?: number;
  zoom?: number;
  scrim?: number;
  className?: string;
  id?: string;
};

export function ScrollExpand({
  media,
  children,
  expanded,
  startWidth = 46,
  startHeight = 62,
  startWidthMobile = 78,
  startHeightMobile = 50,
  scrollDistance = 1.1,
  holdDistance = 0.5,
  radius = 24,
  zoom = 1.3,
  scrim = 0.5,
  className,
  id,
}: Props) {
  const track = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const expandedRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const t = track.current;
      const f = frame.current;
      const m = mediaRef.current;
      if (!t || !f || !m || reduced) return;

      const clamp = gsap.utils.clamp(0, 1);
      const smooth = (x: number) => {
        const k = clamp(x);
        return k * k * (3 - 2 * k);
      };

      let current = -1;
      let target = 0;

      const apply = (p: number) => {
        const e = smooth(p);
        const mobile = window.innerWidth < 700;
        const sw = mobile ? startWidthMobile : startWidth;
        const sh = mobile ? startHeightMobile : startHeight;
        const w = sw + (100 - sw) * e;
        const h = sh + (100 - sh) * e;
        const ix = Math.max(0, (100 - w) / 2);
        const iy = Math.max(0, (100 - h) / 2);
        const r = radius * (1 - e);
        f.style.clipPath = `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${r}px)`;
        m.style.transform = `scale(${zoom + (1 - zoom) * e})`;
        if (scrimRef.current) scrimRef.current.style.opacity = String(scrim * e);
        if (titleRef.current) {
          const out = smooth((p - 0.4) / 0.45);
          titleRef.current.style.opacity = String(1 - out);
          titleRef.current.style.transform = `translate3d(0, ${-28 * out}px, 0) scale(${1 + 0.05 * out})`;
        }
        if (expandedRef.current) {
          const inn = smooth((p - 0.72) / 0.28);
          expandedRef.current.style.opacity = String(inn);
          expandedRef.current.style.transform = `translate3d(0, ${20 * (1 - inn)}px, 0)`;
        }
      };

      const measure = () => {
        t.style.height = `${Math.round(window.innerHeight * (1 + scrollDistance + holdDistance))}px`;
      };
      measure();
      apply(0);

      const share = scrollDistance / (scrollDistance + holdDistance);
      const st = ScrollTrigger.create({
        trigger: t,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onRefresh: measure,
        onUpdate(self) {
          target = clamp(self.progress / share);
        },
      });

      // A touch of smoothing on top of Lenis keeps the clip edge from stepping.
      const k = 1 - Math.exp(-1 / (60 * 0.06));
      const tick = () => {
        const next = current < 0 ? target : current + (target - current) * k;
        if (current >= 0 && Math.abs(next - current) < 0.0004) return;
        current = Math.abs(target - next) < 0.0004 ? target : next;
        apply(current);
      };
      gsap.ticker.add(tick);

      return () => {
        gsap.ticker.remove(tick);
        st.kill();
      };
    },
    { scope: track, dependencies: [reduced] },
  );

  return (
    <div ref={track} id={id} className={`relative ${className ?? ""}`}>
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        <div ref={frame} className="absolute inset-0 will-change-[clip-path]">
          <div ref={mediaRef} className="absolute inset-0 origin-center will-change-transform [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>video]:h-full [&>video]:w-full [&>video]:object-cover">
            {media}
          </div>
          <div ref={scrimRef} className="absolute inset-0 bg-base opacity-0" />
        </div>
        {children && !reduced ? (
          <div ref={titleRef} className="pointer-events-none absolute inset-0 grid place-items-center">
            {children}
          </div>
        ) : null}
        {expanded ? (
          <div
            ref={expandedRef}
            className="absolute inset-0"
            style={reduced ? undefined : { opacity: 0 }}
          >
            {expanded}
          </div>
        ) : null}
      </div>
    </div>
  );
}
