"use client";

/**
 * The Night Shift
 * The centrepiece, and the answer to this site's real constraint.
 *
 * The club cannot show a portfolio, so this shows the work instead: what
 * building under a deadline is actually like, from three weeks out to the
 * moment it goes live. Every block is present-tense habitual, so it describes
 * how it goes rather than claiming what happened.
 *
 * The composition is the argument. One numeral at viewport scale owns the
 * upper field and nothing is allowed to cross it, because a section about a
 * deadline should be dominated by the deadline. Everything else sits below it
 * on the same centre axis, quiet and narrow, so the scale contrast does the
 * work rather than the layout. The numeral is sized by `min(vw, vh)` so it
 * stays monumental on a wide screen without overflowing a short one.
 *
 * Three mechanics, none of them used anywhere else.
 *
 * The counter interpolates continuously through the eight marks rather than
 * stepping between them, so the digits visibly run down as you scroll and run
 * back up as you leave. It is the only animated number on the site.
 *
 * The blocks hard cut. At each threshold the outgoing clip snaps shut and the
 * incoming one snaps open in a single frame. Everything else here moves on a
 * slow exponential over a second or more; this one is cut, because that is what
 * the subject feels like.
 *
 * The numeral heats. It sits half lit at three weeks out and burns to full
 * strength at zero, so the section brightens as the deadline closes and dims
 * again on the way back up.
 */

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { StickyStage } from "@/components/motion/StickyStage";
import { RevealChars } from "@/components/motion/text";
import { beats, shipLines } from "@/content/process";

/** Where each block takes over, evenly spaced across the scrub. */
const STEP = 1 / beats.length;

function pad(n: number, w = 2) {
  return String(Math.max(0, Math.floor(n))).padStart(w, "0");
}

/** Hours remaining, rendered the way a countdown would show them. */
function readout(hours: number) {
  if (hours >= 48) return { big: pad(hours / 24), unit: "days" };
  if (hours >= 1) return { big: pad(hours), unit: "hours" };
  const mins = hours * 60;
  if (mins >= 1) return { big: pad(mins), unit: "minutes" };
  return { big: "00", unit: "live" };
}

