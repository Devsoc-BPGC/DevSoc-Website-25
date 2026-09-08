"use client";

/**
 * Dusk
 * The night opens. The facade fills the frame with six windows lit, the
 * wordmark sits over it, and the line hands the reader the six verticals in
 * seven words.
 */

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import { useFinePointer, useReducedMotion } from "@/lib/useMedia";
import { RevealWords } from "@/components/motion/text";
import { WaveDivider } from "@/components/motion/WaveDivider";
import { FitText } from "@/components/ui/FitText";
import { TextLink } from "@/components/ui/TextLink";
import { overturePending } from "@/components/shell/Overture";
import { site } from "@/content/site";

export function Dusk() {
  const root = useRef<HTMLElement>(null);
  const art = useRef<HTMLDivElement>(null);
  const foot = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const fine = useFinePointer();

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
          src="/images/hero/facade-night-wide.jpg"
          alt="The face of a campus building at night, a grid of windows with six of them lit"
          fill
          priority
          sizes="100vw"
          className="hidden object-cover md:block"
        />
        <Image
          src="/images/hero/facade-night-tall.jpg"
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

      <div className="absolute inset-x-0 bottom-[max(10vh,7vw)] z-10 gutter">
        <FitText className="display text-primary" innerClassName="leading-[0.86]">
          Devsoc
        </FitText>

        <div ref={foot} className="grid-12 mt-8 items-end">
          <div className="col-span-12 lg:col-span-7">
            <RevealWords
              as="h1"
              id="dusk-line"
              className="voice max-w-[18ch] text-[clamp(1.6rem,2.8vw,2.75rem)] text-primary"
              immediate
              delay={overturePending() ? 1.9 : 0.9}
            >
              {site.line}
            </RevealWords>
            <div className="mt-6">
              <TextLink href="/#rooms" cursor="Go">
                Walk through the rooms
              </TextLink>
            </div>
          </div>
          <p className="meta col-span-12 mt-8 text-muted lg:col-span-4 lg:col-start-9 lg:mt-0 lg:text-right">
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
