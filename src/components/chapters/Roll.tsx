"use client";

/**
 * One hundred and eighty six
 *
 * This is the section that most directly beats the content problem. 186 real
 * names is more verified material than most college club sites have in total,
 * and until now it has been a search box. Here it is the monument: every name
 * set as one dense wall of type, edge to edge, no cards and no columns.
 *
 * The mechanic is a light bar. A soft band descends the wall as you scroll, and
 * a name lights when the band reaches it and dims again once it passes.
 * Scrolling back up genuinely feels like sweeping a torch back across a wall.
 * Nothing else on the site lights by proximity, and nothing else counts up.
 *
 * Performance matters here more than anywhere: 186 elements, one scrub. Every
 * offset is read once on refresh and only transforms and opacities are written
 * per frame, so a frame never triggers layout.
 *
 * The names themselves never animate on arrival. The band is their only
 * movement, and giving them a second one would ruin it.
 */

import { useCallback, useMemo, useRef } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { StickyStage } from "@/components/motion/StickyStage";
import { RevealChars } from "@/components/motion/text";
import { TextLink } from "@/components/ui/TextLink";
import inductees from "@/content/inductees.json";
import { site } from "@/content/site";

type Inductee = { name: string; id: string | null };

/** Height of the lit band, as a share of the wall. */
const BAND = 0.16;

export function Roll() {
  const wall = useRef<HTMLParagraphElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const offsets = useRef<number[] | null>(null);
  const names = useMemo(() => (inductees as Inductee[]).map((p) => p.name), []);

  const measure = useCallback(() => {
    const el = wall.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    const h = el.offsetHeight || 1;
    offsets.current = Array.from(el.querySelectorAll<HTMLElement>("[data-name]")).map((n) => {
      const r = n.getBoundingClientRect();
      return (r.top + r.height / 2 - top) / h;
    });
  }, []);

  const onProgress = useCallback(
    (p: number) => {
      const el = wall.current;
      if (!el) return;
      if (!offsets.current) measure();
      const list = offsets.current;
      if (!list) return;

      // The band sweeps from just above the wall to just below it.
      const centre = -BAND + p * (1 + BAND * 2);
      let passed = 0;
      const kids = el.children;
      for (let i = 0; i < list.length; i++) {
        const d = Math.abs(list[i] - centre);
        const lit = d < BAND ? 1 - d / BAND : 0;
        const node = kids[i] as HTMLElement | undefined;
        if (node) {
          node.style.opacity = (0.26 + lit * 0.74).toFixed(3);
          node.style.letterSpacing = `${(0.045 + lit * 0.02).toFixed(3)}em`;
        }
        if (list[i] <= centre) passed++;
      }
      if (counter.current) counter.current.textContent = String(passed).padStart(3, "0");
      if (bar.current) bar.current.style.transform = `translateY(${(centre * 100).toFixed(2)}%)`;
    },
    [measure],
  );

  // Offsets are read on refresh, never during a scroll frame.
  useMemo(() => {
    if (typeof window === "undefined") return;
    ScrollTrigger.addEventListener("refresh", () => {
      offsets.current = null;
    });
  }, []);

  return (
    <StickyStage
      id="roll"
      vh={240}
      vhMobile={180}
      tone="ground"
      onProgress={onProgress}
      aria-labelledby="roll-title"
      stageClassName="flex flex-col justify-center"
    >
      <div className="relative w-full gutter">
        <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-2">
          <RevealChars
            as="h2"
            id="roll-title"
            className="display text-[clamp(4rem,13vw,12rem)] leading-[0.82] text-primary"
          >
            186
          </RevealChars>
          <p className="meta text-muted">
            <span ref={counter} className="hud text-light">
              000
            </span>{" "}
            counted
          </p>
        </div>
        <p className="body-copy mt-2">Inducted this year.</p>

        {/* The wall. */}
        <div className="relative mt-10 overflow-hidden">
          <div
            ref={bar}
            className="pointer-events-none absolute inset-x-0 -top-[8%] h-[16%]"
            style={{
              background:
                "linear-gradient(to bottom, transparent, color-mix(in oklch, var(--accent-warm) 10%, transparent), transparent)",
            }}
            aria-hidden="true"
          />
          <p ref={wall} className="meta max-h-[42vh] overflow-hidden text-primary">
            {names.map((n, i) => (
              <span key={`${n}-${i}`} data-name style={{ opacity: 0.26 }}>
                {n}
                {i < names.length - 1 ? <span className="text-rule/50"> · </span> : null}
              </span>
            ))}
          </p>
        </div>

        <div className="mt-8">
          <TextLink href="/inductees" cursor="Go">
            Find your name in the full list
          </TextLink>
          <p className="meta mt-4 text-muted">
            Names and IDs as they came from the {site.inducteesYear} induction list. If yours is wrong, write to us.
          </p>
        </div>
      </div>
    </StickyStage>
  );
}
