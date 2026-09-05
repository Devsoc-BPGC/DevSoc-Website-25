"use client";

/**
 * SmoothScroll
 * Lenis smooth scrolling driven by the GSAP ticker, so Lenis and ScrollTrigger
 * share one clock and pinned sections cannot drift.
 *
 * Lenis runs with autoRaf off, which means something has to call lenis.raf on
 * every frame. Lenis swallows the wheel event either way, so if that call is
 * missing the wheel goes dead while the keyboard still scrolls. The driver
 * therefore lives in a child that reads the instance from context: the child
 * only renders once the instance actually exists, where reading a ref from
 * the parent would run a render too early and silently attach nothing.
 *
 * Reduced motion: no Lenis at all, native scrolling takes over.
 */

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useMedia";

const easeOutExpo = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

function ScrollDriver() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    let ticks = 0;
    const update = (time: number) => {
      ticks += 1;
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    lenis.on("scroll", ScrollTrigger.update);

    // Watchdog. Lenis swallows the wheel whether or not anything is driving
    // it, so a driver that fails to attach leaves the page scrollable only by
    // keyboard. If no frame has arrived shortly after mount, run our own loop.
    let fallback = 0;
    const watchdog = setTimeout(() => {
      if (ticks > 0) return;
      const loop = (time: number) => {
        lenis.raf(time);
        fallback = requestAnimationFrame(loop);
      };
      fallback = requestAnimationFrame(loop);
      if (process.env.NODE_ENV !== "production") {
        console.warn("SmoothScroll: GSAP ticker never fired, driving Lenis directly.");
      }
    }, 600);

    // Pins and scrubs measure after fonts and images settle, and again
    // whenever the document changes height (lazy images, rails, filters).
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
      clearTimeout(watchdog);
      if (fallback) cancelAnimationFrame(fallback);
      gsap.ticker.remove(update);
      lenis.off("scroll", ScrollTrigger.update);
      window.removeEventListener("load", refresh);
      ro.disconnect();
      clearTimeout(timer);
    };
  }, [lenis]);

  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();

  if (reduced) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        duration: 1.2,
        easing: easeOutExpo,
        smoothWheel: true,
        syncTouch: false,
        autoRaf: false,
        anchors: true,
      }}
    >
      <ScrollDriver />
      {children}
    </ReactLenis>
  );
}
