"use client";

/**
 * Carousel
 * A free-drag horizontal rail (Embla) with trackpad wheel support, a brass
 * progress hairline and two plain text buttons. Slides are plain children
 * wrapped in <CarouselSlide>.
 *
 * <Carousel label="Projects">
 *   <CarouselSlide className="w-[60vw]">...</CarouselSlide>
 * </Carousel>
 */

import { useEffect, useRef, type ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";

export function CarouselSlide({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`min-w-0 flex-none ${className ?? ""}`}>{children}</div>;
}

export function Carousel({
  children,
  label,
  className,
  gap = "clamp(1rem, 2.5vw, 2.5rem)",
}: {
  children: ReactNode;
  label: string;
  className?: string;
  gap?: string;
}) {
  const [viewportRef, api] = useEmblaCarousel(
    { align: "start", dragFree: true, containScroll: "trimSnaps", skipSnaps: true },
    [WheelGesturesPlugin()],
  );
  const progress = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!api) return;
    const onScroll = () => {
      const p = Math.max(0, Math.min(1, api.scrollProgress()));
      if (progress.current) progress.current.style.transform = `scaleX(${0.08 + 0.92 * p})`;
    };
    api.on("scroll", onScroll);
    api.on("reInit", onScroll);
    onScroll();
    return () => {
      api.off("scroll", onScroll);
      api.off("reInit", onScroll);
    };
  }, [api]);

  return (
    <div className={className}>
      <div
        ref={viewportRef}
        className="overflow-hidden"
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        data-cursor="Drag"
      >
        <div className="flex touch-pan-y" style={{ gap }}>
          {children}
        </div>
      </div>
      <div className="mt-10 flex items-center gap-10 gutter">
        <div className="relative h-px flex-1 bg-raised">
          <div
            ref={progress}
            className="absolute inset-y-0 left-0 w-full origin-left bg-rule"
            style={{ transform: "scaleX(0.08)" }}
          />
        </div>
        <div className="meta flex gap-8 text-muted">
          <button type="button" onClick={() => api?.scrollPrev()} className="text-link hover:text-primary">
            Prev
          </button>
          <button type="button" onClick={() => api?.scrollNext()} className="text-link hover:text-primary">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
