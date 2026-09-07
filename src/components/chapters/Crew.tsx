"use client";

/**
 * The Crew, 04:10
 * A credits roll that plays itself. As the list travels up the screen the
 * portrait at the right changes to whoever is level with the middle of the
 * viewport, dissolving from one face to the next. Hovering a name takes over
 * for as long as the pointer stays there; otherwise scroll has the wheel.
 *
 * The portrait is graded lightly, not heavily: these are real faces and a
 * deep duotone turned them to mud. Moving the pointer over one lifts the
 * grade where the light falls.
 */

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useIsMobile, useReducedMotion } from "@/lib/useMedia";
import { LitImage } from "@/components/motion/LitImage";
import { TextLink } from "@/components/ui/TextLink";
import { people } from "@/content/people";

const portraits = people.map((p) => ({ src: p.image, alt: p.name }));

export function Crew({ all = false }: { all?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const index = hover ?? scrolled;

  // Rows rise in on arrival. IntersectionObserver decides, so late-loading
  // images cannot leave a row stranded, and a row already on screen shows.
  useEffect(() => {
    const el = root.current;
    if (reduced || !el) return;
    const rows = Array.from(el.querySelectorAll<HTMLElement>("[data-row]"));
    if (!rows.length || el.getBoundingClientRect().top < window.innerHeight * 0.85) return;
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

  // The face follows the scroll: whichever row is nearest the middle wins.
  useEffect(() => {
    const el = root.current;
    if (!el || mobile) return;
    const rows = Array.from(el.querySelectorAll<HTMLElement>("[data-row]"));
    if (!rows.length) return;
    const pick = () => {
      const mid = window.innerHeight * 0.5;
      let best = 0;
      let bestGap = Infinity;
      rows.forEach((r, i) => {
        const b = r.getBoundingClientRect();
        const gap = Math.abs(b.top + b.height / 2 - mid);
        if (gap < bestGap) {
          bestGap = gap;
          best = i;
        }
      });
      setScrolled((prev) => (prev === best ? prev : best));
    };
    const io = new IntersectionObserver(pick, {
      rootMargin: "-40% 0px -40% 0px",
      threshold: [0, 0.5, 1],
    });
    rows.forEach((r) => io.observe(r));
    pick();
    return () => io.disconnect();
  }, [mobile]);

  return (
    <section id="crew" ref={root} aria-labelledby="crew-title" className="relative py-[14vh]">
      <div className="gutter grid-12">
        <div className="col-span-12 lg:col-span-7">
          <h2 id="crew-title" className="display text-[clamp(2.4rem,6vw,6rem)] text-primary">
            The crew
          </h2>
          <p className="body-copy mt-6">The coordinators for this year. Every room has a head; the heads answer to two.</p>

          <ol className="mt-14">
            {people.map((p, i) => (
              <li key={p.id} data-row className="border-t border-rule/25 last:border-b">
                <a
                  href={p.link}
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  className={`group flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 py-5 transition-colors duration-700 ${
                    i === index ? "text-primary" : "text-muted hover:text-primary"
                  }`}
                  data-cursor="Open"
                >
                  <span
                    className="font-display text-[clamp(1.5rem,3.4vw,3.6rem)] font-black uppercase leading-none tracking-[-0.02em] transition-[font-variation-settings] duration-700 ease-[var(--ease-out-expo)]"
                    style={{ fontVariationSettings: i === index ? '"wdth" 118' : '"wdth" 104' }}
                  >
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
          <div className="sticky top-[22vh]">
            <LitImage images={portraits} index={index} className="aspect-[4/5] w-full" tint={0.3} simple={mobile} />
            <p key={people[index].id} className="mono rise-in mt-4 text-muted">
              <span className="text-primary">{people[index].name}</span>. {people[index].role}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
