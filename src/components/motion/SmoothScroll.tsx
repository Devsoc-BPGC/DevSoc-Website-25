"use client";

/**
 * SmoothScroll
 * Lenis smooth scrolling wired into the GSAP ticker so ScrollTrigger and
 * Lenis share one clock. Renders children directly (root mode), so the page
 * keeps native scroll semantics, anchors and the scrollbar API.
 *
 * Reduced motion: Lenis is not created at all; native scroll takes over.
 *
 * Usage: wrap the page once in the root layout.
 */

import { ReactLenis, type LenisRef } from "lenis/react";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useMedia";

const easeOutExpo = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    if (reduced) return;
    const lenis = lenisRef.current?.lenis;
    if (!lenis) return;

    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    lenis.on("scroll", ScrollTrigger.update);

    // Pins and scrubs measure after fonts and images settle, and again
    // whenever the document changes height (lazy images, carousels).
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);
    let timer: ReturnType<typeof setTimeout> | undefined;
    let lastH = document.body.scrollHeight;
    const ro = new ResizeObserver(() => {
      const h = document.body.scrollHeight;
      if (Math.abs(h - lastH) < 2) return;
      lastH = h;
      clearTimeout(timer);
      timer = setTimeout(refresh, 250);
    });
    ro.observe(document.body);

    return () => {
      gsap.ticker.remove(update);
      lenis.off("scroll", ScrollTrigger.update);
      window.removeEventListener("load", refresh);
      ro.disconnect();
      clearTimeout(timer);
    };
  }, [reduced]);

  if (reduced) return <>{children}</>;

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        duration: 1.2,
        easing: easeOutExpo,
        smoothWheel: true,
        syncTouch: false,
        autoRaf: false,
        anchors: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
