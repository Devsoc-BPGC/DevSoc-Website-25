"use client";

/**
 * The Ledger: what we shipped
 * Two scroll-driven movements and no buttons. First the fest app film runs
 * under the scrollbar inside a framed window. Then the shelf: the section
 * pins and the projects travel sideways as you keep scrolling down, each one
 * lifting out of its grade as it crosses the middle of the screen.
 */

import { useRef } from "react";
import Image from "next/image";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useMedia";
import { HorizontalPan, PanItem } from "@/components/motion/HorizontalPan";
import { ScrollResolve } from "@/components/motion/ScrollResolve";
import { Reveal } from "@/components/motion/Reveal";
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
          <div className="resolve relative aspect-video" style={{ ["--resolve" as string]: 0.35 }}>
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
          <span className="pointer-events-none absolute -left-3 -top-3 h-4 w-4 border-l border-t border-rule/70" />
          <span className="pointer-events-none absolute -right-3 -top-3 h-4 w-4 border-r border-t border-rule/70" />
          <span className="pointer-events-none absolute -bottom-3 -left-3 h-4 w-4 border-b border-l border-rule/70" />
          <span className="pointer-events-none absolute -bottom-3 -right-3 h-4 w-4 border-b border-r border-rule/70" />
          <div className="mono mt-5 flex justify-between text-muted">
            <span>
              <span className="text-primary">Fest app</span>. Waves and Quark, 2025
            </span>
            <span ref={code} className="hud text-light">
              00:00:00:00
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Widths alternate so the shelf has rhythm instead of a row of equal cards.
const WIDTHS = ["w-[86vw] lg:w-[54vw]", "w-[78vw] lg:w-[34vw]", "w-[86vw] lg:w-[44vw]"];

export function Work() {
  return (
    <section id="log" aria-labelledby="log-title" className="relative py-[12vh]">
      <Reveal className="gutter">
        <h2 id="log-title" className="display text-[clamp(2.4rem,6vw,6rem)] text-primary">
          The ledger
        </h2>
        <p className="body-copy mt-6">
          Fest websites the whole campus registers on. Apps that open on every phone during Waves and Quark. Tools that
          fix a Tuesday.
        </p>
      </Reveal>

      <ScrubFilm />

      <HorizontalPan label="Projects" className="mt-[14vh]">
        <div className="w-[var(--gutter)] shrink-0" aria-hidden="true" />
        {projects.map((p, i) => (
          <PanItem key={p.id} className={WIDTHS[i % WIDTHS.length]}>
            <ScrollResolve to={0.72} className="aspect-[16/10] w-full">
              <Image
                src={p.image}
                alt={p.title}
                width={p.width}
                height={p.height}
                sizes="(min-width: 1024px) 54vw, 86vw"
                className="h-full w-full object-cover"
              />
            </ScrollResolve>
            <div className="mt-5 flex items-baseline justify-between gap-6">
              <h3 className="display text-[clamp(1.4rem,2.4vw,2.4rem)] text-primary [font-variation-settings:'wdth'_110]">
                {p.title}
              </h3>
              <p className="mono shrink-0 text-muted">
                {p.year}. {p.vertical}
              </p>
            </div>
            <p className="body-copy mt-2 max-w-[46ch] text-[0.95rem]">{p.blurb}</p>
          </PanItem>
        ))}
        <div className="w-[var(--gutter)] shrink-0" aria-hidden="true" />
      </HorizontalPan>

      <div className="gutter mt-12">
        <TextLink href="/projects" cursor="Go">
          Open the full log
        </TextLink>
      </div>
    </section>
  );
}
