"use client";

/**
 * The Archive: gallery
 * Three lanes of photographs travelling at different speeds under the scroll.
 * Each one arrives graded and lifts into full colour as it reaches the middle
 * of the screen, so the whole wall plays without a single click. Opening one
 * larger is offered, never required.
 */

import { useRef, useState } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import { useIsMobile, useReducedMotion } from "@/lib/useMedia";
import { ScrollResolve } from "@/components/motion/ScrollResolve";
import { Reveal } from "@/components/motion/Reveal";
import { Lightbox } from "@/components/ui/Lightbox";
import { TextLink } from "@/components/ui/TextLink";
import { gallery, type Photo } from "@/content/gallery";

const SPEEDS = [-5, -13, -2];

export function Archive({ photos = gallery.slice(0, 12), all = false }: { photos?: Photo[]; all?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const mobile = useIsMobile();

  const lanes: Photo[][] = [[], [], []];
  photos.forEach((p, i) => lanes[i % 3].push(p));

  useGSAP(
    () => {
      if (reduced || mobile) return;
      gsap.utils.toArray<HTMLElement>("[data-lane]").forEach((lane, i) => {
        gsap.fromTo(
          lane,
          { yPercent: -SPEEDS[i] * 0.5 },
          {
            yPercent: SPEEDS[i],
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 1.2 },
          },
        );
      });
    },
    { scope: root, dependencies: [reduced, mobile] },
  );

  const tile = (p: Photo) => {
    const idx = photos.indexOf(p);
    return (
      <button
        key={p.src}
        type="button"
        onClick={() => setOpen(idx)}
        className="block w-full text-left"
        aria-label={`Open photo ${idx + 1} larger`}
        data-cursor="Open"
      >
        <ScrollResolve className="w-full">
          <Image
            src={p.src}
            alt={p.alt}
            width={p.width}
            height={p.height}
            sizes="(min-width: 1024px) 30vw, 88vw"
            className="h-auto w-full"
          />
        </ScrollResolve>
      </button>
    );
  };

  return (
    <section id="archive" ref={root} aria-labelledby="archive-title" className="relative py-[8vh]">
      <Reveal className="gutter">
        <h2 id="archive-title" className="display text-[clamp(2.4rem,6vw,6rem)] text-primary">
          The archive
        </h2>
        <p className="body-copy mt-6">Beach days, DevFest nights, the room after a ship.</p>
      </Reveal>

      {mobile ? (
        <div className="gutter mt-10 flex flex-col gap-6">{photos.slice(0, all ? photos.length : 6).map((p) => tile(p))}</div>
      ) : (
        <div className="gutter mt-14 grid grid-cols-3 gap-[2vw]">
          {lanes.map((lane, i) => (
            <div key={i} data-lane className={`flex flex-col gap-[2vw] ${i === 1 ? "mt-[10vh]" : i === 2 ? "mt-[4vh]" : ""}`}>
              {lane.map((p) => tile(p))}
            </div>
          ))}
        </div>
      )}

      {!all ? (
        <div className="gutter mt-12">
          <TextLink href="/gallery" cursor="Go">
            Open the archive
          </TextLink>
        </div>
      ) : null}

      <Lightbox photos={photos} index={open} onClose={() => setOpen(null)} onChange={setOpen} />
    </section>
  );
}