export function NightShift() {
  const [index, setIndex] = useState(0);
  const counter = useRef<HTMLSpanElement>(null);
  const unit = useRef<HTMLSpanElement>(null);
  const numeral = useRef<HTMLParagraphElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const climax = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);

  const onProgress = useCallback((p: number) => {
    // The block index is quantised and guarded, so the hard cut fires once per
    // threshold rather than setting state on every frame.
    const i = Math.min(beats.length - 1, Math.floor(p / STEP));
    setIndex((prev) => (prev === i ? prev : i));

    // The counter is continuous, interpolated between the marks it passes.
    const t = Math.min(0.999, Math.max(0, p)) / STEP;
    const a = beats[Math.min(beats.length - 1, Math.floor(t))];
    const b = beats[Math.min(beats.length - 1, Math.floor(t) + 1)] ?? beats[beats.length - 1];
    const f = t - Math.floor(t);
    const hours = a.hours + (b.hours - a.hours) * f;
    const r = readout(hours);
    if (counter.current) counter.current.textContent = r.big;
    if (unit.current) unit.current.textContent = r.unit;

    // The last beat opens the building, shuttered from the centre outward, and
    // the stage clears out from under it so the two never fight for the frame.
    const c = Math.max(0, (p - 0.9) / 0.1);

    // The numeral burns up as the deadline closes, then gets out of the way.
    // Only its brightness moves. Blending the hue toward the ember accent
    // sounded right and looked wrong: acid and amber sit either side of yellow,
    // so every mid value went through a dull olive.
    // Type has to be gone before the aperture is wide enough to read past, or
    // fragments of it show either side of the opening.
    const clear = 1 - Math.min(1, c * 2.4);
    if (numeral.current) {
      numeral.current.style.opacity = ((0.72 + p * 0.28) * clear).toFixed(3);
    }

    // The room warms with it.
    if (glow.current) glow.current.style.opacity = (0.06 + p * 0.44).toFixed(3);

    if (climax.current) {
      climax.current.style.clipPath = `inset(0 ${((1 - c) * 50).toFixed(2)}% 0 ${((1 - c) * 50).toFixed(2)}%)`;
      climax.current.style.opacity = c > 0 ? "1" : "0";
    }
    if (body.current) body.current.style.opacity = clear.toFixed(3);
  }, []);

  return (
    <StickyStage
      id="nightshift"
      vh={420}
      vhMobile={300}
      tone="ground"
      onProgress={onProgress}
      aria-labelledby="nightshift-title"
    >
      {/* The room heating up. */}
      <div
        ref={glow}
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 44% at 50% 34%, color-mix(in oklch, var(--accent-warm) 18%, transparent), transparent 72%)",
          opacity: 0.06,
        }}
        aria-hidden="true"
      />

      {/* One centre axis: title, then the number, then everything it is about. */}
      <div ref={body} className="gutter relative z-10 flex h-full w-full flex-col items-center justify-center text-center">
        <RevealChars
          as="h2"
          id="nightshift-title"
          className="meta text-muted"
        >
          How a fest site actually gets built
        </RevealChars>

        {/* The countdown. Nothing is allowed to cross it. */}
        <p
          ref={numeral}
          className="hud mt-[3vh] flex select-none items-baseline gap-[0.12em] leading-[0.72]"
          style={{ opacity: 0.55, color: "var(--accent-light)" }}
          aria-hidden="true"
        >
          <span ref={counter} className="text-[min(46vw,50vh)]">
            21
          </span>
          <span ref={unit} className="text-[clamp(1rem,2.2vw,2.2rem)]">
            days
          </span>
        </p>

        <div className="mt-[4vh] h-px w-full max-w-[74ch] bg-rule/20" aria-hidden="true" />

        {/* The beats. One is up at a time, and they cut rather than fade. */}
        <div className="relative mt-[4vh] min-h-[30vh] w-full max-w-[60ch]">
          {beats.map((b, i) => (
            <article
              key={b.mark}
              className="absolute inset-x-0 top-0"
              style={{
                clipPath:
                  i === index
                    ? "inset(-20% 0 -20% 0)"
                    : i < index
                      ? "inset(-20% 0 100% 0)"
                      : "inset(100% 0 -20% 0)",
              }}
              aria-hidden={i === index ? undefined : true}
            >
              <p className="meta text-warm">{b.mark}</p>
              <h3 className="voice mt-4 text-[clamp(1.8rem,3.6vw,3.2rem)] leading-[1.06] text-primary">{b.title}</h3>
              {/* T-0 changes register. The terminal is what shipping actually
                  looks like, so it stands in for the paragraph rather than
                  stacking on top of one: both together overflow the stage, and
                  they say the same thing twice. */}
              {b.body ? (
                <p className="body-copy mx-auto mt-5 max-w-[50ch]">{b.body}</p>
              ) : (
                <div className="mx-auto mt-6 w-full max-w-[42ch] border border-rule/25 px-5 py-4 text-left">
                  {shipLines.map((l) => (
                    <p
                      key={l.text}
                      className={`meta leading-[1.7] ${
                        l.kind === "comment" ? "text-muted" : l.kind === "ok" ? "text-light" : "text-primary"
                      } ${l.kind === "indent" ? "pl-5" : ""}`}
                    >
                      {l.text}
                    </p>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>

      {/* Eight marks, so you can see how far into the night you are. */}
      <div className="gutter absolute inset-x-0 bottom-0 z-10 flex items-center gap-[6px] pb-[6vh]" aria-hidden="true">
        {beats.map((b, i) => (
          <span
            key={b.mark}
            className="h-px flex-1 transition-colors duration-300"
            style={{
              background:
                i === index
                  ? "var(--accent-warm)"
                  : i < index
                    ? "color-mix(in oklch, var(--accent-warm) 30%, transparent)"
                    : "color-mix(in oklch, var(--text-primary) 12%, transparent)",
            }}
          />
        ))}
      </div>

      {/* Every window lit, shuttered open from the centre. */}
      <div ref={climax} className="pointer-events-none absolute inset-0 z-20" style={{ opacity: 0 }} aria-hidden="true">
        <Image src="/images/devfest/facade-full-wide.jpg" alt="" fill sizes="100vw" className="hidden object-cover md:block" />
        <Image src="/images/devfest/facade-full-tall.jpg" alt="" fill sizes="100vw" className="object-cover md:hidden" />
      </div>
    </StickyStage>
  );
}
