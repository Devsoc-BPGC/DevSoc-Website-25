"use client";

/**
 * HorizontalPan
 * A carousel that has no buttons. On a wide screen the section pins and the
 * track travels sideways exactly as far as the page scrolls, so scrolling
 * down moves you along the shelf; a brass hairline reports how far along you
 * are. Narrow screens and reduced motion get the same shelf as a scroll-snap
 * rail you can swipe, so nothing is ever trapped.
 *
 * <HorizontalPan label="Projects">{tiles}</HorizontalPan>
 *
 * The two layouts are chosen in CSS, never in JavaScript, so there is no
 * first-render flash and no pin is ever built on a phone. The pin itself is
 * owned by gsap.matchMedia, which tears its spacer down cleanly on resize.
 */

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const PIN_QUERY = "(min-width: 64rem) and (prefers-reduced-motion: no-preference)";

export function HorizontalPan({
  children,
  label,
  className,
  gap = "clamp(1.5rem, 4vw, 5rem)",
  /** Extra scroll after the track has finished travelling, in viewport heights. */
  tail = 0.35,
  progress = true,
}: {
  children: ReactNode;
  label: string;
  className?: string;
  gap?: string;
  tail?: number;
  progress?: boolean;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(PIN_QUERY, () => {
        const w = wrap.current;
        const t = track.current;
        if (!w || !t) return;
        const distance = () => Math.max(0, t.scrollWidth - window.innerWidth);

        gsap.to(t, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: w,
            start: "top top",
            end: () => `+=${distance() + window.innerHeight * tail}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate(self) {
              if (bar.current) bar.current.style.transform = `scaleX(${0.04 + 0.96 * self.progress})`;
            },
          },
        });
      });
      return () => mm.revert();
    },
    { scope: wrap },
  );

  return (
    <div ref={wrap} className={`relative ${className ?? ""}`}>
      <div className="lg:flex lg:h-[100dvh] lg:flex-col lg:justify-center lg:overflow-hidden lg:motion-reduce:block lg:motion-reduce:h-auto">
        <div
          ref={track}
          role="region"
          aria-label={label}
          className="flex snap-x snap-mandatory items-stretch overflow-x-auto pb-4 [scrollbar-width:none] lg:w-max lg:snap-none lg:overflow-visible lg:pb-0 lg:will-change-transform lg:motion-reduce:w-auto lg:motion-reduce:snap-x lg:motion-reduce:overflow-x-auto [&::-webkit-scrollbar]:hidden"
          style={{ gap }}
        >
          {children}
        </div>
        {progress ? (
          <div className="mt-10 hidden gutter lg:block lg:motion-reduce:hidden" aria-hidden="true">
            <div className="relative h-px w-full bg-soot">
              <div
                ref={bar}
                className="absolute inset-y-0 left-0 w-full origin-left bg-brass"
                style={{ transform: "scaleX(0.04)" }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function PanItem({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`shrink-0 snap-start ${className ?? ""}`}>{children}</div>;
}
