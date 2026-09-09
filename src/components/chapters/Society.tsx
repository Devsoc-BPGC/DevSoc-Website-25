"use client";

/**
 * The Society
 * The turn. Everywhere else the night holds; here it gives way, and then takes
 * itself back.
 *
 * One thing happens. Daylight crosses the stage, bay by bay along a wall of
 * windows, until the whole thing has inverted, ground to type. Then it keeps
 * going and leaves the same way, and the night closes over the section again.
 * It says what the copy says: what the campus sees in daylight was made in the
 * dark, and the dark is still there underneath it.
 *
 * The light used to arrive as a grainy diagonal ink flood. That was a good
 * effect and the wrong one. It spoke print, ink soaking into paper, while the
 * rest of the site speaks light through an opening: windows that are lit or
 * not, a door that opens, an aperture that closes. A building whose entire
 * argument is which of its windows are on should not change state by being
 * spilled on.
 *
 * The section also used to end inverted and hand a bright stage straight to a
 * night one, papered over with a wave divider. Crossing the light back off
 * again means there is nothing to paper over: it leaves the way it came, which
 * is the rule the whole site is built on anyway.
 *
 * The board on the right settles like a departure board while the light is
 * full on it. Facts about a society are the one place a split-flap is honest
 * rather than decorative: they are the numbers on the board.
 *
 * The stage is written once and rendered twice, in two tones. Both copies
 * have identical layout, so the inverted one can sit exactly on top of the
 * other under the mask and nothing shifts as it arrives. Only the plain copy
 * is in the accessibility tree.
 *
 * A phone and reduced motion both get the plain stage, unpinned and never
 * inverted, with the board already settled.
 */

import { useRef, useState } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useIsMobile, useReducedMotion } from "@/lib/useMedia";
import { Ambient } from "@/components/motion/Ambient";
import { WindowWipe, type WindowWipeHandle } from "@/components/motion/WindowWipe";
import { Reveal } from "@/components/motion/Reveal";
import { SplitFlap } from "@/components/motion/SplitFlap";
import { chapters } from "@/content/chapters";
import { site } from "@/content/site";

const facts = [
  { label: "Rooms", value: "Six" },
  { label: `Inducted in ${site.inducteesYear}`, value: "186" },
  { label: "Inductions", value: "Once a year" },
  { label: "Campus", value: site.campusShort },
];

/** The two tones the stage is drawn in. Ink is the page turned over. */
function tones(ink: boolean) {
  return ink
    ? {
        primary: "var(--bg-base)",
        muted: "color-mix(in oklch, var(--bg-base) 62%, var(--text-primary))",
        rule: "color-mix(in oklch, var(--bg-base) 40%, transparent)",
      }
    : {
        primary: "var(--text-primary)",
        muted: "var(--text-muted)",
        rule: "color-mix(in oklch, var(--rule-color) 30%, transparent)",
      };
}

function Stage({ ink = false, flap = false }: { ink?: boolean; flap?: boolean }) {
  const t = tones(ink);
  return (
    <div className="grid-12 items-start gap-y-12 gutter">
      <div className="col-span-12 lg:col-span-6">
        <p className="meta mb-8" style={{ color: t.muted }}>
          The Society
        </p>
        <p
          className="voice max-w-[15ch] text-[clamp(2rem,4.2vw,4.2rem)] leading-[1.04]"
          style={{ color: t.primary }}
          id={ink ? undefined : "society-line"}
        >
          Every fest the campus turns up to runs on something built the night before.
        </p>
        <p className="body-copy mt-9 max-w-[46ch]" style={{ color: t.muted }}>
          Six rooms, one society: web, app, game, AI and ML, UI and UX, and engine development. We build the fest sites
          the whole campus registers on, the apps that open on every phone during Waves and Quark, and the small tools
          that fix a Tuesday. Nobody here is paid and nothing here is a mock-up.
        </p>
      </div>

      <dl className="col-span-12 sm:col-span-8 lg:col-span-4 lg:col-start-8">
        {facts.map((f, i) => (
          <div
            key={f.label}
            className="flex items-baseline justify-between gap-6 border-t py-4 last:border-b"
            style={{ borderColor: t.rule }}
          >
            <dt className="meta" style={{ color: t.muted }}>
              {f.label}
            </dt>
            <dd className="meta text-right" style={{ color: t.primary }}>
              <SplitFlap text={f.value} play={flap} delay={i * 0.09} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function Society() {
  const track = useRef<HTMLDivElement>(null);
  const wipe = useRef<WindowWipeHandle>(null);
  const [flap, setFlap] = useState(false);
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  /** The stage only pins where it fits: a phone gets the plain layout. */
  const still = reduced || mobile;
  const light = chapters[1].light;

  /** The fixed chrome watches this: "" normal, "cross" hidden, "1" inverted. */
  const setInk = (v: string) => {
    const el = document.documentElement;
    if (v) {
      if (el.dataset.ink !== v) el.dataset.ink = v;
    } else if (el.dataset.ink) {
      delete el.dataset.ink;
    }
  };

  useGSAP(
    () => {
      if (still || !track.current) return;
      const st = ScrollTrigger.create({
        trigger: track.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate(self) {
          // The wipe owns its own timing: it holds on night at the start so the
          // line gets read, crosses, sits, and crosses off.
          const p = self.progress;
          wipe.current?.set(p);
          // A dead band, not a threshold. Without it, a reader scrubbing at the
          // boundary fires setState every frame and the board chatters.
          setFlap((on) => (on ? p > 0.55 : p > 0.62));
          // Hidden while the light is moving across, because the chrome would
          // be crossing bays of opposite tone and legible over neither.
          setInk(p < 0.22 ? "" : p < 0.58 ? "cross" : p < 0.78 ? "1" : p < 0.99 ? "cross" : "");
        },
      });

      /**
       * The pin releases while the flooded stage is still on screen: it has
       * another viewport of scrolling to do before it clears the top. The
       * chrome has to stay inverted for all of that, so its lifetime is a
       * second trigger that runs until the whole track is past.
       */
      const hold = ScrollTrigger.create({
        trigger: track.current,
        start: "top top",
        end: "bottom top",
        onLeave: () => setInk(""),
        onLeaveBack: () => setInk(""),
      });

      return () => {
        st.kill();
        hold.kill();
        setInk("");
      };
    },
    { scope: track, dependencies: [still] },
  );

  if (still) {
    return (
      <section id="society" className="relative overflow-hidden py-[18vh]" aria-labelledby="society-line">
        <Ambient x={light.x} y={light.y} intensity={0.3} />
        <div className="relative">
          <Reveal>
            <Stage flap />
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section id="society" aria-labelledby="society-line" className="relative">
      <div ref={track} className="relative h-[300vh]">
        {/* Both copies are centred in the same full-height box at the same
            width, so the inverted one lands exactly on the plain one. */}
        <div className="sticky top-0 flex h-[100dvh] items-center overflow-hidden">
          <Ambient x={light.x} y={light.y} intensity={0.3} />

          <div className="relative w-full">
            <Stage />
          </div>

          <WindowWipe ref={wipe} className="flex items-center">
            <div className="absolute inset-0" style={{ background: "var(--text-primary)" }} />
            <div className="relative w-full">
              <Stage ink flap={flap} />
            </div>
          </WindowWipe>
        </div>
      </div>
    </section>
  );
}
