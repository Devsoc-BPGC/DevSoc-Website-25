"use client";

/**
 * The Flywheel, 22:30
 *
 * Six verticals on one wheel. Scrolling the pinned section turns it a sixth
 * of a revolution per vertical, and whichever spoke reaches the tick at the
 * top is the one you are reading about. The hub carries that vertical's
 * poster, melting from one to the next. Hovering a name turns the wheel
 * straight to it.
 *
 * The wheel is drawn in code rather than generated so it can turn, light the
 * active spoke and carry type.
 *
 * Mobile drops the wheel for a swipe rail. Reduced motion renders the wheel
 * still, with the six reachable as buttons.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useIsMobile, useReducedMotion } from "@/lib/useMedia";
import { Ambient } from "@/components/motion/Ambient";
import { LiquidImage } from "@/components/motion/LiquidImage";
import { WaveDivider } from "@/components/motion/WaveDivider";
import { chapters } from "@/content/chapters";
import { verticals } from "@/content/verticals";

const STEP = 360 / verticals.length;
/**
 * Scrolling turns the wheel five sixths of a revolution, not a whole one, so
 * that the first spoke starts at the tick and the last one arrives there at
 * the end. A full turn would put the first spoke back under the tick just as
 * you leave.
 */
const TURN = STEP * (verticals.length - 1);
const posters = verticals.map((v) => ({ src: v.image, alt: `${v.name}: ${v.object}` }));

