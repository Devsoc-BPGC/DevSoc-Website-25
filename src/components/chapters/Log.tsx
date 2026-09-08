"use client";

/**
 * The Log
 * What the six rooms shipped. The shelf sticks and the projects travel sideways
 * as you keep scrolling down, each one growing and lifting out of its grade as
 * it crosses the middle of the screen. No buttons anywhere.
 *
 * The fest app film used to sit above this. It moved to the projects route,
 * where scrubbing a video is worth the download.
 */

import Image from "next/image";
import { HorizontalPan, PanItem } from "@/components/motion/HorizontalPan";
import { ScrollResolve } from "@/components/motion/ScrollResolve";
import { Reveal } from "@/components/motion/Reveal";
import { TextLink } from "@/components/ui/TextLink";
import { projects } from "@/content/projects";

// Widths alternate so the shelf has rhythm instead of a row of equal cards.
const WIDTHS = ["w-[86vw] lg:w-[54vw]", "w-[78vw] lg:w-[34vw]", "w-[86vw] lg:w-[44vw]"];

export function Log() {
  return (
    <section id="log" aria-labelledby="log-title" className="relative py-[12vh]">
      <Reveal className="gutter">
        <h2 id="log-title" className="display text-[clamp(2.4rem,6vw,6rem)] text-primary">
          The log
        </h2>
        <p className="body-copy mt-6">
          Fest websites the whole campus registers on. Apps that open on every phone during Waves and Quark. Tools that
          fix a Tuesday.
        </p>
      </Reveal>

      <HorizontalPan label="Projects" className="mt-[14vh]">
        <div className="w-[var(--gutter)] shrink-0" aria-hidden="true" />
        {projects.map((p, i) => (
          <PanItem key={p.id} grow className={WIDTHS[i % WIDTHS.length]}>
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
              <p className="meta shrink-0 text-muted">
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
