"use client";

/**
 * The Collection: six rooms
 * A pinned stage. The six names stack at the left in display type; scrolling
 * moves through them and the active one turns bone and widens on the
 * variable axis. At the right, one frame shows that room's instrument and
 * melts into the next. Hovering a name previews its room. One soft light
 * moves to a new position per room.
 *
 * Mobile: unpinned, a carousel of the six instruments.
 */

import { useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useIsMobile, useReducedMotion } from "@/lib/useMedia";
import { LiquidImage } from "@/components/motion/LiquidImage";
import { verticals } from "@/content/verticals";

const images = verticals.map((v) => ({ src: v.image, alt: `${v.instrument}, the instrument of ${v.name}` }));

export function Rooms() {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [preview, setPreview] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const lenis = useLenis();
  const shown = preview ?? active;
  const room = verticals[shown];

  useGSAP(
    () => {
      if (mobile || !track.current) return;
      const st = ScrollTrigger.create({
        trigger: track.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate(self) {
          const i = Math.min(verticals.length - 1, Math.floor(self.progress * verticals.length));
          setActive((prev) => (prev === i ? prev : i));
        },
      });
      return () => st.kill();
    },
    { scope: track, dependencies: [mobile] },
  );

  if (mobile) {
    return (
      <section id="collection" className="py-[12vh]" aria-labelledby="collection-title">
        <h2 id="collection-title" className="display gutter text-[clamp(2.4rem,9vw,4rem)] text-bone">
          The collection
        </h2>
        <p className="body-copy gutter mt-5">
          Six rooms, one atelier. Each vertical keeps an instrument.
        </p>
        <ul
          className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="The six rooms"
        >
          <li className="w-[calc(var(--gutter)-1.25rem)] shrink-0" aria-hidden="true" />
          {verticals.map((v, i) => (
            <li key={v.id} className="w-[78vw] shrink-0 snap-start">
              <LiquidImage images={[images[i]]} index={0} className="aspect-[4/5]" simple />
              <p className="mono mt-4 text-ash">
                {v.index} <span className="text-bone">{v.name}</span>
              </p>
              <p className="voice mt-2 text-[1.35rem] text-bone">{v.voice}</p>
              <p className="mono mt-3 text-ash">
                {v.instrument}
                {v.head ? `. ${v.head}` : ""}
              </p>
            </li>
          ))}
          <li className="w-[calc(var(--gutter)-1.25rem)] shrink-0" aria-hidden="true" />
        </ul>
      </section>
    );
  }

  return (
    <section id="collection" aria-labelledby="collection-title" className="relative">
      <div ref={track} className="relative h-[600vh]">
        <div className="sticky top-0 h-[100dvh] overflow-hidden">
          {/* the one light, moved per room */}
          <div
            className="glow"
            style={{
              transform: `translate(calc(${room.light.x}vw - 50%), calc(${room.light.y}vh - 50%))`,
              opacity: reduced ? 0.35 : 0.5,
            }}
            aria-hidden="true"
          />

          <div className="grid-12 relative h-full items-center gutter">
            {/* index */}
            <div className="col-span-5 self-center">
              <h2 id="collection-title" className="mono mb-8 text-ash">
                The collection
              </h2>
              <ol className="flex flex-col gap-[0.6vh]">
                {verticals.map((v, i) => {
                  const on = i === shown;
                  return (
                    <li key={v.id} className="flex items-baseline gap-5">
                      <span className={`mono w-6 shrink-0 transition-colors duration-500 ${on ? "text-brass" : "text-ash/50"}`}>
                        {v.index}
                      </span>
                      <button
                        type="button"
                        onMouseEnter={() => setPreview(i)}
                        onMouseLeave={() => setPreview(null)}
                        onFocus={() => setPreview(i)}
                        onBlur={() => setPreview(null)}
                        onClick={() => {
                          const t = track.current;
                          if (!t) return;
                          const top = t.getBoundingClientRect().top + window.scrollY;
                          const span = t.offsetHeight - window.innerHeight;
                          const y = top + (span * (i + 0.5)) / verticals.length;
                          if (lenis) lenis.scrollTo(y, { duration: 1.4 });
                          else window.scrollTo({ top: y, behavior: "smooth" });
                        }}
                        className={`text-left font-display text-[clamp(1.6rem,3.6vw,3.9rem)] font-black uppercase leading-[0.95] tracking-[-0.02em] transition-[color,font-variation-settings] duration-700 ease-[var(--ease-out-expo)] ${
                          on ? "text-bone" : "text-ash/45 hover:text-ash"
                        }`}
                        style={{ fontVariationSettings: on ? '"wdth" 125' : '"wdth" 100' }}
                        aria-current={i === active ? "true" : undefined}
                        data-cursor="Look"
                      >
                        {v.short}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* frame */}
            <div className="col-span-6 col-start-7 self-center">
              <div className="relative">
                <LiquidImage images={images} index={shown} className="aspect-[4/5] max-h-[76vh] w-full" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-obsidian/80 to-transparent p-7 pt-24">
                  <p key={room.id} className="voice rise-in max-w-[22ch] text-[clamp(1.25rem,1.9vw,1.9rem)] text-bone">
                    {room.voice}
                  </p>
                </div>
              </div>
              <div key={`${room.id}-meta`} className="rise-in mono mt-5 flex flex-wrap justify-between gap-x-8 gap-y-2 text-ash">
                <span>
                  <span className="text-bone">{room.instrument}</span>
                  {room.head ? `. ${room.head}` : ""}
                </span>
                <span>{room.tools.join(", ")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
