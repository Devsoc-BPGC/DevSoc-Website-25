"use client";

/**
 * Dusk, 18:42
 * The night opens. The facade fills the frame with six windows lit, the
 * wordmark sits over it, and the line hands the reader the six verticals in
 * seven words. The artwork follows the theme: the same wall at night or in
 * the morning.
 */

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import { useFinePointer, useReducedMotion } from "@/lib/useMedia";
import { useTheme } from "@/components/shell/ThemeProvider";
import { SplitLines } from "@/components/motion/SplitLines";
import { WaveDivider } from "@/components/motion/WaveDivider";
import { FitText } from "@/components/ui/FitText";
import { TextLink } from "@/components/ui/TextLink";
import { overturePending } from "@/components/shell/Overture";
import { site } from "@/content/site";

export function Dusk() {
  const root = useRef<HTMLElement>(null);
  const art = useRef<HTMLDivElement>(null);
  const foot = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const variant = theme === "night" ? "night" : "morning";

  // Entrance, held until the overture lifts.
  useGSAP(
    () => {
      if (reduced) return;
      const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
      tl.fromTo(art.current, { opacity: 0, scale: 1.05 }, { opacity: 1, scale: 1, duration: 1.8 }, 0);
      tl.fromTo(foot.current?.children ?? [], { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.09 }, 0.7);

      const start = () => tl.play();
      if (overturePending()) {
        window.addEventListener("devsoc:overture", start, { once: true });
        return () => window.removeEventListener("devsoc:overture", start);
      }
      const t = setTimeout(start, 120);
      return () => clearTimeout(t);
    },
    { scope: root, dependencies: [reduced] },
  );

  // A few pixels of parallax so the wall sits behind the type rather than on it.
  useGSAP(
    () => {
      if (reduced || !fine || !art.current) return;
      const xTo = gsap.quickTo(art.current, "x", { duration: 1.4, ease: "power3.out" });
      const yTo = gsap.quickTo(art.current, "y", { duration: 1.4, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        xTo((e.clientX / window.innerWidth - 0.5) * 16);
        yTo((e.clientY / window.innerHeight - 0.5) * 10);
      };
      window.addEventListener("pointermove", move, { passive: true });
      return () => window.removeEventListener("pointermove", move);
    },
    { scope: root, dependencies: [reduced, fine] },
  );

  return (
    <section id="dusk" ref={root} className="relative min-h-[100dvh] overflow-hidden" aria-labelledby="dusk-line">
      <div ref={art} className="absolute inset-0 will-change-transform">
        <Image
          key={`${variant}-wide`}
          src={`/images/hero/facade-${variant}-wide.jpg`}
          alt={
            variant === "night"
              ? "The face of a campus building at night, a grid of windows with six of them lit"
              : "The face of a campus building in morning light, none of the windows lit"
          }
          fill
          priority
          sizes="100vw"
          className="hidden object-cover md:block"
        />
        <Image
          key={`${variant}-tall`}
          src={`/images/hero/facade-${variant}-tall.jpg`}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover md:hidden"
        />
      </div>

      {/* The ground rises into the type so the wordmark always has contrast. */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, transparent 25%, var(--scrim) 85%)" }}
        aria-hidden="true"
      />

      <div className="absolute inset-x-0 bottom-[10vh] gutter">
        <FitText className="display text-primary" innerClassName="leading-[0.86]">
          Devsoc
        </FitText>

        <div ref={foot} className="grid-12 mt-8 items-end">
          <div className="col-span-12 lg:col-span-7">
            <SplitLines
              as="h1"
              id="dusk-line"
              className="voice max-w-[18ch] text-[clamp(1.6rem,2.8vw,2.75rem)] text-primary"
              immediate
              delay={overturePending() ? 1.9 : 0.9}
            >
              {site.line}
            </SplitLines>
            <div className="mt-6">
              <TextLink href="/#rooms" cursor="Go">
                Walk through the rooms
              </TextLink>
            </div>
          </div>
          <p className="mono col-span-12 mt-8 text-muted lg:col-span-4 lg:col-start-9 lg:mt-0 lg:text-right">
            Developers&rsquo; Society
            <br />
            {site.campus}
          </p>
        </div>
      </div>

      <WaveDivider fill="var(--bg-base)" />
    </section>
  );
}