export function Rooms() {
  const track = useRef<HTMLDivElement>(null);
  const wheel = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [preview, setPreview] = useState<number | null>(null);
  const hovering = useRef(false);
  const spin = useRef({ deg: 0 });

  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const shown = preview ?? active;
  const room = verticals[shown];
  const light = chapters[2].light;

  /** Writes the angle straight to CSS, so turning the wheel never re-renders. */
  const apply = useCallback((deg: number) => {
    spin.current.deg = deg;
    wheel.current?.style.setProperty("--a", `${deg}deg`);
  }, []);

  useGSAP(
    () => {
      if (mobile || reduced || !track.current) return;
      const st = ScrollTrigger.create({
        trigger: track.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate(self) {
          // Whichever spoke is nearest the tick is the one being read.
          const i = Math.round(self.progress * (verticals.length - 1));
          setActive((prev) => (prev === i ? prev : i));
          // While the pointer is steering, let it own the wheel.
          if (!hovering.current) apply(-self.progress * TURN);
        },
      });
      return () => st.kill();
    },
    { scope: track, dependencies: [mobile, reduced, apply] },
  );

  // Hovering a name turns the wheel straight to that spoke.
  useEffect(() => {
    if (mobile || reduced || preview === null) return;
    hovering.current = true;
    const tween = gsap.to(spin.current, {
      deg: -preview * STEP,
      duration: 0.8,
      ease: "expo.out",
      onUpdate: () => apply(spin.current.deg),
    });
    return () => {
      tween.kill();
    };
  }, [preview, mobile, reduced, apply]);

  /** Hands the wheel back to wherever the scroll says it should be. */
  const release = useCallback(() => {
    setPreview(null);
    hovering.current = false;
    const st = ScrollTrigger.getAll().find((t) => t.trigger === track.current);
    if (!st) return;
    gsap.to(spin.current, {
      deg: -st.progress * TURN,
      duration: 0.8,
      ease: "expo.out",
      onUpdate: () => apply(spin.current.deg),
    });
  }, [apply]);

  if (mobile) {
    return (
      <section id="rooms" className="relative overflow-hidden py-[14vh]" aria-labelledby="rooms-title">
        <Ambient x={light.x} y={light.y} intensity={0.3} />
        <div className="relative">
          <h2 id="rooms-title" className="display gutter text-[clamp(2.4rem,9vw,4rem)] text-primary">
            The flywheel
          </h2>
          <p className="body-copy gutter mt-5">Six verticals on one wheel. Every one of them ships.</p>

          <ul
            className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="The six verticals"
          >
            <li className="w-[calc(var(--gutter)-1.25rem)] shrink-0" aria-hidden="true" />
            {verticals.map((v, i) => (
              <li key={v.id} className="w-[78vw] shrink-0 snap-start">
                <LiquidImage images={[posters[i]]} index={0} className="aspect-[4/5]" simple />
                <p className="mono mt-4 text-muted">
                  {v.index} <span className="text-primary">{v.name}</span>
                </p>
                <p className="voice mt-2 text-[1.35rem] text-primary">{v.voice}</p>
                <p className="mono mt-3 text-muted">
                  {v.head ?? "Head to be confirmed"}. {v.tools.join(", ")}
                </p>
              </li>
            ))}
            <li className="w-[calc(var(--gutter)-1.25rem)] shrink-0" aria-hidden="true" />
          </ul>
        </div>
        <WaveDivider fill="var(--bg-base)" />
      </section>
    );
  }

  return (
    <section id="rooms" aria-labelledby="rooms-title" className="relative">
      <div ref={track} className={reduced ? "relative" : "relative h-[600vh]"}>
        <div className={reduced ? "py-[14vh]" : "sticky top-0 h-[100dvh] overflow-hidden"}>
          <Ambient x={light.x} y={light.y} intensity={0.34} />

          <div className="grid-12 relative h-full items-center gutter">
            {/* the index */}
            <div className="col-span-5 self-center">
              <h2 id="rooms-title" className="mono mb-8 text-muted">
                The flywheel
              </h2>

              <ol className="flex flex-col gap-[0.5vh]">
                {verticals.map((v, i) => {
                  const on = i === shown;
                  return (
                    <li key={v.id} className="flex items-baseline gap-5">
                      <span
                        className={`mono w-6 shrink-0 transition-colors duration-500 ${on ? "text-warm" : "text-muted/50"}`}
                      >
                        {v.index}
                      </span>
                      <button
                        type="button"
                        onMouseEnter={() => setPreview(i)}
                        onMouseLeave={release}
                        onFocus={() => setPreview(i)}
                        onBlur={release}
                        onClick={() => setActive(i)}
                        className={`text-left font-display text-[clamp(1.5rem,3.2vw,3.4rem)] font-black uppercase leading-[0.95] tracking-[-0.02em] transition-[color,font-variation-settings] duration-700 ease-[var(--ease-out-expo)] ${
                          on ? "text-primary" : "text-muted/45 hover:text-muted"
                        }`}
                        style={{ fontVariationSettings: on ? '"wdth" 125' : '"wdth" 100' }}
                        aria-current={i === active ? "true" : undefined}
                        data-cursor="Turn"
                      >
                        {v.short}
                      </button>
                    </li>
                  );
                })}
              </ol>

              <div key={room.id} className="rise-in mt-10 max-w-[34ch]">
                <p className="voice text-[clamp(1.2rem,1.8vw,1.8rem)] text-primary">{room.voice}</p>
                <p className="mono mt-4 text-muted">
                  {room.head ? <span className="text-primary">{room.head}</span> : "Head to be confirmed"}
                  {". "}
                  {room.tools.join(", ")}
                </p>
              </div>
            </div>

            {/* the wheel */}
            {/* Padded off the right edge so the wheel clears the chapter rail. */}
            <div className="col-span-7 col-start-6 flex h-full items-center justify-center pr-[9vw]">
              <div
                ref={wheel}
                className="relative aspect-square w-[min(38vw,66vh)]"
                style={{ ["--a" as string]: "0deg" }}
              >
                <div className="absolute inset-0 rounded-full border border-rule/40" aria-hidden="true" />
                <div className="absolute inset-[14%] rounded-full border border-rule/20" aria-hidden="true" />

                {/* The tick that says which spoke you are on. It sits outside
                    the rim, where an arriving node cannot cover it. */}
                <div className="absolute left-1/2 top-[-7%] h-[5%] w-px -translate-x-1/2 bg-warm" aria-hidden="true" />

                {/* the rotor. JS owns this angle. */}
                <div
                  className="absolute inset-0"
                  style={{ transform: "rotate(var(--a))", transformOrigin: "50% 50%" }}
                  aria-hidden="true"
                >
                  {/* drift sits on its own layer so it never fights the JS angle */}
                  <div className={`absolute inset-0 ${reduced ? "" : "wheel-drift"}`}>
                    {verticals.map((v, i) => (
                      <div
                        key={`spoke-${v.id}`}
                        className="absolute left-1/2 top-1/2 h-px w-[43%] origin-left bg-rule/25"
                        style={{ transform: `rotate(${i * STEP - 90}deg)` }}
                      />
                    ))}
                    {verticals.map((v, i) => (
                      /* An arm from the centre to the rim. It has real height, so
                         the node at its far end lands on the rim rather than at
                         the hub. */
                      <div
                        key={`node-${v.id}`}
                        className="absolute bottom-1/2 left-1/2 h-1/2 w-0 origin-bottom"
                        style={{ transform: `rotate(${i * STEP}deg)` }}
                      >
                        <div
                          className="absolute left-0 top-[12%] h-[6.2vw] w-[6.2vw] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border transition-[border-color,opacity] duration-700"
                          style={{
                            rotate: `calc(-1 * ${i * STEP}deg - var(--a))`,
                            borderColor: i === shown ? "var(--accent-warm)" : "var(--rule-color)",
                            opacity: i === shown ? 1 : 0.4,
                          }}
                        >
                          <Image
                            src={v.image}
                            alt=""
                            width={200}
                            height={250}
                            sizes="8vw"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* the hub carries the vertical you are on */}
                <div className="absolute inset-[27%] overflow-hidden rounded-full border border-rule/50">
                  <LiquidImage images={posters} index={shown} className="h-full w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <WaveDivider fill="var(--bg-base)" />
    </section>
  );
}
