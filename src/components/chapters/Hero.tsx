"use client";

/**
 * Hero: the mark
 * DEVSOC spans the viewport in expanded display type. The armillary sphere,
 * keyed out of its studio black, hovers in front of the letters. Behind both,
 * the DevSoc mark gathers out of dots. The pointer shifts sphere and letters
 * against each other; scrolling parts DEV and SOC like curtains as the sphere
 * grows and the manifesto rises through the gap.
 */

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useFinePointer, useIsMobile, useReducedMotion } from "@/lib/useMedia";
import { FitText } from "@/components/ui/FitText";
import { TextLink } from "@/components/ui/TextLink";
import { SplitLines } from "@/components/motion/SplitLines";
import { PointField } from "@/components/motion/PointField";
import { overturePending } from "@/components/shell/Overture";
import { site } from "@/content/site";

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const mark = useRef<HTMLDivElement>(null);
  const dev = useRef<HTMLSpanElement>(null);
  const soc = useRef<HTMLSpanElement>(null);
  const sphere = useRef<HTMLDivElement>(null);
  const foot = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const mobile = useIsMobile();

  // Entrance, after the overture (or immediately when there is none).
  useGSAP(
    () => {
      if (reduced) return;
      const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
      tl.fromTo(mark.current, { yPercent: 100 }, { yPercent: 0, duration: 1.5 }, 0);
      tl.fromTo(
        sphere.current,
        { opacity: 0, scale: 1.08, filter: "blur(14px)" },
        { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.8 },
        0.15,
      );
      tl.fromTo(foot.current?.children ?? [], { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.08 }, 0.9);

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

  // Idle breath and pointer parallax.
  useEffect(() => {
    if (reduced || !sphere.current) return;
    const breath = gsap.to(sphere.current.firstElementChild, {
      scale: 1.012,
      y: -6,
      duration: 8,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });
    if (!fine) return () => breath.kill();
    const sx = gsap.quickTo(sphere.current, "x", { duration: 1.2, ease: "power3.out" });
    const sy = gsap.quickTo(sphere.current, "y", { duration: 1.2, ease: "power3.out" });
    const mx = gsap.quickTo(mark.current, "x", { duration: 1.4, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      sx(nx * 24);
      sy(ny * 16);
      mx(-nx * 10);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      breath.kill();
      window.removeEventListener("pointermove", move);
    };
  }, [reduced, fine]);

  // Scroll out: the curtain.
  useGSAP(
    () => {
      if (reduced || mobile) return;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 1.2 },
        defaults: { ease: "none" },
      });
      tl.to(dev.current, { xPercent: -28 }, 0);
      tl.to(soc.current, { xPercent: 28 }, 0);
      tl.to(mark.current, { opacity: 0.15 }, 0);
      tl.to(sphere.current, { scale: 1.22, yPercent: 6, opacity: 0.35 }, 0);
      tl.to(foot.current, { y: -60, opacity: 0 }, 0);
      return () => ScrollTrigger.getAll().forEach((s) => s.trigger === root.current && s.kill());
    },
    { scope: root, dependencies: [reduced, mobile] },
  );

  return (
    <section ref={root} className="relative min-h-[100dvh] overflow-hidden" aria-labelledby="hero-line">
      {/* the mark, gathered out of dots, behind the sphere */}
      {!mobile ? (
        <PointField
          image="/images/brand/mark.png"
          className="pointer-events-none absolute inset-y-0 left-[18%] right-0"
          opacity={0.28}
          scale={0.7}
          count={7000}
        />
      ) : null}

      {/* wordmark */}
      <div className="absolute inset-x-0 top-[26vh] overflow-hidden px-[var(--gutter)] lg:top-[24vh]">
        <FitText className="display text-bone" innerClassName="leading-[0.86]">
          <span ref={mark} className="inline-block">
            <span ref={dev} className="inline-block">
              Dev
            </span>
            <span ref={soc} className="inline-block">
              soc
            </span>
          </span>
        </FitText>
      </div>

      {/* the instrument */}
      <div
        ref={sphere}
        className="pointer-events-none absolute left-1/2 top-[8vh] h-[86vh] w-[min(92vw,140vh)] -translate-x-[42%] will-change-transform lg:left-[52%] lg:top-[6vh] lg:h-[92vh] lg:w-[min(80vw,150vh)] lg:-translate-x-[46%]"
      >
        <div className="relative h-full w-full">
          <Image
            src="/images/hero/armillary-wide-cut.webp"
            alt="A brass armillary sphere hovering above an obsidian floor, lit in patina teal"
            fill
            priority
            sizes="(min-width: 1024px) 80vw, 92vw"
            className="hidden object-contain object-center md:block"
          />
          <Image
            src="/images/hero/armillary-tall-cut.webp"
            alt=""
            fill
            priority
            sizes="92vw"
            className="object-contain object-center md:hidden"
          />
        </div>
      </div>

      {/* foot: voice line, one link, one metadata block */}
      <div ref={foot} className="absolute inset-x-0 bottom-[7vh] grid-12 items-end gutter">
        <div className="col-span-12 lg:col-span-6">
          <SplitLines
            as="h1"
            id="hero-line"
            className="voice max-w-[22ch] text-[clamp(1.75rem,3vw,3rem)] text-bone"
            immediate
            delay={overturePending() ? 1.9 : 0.8}
          >
            {site.line}
          </SplitLines>
          <div className="mt-6">
            <TextLink href="/#collection" cursor="Go">
              Open the collection
            </TextLink>
          </div>
        </div>
        <p className="mono col-span-12 mt-8 text-ash lg:col-span-4 lg:col-start-9 lg:mt-0 lg:text-right">
          Developers&rsquo; Society
          <br />
          {site.campus}
        </p>
      </div>
    </section>
  );
}
