"use client";

/**
 * First Month
 * The question the reader actually arrived with, answered in second person,
 * which no other section on the site uses.
 *
 * The mechanic is a ruler. A hairline in the left gutter fills as you go, and
 * the week blocks arrive from alternating sides with a mask that wipes in from
 * the same side each one travels from. Direction of travel and direction of
 * reveal agree, which is the detail that makes it read as physical rather than
 * as a slide-in. It is also why the exit is legible: things leave the way they
 * arrived, and this is the only section where you can see that happen.
 *
 * Not sticky. This is the one long section that simply scrolls, because the
 * content is a sequence you read rather than a stage you watch, and pinning it
 * would make five short paragraphs take a thousand pixels each.
 */

import Image from "next/image";
import { useRef } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { SCRUB } from "@/lib/easings";
import { useReducedMotion } from "@/lib/useMedia";
import { RevealChars, RevealLines, RevealWords } from "@/components/motion/text";
import { weeks, inductionClose } from "@/content/induction";

export function FirstMonth() {
  const root = useRef<HTMLElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = root.current;
      const bar = fill.current;
      if (!el || !bar) return;
      if (reduced) {
        bar.style.transform = "scaleY(1)";
        return;
      }

      const st = ScrollTrigger.create({
        trigger: el,
        start: "top 70%",
        end: "bottom 80%",
        scrub: SCRUB.normal,
        onUpdate: (self) => {
          bar.style.transform = `scaleY(${self.progress.toFixed(4)})`;
        },
      });

      // Each block travels in from its own side and its mask wipes the same
      // way, so the movement and the reveal never disagree.
      const blocks = gsapTargets(el);
      const triggers = blocks.map((node) => {
        const side = node.dataset.side === "right" ? 1 : -1;
        return ScrollTrigger.create({
          trigger: node,
          start: "top 88%",
          end: "top 45%",
          scrub: SCRUB.normal,
          onUpdate: (self) => {
            const p = self.progress;
            node.style.transform = `translateX(${(1 - p) * side * 14}vw)`;
            node.style.opacity = String(Math.min(1, p * 1.6));
            const edge = side === 1 ? "right" : "left";
            node.style.maskImage = `linear-gradient(to ${edge}, black ${(p * 130).toFixed(1)}%, transparent ${(p * 130 + 12).toFixed(1)}%)`;
            node.style.webkitMaskImage = node.style.maskImage;
          },
        });
      });

      return () => {
        st.kill();
        triggers.forEach((t) => t.kill());
        blocks.forEach((n) => {
          n.style.transform = "";
          n.style.opacity = "";
          n.style.maskImage = "";
          n.style.webkitMaskImage = "";
        });
      };
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section id="first-month" ref={root} data-tone="ground" className="relative py-[16vh]" aria-labelledby="month-title">
      <div className="gutter">
        <p className="meta mb-6 text-muted">06 / your first month</p>
        <RevealChars as="h2" id="month-title" className="display text-[clamp(2.2rem,5vw,5rem)] text-primary">
          Your first month, honestly
        </RevealChars>
      </div>

      <div className="relative mt-[10vh] gutter">
        {/* The ruler. */}
        <div className="pointer-events-none absolute left-[calc(var(--gutter)-1px)] top-0 hidden h-full w-px bg-rule/20 lg:block" aria-hidden="true">
          <div ref={fill} className="h-full w-full origin-top bg-rule" style={{ transform: "scaleY(0)" }} />
        </div>

        <ol className="flex flex-col gap-[12vh] lg:pl-[8vw]">
          {weeks.map((w) => (
            <li
              key={w.label}
              data-week
              data-side={w.side}
              className="grid-12 items-center gap-y-8 will-change-transform"
            >
              <div className={w.image ? "col-span-12 lg:col-span-6" : "col-span-12 lg:col-span-8"}>
                <p className="meta text-warm">{w.label}</p>
                <RevealWords as="h3" className="voice mt-3 text-[clamp(1.7rem,3vw,2.8rem)] text-primary">
                  {w.title}
                </RevealWords>
                <RevealLines as="p" className="body-copy mt-5 max-w-[44ch]">
                  {w.body}
                </RevealLines>
              </div>
              {w.image ? (
                <div className="col-span-12 lg:col-span-4 lg:col-start-9">
                  <div className="relative aspect-[4/5] w-full max-w-[26vw] overflow-hidden lg:ml-auto">
                    <Image
                      src={w.image}
                      alt={w.alt ?? ""}
                      fill
                      sizes="(min-width: 1024px) 26vw, 80vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ol>

        <p className="voice mt-[14vh] max-w-[28ch] text-[clamp(1.4rem,2.4vw,2.2rem)] text-primary lg:pl-[8vw]">
          {inductionClose}
        </p>
      </div>
    </section>
  );
}

/** The week blocks, read once so the effect never queries mid-scroll. */
function gsapTargets(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>("[data-week]"));
}
