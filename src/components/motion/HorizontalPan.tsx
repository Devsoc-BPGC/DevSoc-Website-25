"use client";

/**
 * HorizontalPan
 * A carousel that has no buttons. On a wide screen the stage sticks and the
 * track travels sideways exactly as far as the page scrolls, so scrolling
 * down moves you along the shelf; a brass hairline reports how far along you
 * are. Narrow screens and reduced motion get the same shelf as a scroll-snap
 * rail you can swipe, so nothing is ever trapped.
 *
 * <HorizontalPan label="Projects">{tiles}</HorizontalPan>
 *
 * The two layouts are chosen in CSS, never in JavaScript, so there is no
 * first-render flash and nothing is ever built on a phone.
 *
 * There is no GSAP pin here. The stage is `position: sticky` over a track whose
 * height is measured and written in JavaScript, which is how every other
 * scroll-driven section on this site works. The tween handed down through
 * context is unchanged either way: containerAnimation needs an `ease: none`
 * tween inside an overflow-hidden ancestor, not a pin.
 */

import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { EASE, SCRUB } from "@/lib/easings";

const PIN_QUERY = "(min-width: 64rem) and (prefers-reduced-motion: no-preference)";

/**
 * The sideways tween, handed down so an item can measure itself against the
 * travel instead of reading its own rectangle every frame. It is null on the
 * swipe layout, which is what tells an item to stay at its plain size.
 */
const PanTween = createContext<gsap.core.Tween | null>(null);

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
  const [pan, setPan] = useState<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(PIN_QUERY, () => {
        const w = wrap.current;
        const t = track.current;
        if (!w || !t) return;
        const distance = () => Math.max(0, t.scrollWidth - window.innerWidth);

        /**
         * The spacer. A pin would have created this for us; a sticky stage
         * needs it authored, because the height is what encodes how far the
         * page must scroll for the track to finish travelling.
         *
         * It has to be set in onRefreshInit rather than onRefresh: containerAnimation
         * resolves each item's position from this tween's start and end, so if
         * the first refresh measures a stale spacer, every tile lands in the
         * wrong place and only a resize fixes it.
         */
        const measure = () => {
          w.style.height = `${Math.round(window.innerHeight + distance() + window.innerHeight * tail)}px`;
        };
        measure();

        const travel = gsap.to(t, {
          x: () => -distance(),
          ease: EASE.none,
          scrollTrigger: {
            trigger: w,
            start: "top top",
            end: "bottom bottom",
            scrub: SCRUB.tight,
            invalidateOnRefresh: true,
            onRefreshInit: measure,
            onUpdate(self) {
              if (bar.current) bar.current.style.transform = `scaleX(${0.04 + 0.96 * self.progress})`;
            },
            // Promote only while the shelf is actually moving.
            onToggle(self) {
              t.style.willChange = self.isActive ? "transform" : "";
            },
          },
        });

        setPan(travel);
        return () => {
          setPan(null);
          w.style.height = "";
          t.style.willChange = "";
        };
      });
      return () => mm.revert();
    },
    { scope: wrap },
  );

  return (
    <PanTween.Provider value={pan}>
    <div ref={wrap} className={`relative ${className ?? ""}`}>
      <div className="lg:sticky lg:top-0 lg:flex lg:h-[100dvh] lg:flex-col lg:justify-center lg:overflow-hidden lg:motion-reduce:static lg:motion-reduce:block lg:motion-reduce:h-auto">
        <div
          ref={track}
          role="region"
          aria-label={label}
          className="flex snap-x snap-mandatory items-stretch overflow-x-auto pb-4 [scrollbar-width:none] lg:w-max lg:snap-none lg:overflow-visible lg:pb-0 lg:motion-reduce:w-auto lg:motion-reduce:snap-x lg:motion-reduce:overflow-x-auto [&::-webkit-scrollbar]:hidden"
          style={{ gap }}
        >
          {children}
        </div>
        {progress ? (
          <div className="mt-10 hidden gutter lg:block lg:motion-reduce:hidden" aria-hidden="true">
            <div className="relative h-px w-full bg-raised">
              <div
                ref={bar}
                className="absolute inset-y-0 left-0 w-full origin-left bg-rule"
                style={{ transform: "scaleX(0.04)" }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
    </PanTween.Provider>
  );
}

/**
 * One tile on the shelf. With `grow` it is slightly smaller at the edges of
 * the screen and reaches full size as it passes the middle, so the shelf has
 * a focus rather than a row of equal cards. On the swipe layout there is no
 * pan tween, so the tile simply stays at full size.
 */
export function PanItem({
  children,
  className,
  grow = false,
}: {
  children: ReactNode;
  className?: string;
  grow?: boolean;
}) {
  const el = useRef<HTMLDivElement>(null);
  const pan = useContext(PanTween);

  useGSAP(
    () => {
      if (!grow || !pan || !el.current) return;
      const node = el.current;
      const st = ScrollTrigger.create({
        trigger: node,
        containerAnimation: pan,
        start: "left right",
        end: "right left",
        onUpdate(self) {
          // Peaks when the tile is level with the middle of the screen.
          node.style.scale = String(0.93 + 0.07 * Math.sin(self.progress * Math.PI));
        },
        // Promoted only while it is crossing, not for the life of the page.
        onToggle(self) {
          node.style.willChange = self.isActive ? "transform" : "";
        },
      });
      return () => {
        st.kill();
        node.style.scale = "";
        node.style.willChange = "";
      };
    },
    { dependencies: [grow, pan] },
  );

  return (
    <div ref={el} className={`shrink-0 snap-start ${className ?? ""}`}>
      {children}
    </div>
  );
}
