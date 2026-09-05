"use client";

/**
 * The Salon: DevFest
 * Full bleed. The brass sunburst photograph fills the screen and turns a few
 * degrees as you scroll. DEVFEST in display, the edition in the serif voice,
 * a mono row of facts. Below, the recurring events as a plain table.
 */

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useMedia";
import { SplitLines } from "@/components/motion/SplitLines";
import { devfest, events } from "@/content/events";

export function DevFest() {
  const root = useRef<HTMLElement>(null);
  const art = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !art.current) return;
      gsap.fromTo(
        art.current,
        { rotate: -2.5, scale: 1.12 },
        {
          rotate: 2.5,
          scale: 1.0,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 1.4 },
        },
      );
    },
    { scope: root, dependencies: [reduced] },
  );

  const facts = [devfest.venue, devfest.when, devfest.sponsor ? `With ${devfest.sponsor}` : null, "Hackathons, talks, prizes"].filter(
    Boolean,
  ) as string[];

  return (
    <section id="salon" ref={root} aria-labelledby="salon-title" className="relative">
      <div className="relative min-h-[100dvh] overflow-hidden">
        <div ref={art} className="absolute inset-0 will-change-transform">
          <Image
            src="/images/devfest/sunburst-wide.jpg"
            alt="An Art Deco sunburst of brass rays around a chrome sphere"
            fill
            sizes="100vw"
            className="hidden object-cover md:block"
          />
          <Image
            src="/images/devfest/sunburst-tall.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover md:hidden"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/40 via-transparent to-obsidian" />

        <div className="relative flex min-h-[100dvh] flex-col justify-end gutter pb-[10vh] pt-[30vh]">
          <div className="grid-12 items-end">
            <div className="col-span-12 lg:col-span-8">
              <h2 id="salon-title" className="flex flex-wrap items-baseline gap-x-[0.15em]">
                <span className="display text-[clamp(3rem,11vw,11rem)] text-bone">DevFest</span>
                <span className="voice text-[clamp(2rem,6vw,6rem)] text-brass">{devfest.edition}</span>
              </h2>
              <SplitLines as="p" className="body-copy mt-6 max-w-[52ch]">
                {devfest.blurb}
              </SplitLines>
            </div>
            <ul className="mono col-span-12 mt-8 flex flex-col gap-2 text-ash lg:col-span-3 lg:col-start-10 lg:mt-0 lg:text-right">
              {facts.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="gutter py-[12vh]">
        <p className="body-copy">The salon runs all year. The flagship is one weekend of it.</p>
        <table className="mono mt-10 w-full border-collapse text-left text-ash">
          <thead>
            <tr className="border-b border-brass/40 text-bone">
              <th className="py-3 pr-6 font-normal">Event</th>
              <th className="py-3 pr-6 font-normal">Kind</th>
              <th className="hidden py-3 pr-6 font-normal md:table-cell">When</th>
              <th className="hidden py-3 font-normal md:table-cell">Note</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.name} className="border-b border-soot">
                <td className="py-4 pr-6 text-bone">{e.name}</td>
                <td className="py-4 pr-6">{e.kind}</td>
                <td className="hidden py-4 pr-6 md:table-cell">{e.when}</td>
                <td className="hidden py-4 md:table-cell">{e.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
