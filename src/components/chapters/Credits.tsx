"use client";

/**
 * The Makers: credits
 * A credits roll. One row per person, name in display, role in mono, a brass
 * hairline between rows. Hovering a row swaps the portrait in the frame at
 * the right, which rests in the verdigris grade and resolves under the pointer.
 */

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useIsMobile, useReducedMotion } from "@/lib/useMedia";
import { LiquidImage } from "@/components/motion/LiquidImage";
import { TextLink } from "@/components/ui/TextLink";
import { people } from "@/content/people";

const portraits = people.map((p) => ({ src: p.image, alt: p.name }));

export function Credits({ all = false }: { all?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();
  const mobile = useIsMobile();

  // Rows rise in when the section arrives. Layout-independent: an
  // IntersectionObserver decides, so late-loading images cannot stale it.
  // If the section is already on screen when this runs, nothing is hidden.
  useEffect(() => {
    const el = root.current;
    if (reduced || !el) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.85) return;
    const rows = Array.from(el.querySelectorAll<HTMLElement>("[data-row]"));
    gsap.set(rows, { y: 28, opacity: 0 });
    let played = false;
    const play = () => {
      if (played) return;
      played = true;
      gsap.to(rows, { y: 0, opacity: 1, duration: 1.1, stagger: 0.07, ease: "expo.out", overwrite: true });
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          play();
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (!played) gsap.set(rows, { clearProps: "all" });
    };
  }, [reduced]);

  return (
    <section id="makers" ref={root} aria-labelledby="makers-title" className="relative py-[14vh]">
      <div className="gutter grid-12">
        <div className="col-span-12 lg:col-span-7">
          <h2 id="makers-title" className="display text-[clamp(2.4rem,6vw,6rem)] text-bone">
            The makers
          </h2>
          <p className="body-copy mt-6">The coordinators for this year. Every room has a head; the heads answer to two.</p>

          <ol className="mt-14">
            {people.map((p, i) => (
              <li key={p.id} data-row className="border-t border-brass/25 last:border-b">
                <a
                  href={p.link}
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={() => setIndex(i)}
                  onFocus={() => setIndex(i)}
                  className={`group flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 py-5 transition-colors duration-500 ${
                    i === index ? "text-bone" : "text-ash hover:text-bone"
                  }`}
                  data-cursor="Open"
                >
                  <span className="font-display text-[clamp(1.5rem,3.4vw,3.6rem)] font-black uppercase leading-none tracking-[-0.02em] [font-variation-settings:'wdth'_112]">
                    {p.name}
                  </span>
                  <span className="mono">{p.role}</span>
                </a>
              </li>
            ))}
          </ol>
          {!all ? (
            <div className="mt-10">
              <TextLink href="/team" cursor="Go">
                Everyone in the room
              </TextLink>
            </div>
          ) : null}
        </div>

        <div className="hidden lg:col-span-4 lg:col-start-9 lg:block">
          <div className="sticky top-[18vh]">
            <LiquidImage images={portraits} index={index} className="aspect-[4/5] w-full" tint={1} simple={mobile} />
            <p key={people[index].id} className="mono rise-in mt-4 text-ash">
              <span className="text-bone">{people[index].name}</span>. {people[index].role}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
