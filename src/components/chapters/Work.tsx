"use client";

/**
 * The Ledger: what we shipped
 * The fest app film runs under the scroll inside a framed window, graded to
 * the room. Then a free-drag rail of projects, each resting in duotone and
 * resolving to colour under the pointer's lens.
 */

import { useRef } from "react";
import Image from "next/image";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useMedia";
import { Carousel, CarouselSlide } from "@/components/motion/Carousel";
import { MaskReveal } from "@/components/motion/MaskReveal";
import { TextLink } from "@/components/ui/TextLink";
import { projects } from "@/content/projects";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function ScrubFilm() {
  const track = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const code = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const v = video.current;
      const t = track.current;
      if (!v || !t) return;
      if (reduced) {
        v.play().catch(() => {});
        return;
      }
      v.pause();
      const st = ScrollTrigger.create({
        trigger: t,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
        onUpdate(self) {
          const d = v.duration || 21;
          const time = self.progress * d;
          if (Math.abs(v.currentTime - time) > 0.03) v.currentTime = time;
          if (code.current) {
            const s = Math.floor(time);
            const f = Math.floor((time - s) * 24);
            code.current.textContent = `00:00:${pad(s)}:${pad(f)}`;
          }
        },
      });
      return () => st.kill();
    },
    { scope: track, dependencies: [reduced] },
  );

  return (
    <div ref={track} className="relative h-[220vh]">
      <div className="sticky top-0 flex h-[100dvh] items-center gutter">
        <div className="relative mx-auto w-full max-w-[min(88vw,150vh)]">
          <div className="duotone relative aspect-video overflow-hidden">
            <video
              ref={video}
              src="/video/csa-times.mp4"
              muted
              playsInline
              preload="auto"
              loop={reduced}
              className="h-full w-full object-cover"
            />
          </div>
          {/* frame chrome on the film */}
          <span className="pointer-events-none absolute -left-3 -top-3 h-4 w-4 border-l border-t border-brass/70" />
          <span className="pointer-events-none absolute -right-3 -top-3 h-4 w-4 border-r border-t border-brass/70" />
          <span className="pointer-events-none absolute -bottom-3 -left-3 h-4 w-4 border-b border-l border-brass/70" />
          <span className="pointer-events-none absolute -bottom-3 -right-3 h-4 w-4 border-b border-r border-brass/70" />
          <div className="mono mt-5 flex justify-between text-ash">
            <span>
              <span className="text-bone">Fest app</span>. Waves and Quark, 2025
            </span>
            <span ref={code} className="hud text-verdigris">
              00:00:00:00
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Work() {
  return (
    <section id="ledger" aria-labelledby="ledger-title" className="relative py-[12vh]">
      <div className="gutter">
        <h2 id="ledger-title" className="display text-[clamp(2.4rem,6vw,6rem)] text-bone">
          The ledger
        </h2>
        <p className="body-copy mt-6">
          Fest websites the whole campus registers on. Apps that open on every phone during Waves and Quark. Tools that
          fix a Tuesday.
        </p>
      </div>

      <ScrubFilm />

      <Carousel label="Projects" className="mt-[6vh]">
        <div className="w-[var(--gutter)] flex-none" aria-hidden="true" />
        {projects.map((p) => (
          <CarouselSlide key={p.id} className="w-[84vw] md:w-[46vw]">
            <MaskReveal
              className="aspect-[16/10]"
              radius={200}
              cursorLabel="Look"
              base={<Image src={p.image} alt={p.title} width={p.width} height={p.height} sizes="(min-width: 768px) 46vw, 84vw" />}
              reveal={<Image src={p.image} alt="" width={p.width} height={p.height} sizes="(min-width: 768px) 46vw, 84vw" />}
            />
            <div className="mt-5 flex items-baseline justify-between gap-6">
              <h3 className="display text-[clamp(1.4rem,2.2vw,2.2rem)] text-bone [font-variation-settings:'wdth'_110]">{p.title}</h3>
              <p className="mono shrink-0 text-ash">
                {p.year}. {p.vertical}
              </p>
            </div>
            <p className="body-copy mt-2 text-[0.95rem]">{p.blurb}</p>
          </CarouselSlide>
        ))}
        <div className="w-[var(--gutter)] flex-none" aria-hidden="true" />
      </Carousel>

      <div className="gutter mt-12">
        <TextLink href="/projects" cursor="Go">
          Open the full log
        </TextLink>
      </div>
    </section>
  );
}
