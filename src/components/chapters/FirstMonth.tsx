"use client";

/**
 * First Month
 * The question the reader actually arrived with, answered in second person,
 * which no other section on the site uses.
 *
 * This was a column of five text blocks with a plate parked in the corner
 * beside two of them, and it read as a blog post: no scale, no composition,
 * half the frame empty, and an alternating-sides mechanic that never showed
 * because both sides started at the same gutter. A month is a sequence, and a
 * sequence printed as five stacked paragraphs is just reading.
 *
 * So the month is a stack of five bands filling one screen, and scroll opens
 * them one at a time. The open week takes most of the height and shows its
 * plate full bleed with the writing over it; the other four are compressed to
 * strips carrying just their label and title. You can always see the whole
 * month at once and exactly where in it you are, which is the thing the old
 * version could not do at any scroll position.
 *
 * Widths are flex-grow rather than heights, so the bands share the space
 * without any of them needing to know how tall the stage is, and one write per
 * frame moves the whole stack. The openness curve is smooth and overlapping, so
 * bands trade height continuously as you scrub instead of stepping between
 * states: at any moment one band is mostly open and its neighbours are on their
 * way in or out.
 *
 * The plate is the ground of the band rather than a picture inside it, which is
 * what stops it reading as a floating rectangle, and it is why every week needs
 * one: a bandless week would look like a bug.
 *
 * Reduced motion gets the plain stack, every week open and readable, because
 * the whole mechanic here is height and there is nothing to fall back to.
 */

import Image from "next/image";
import { useCallback, useRef } from "react";
import Link from "next/link";
import { StickyStage } from "@/components/motion/StickyStage";
import { RevealChars } from "@/components/motion/text";
import { useReducedMotion } from "@/lib/useMedia";
import { weeks, inductionClose } from "@/content/induction";

/**
 * How much taller the open band is than a closed one. At this value the open
 * week takes a little over half the stack and the other four split the rest,
 * which is enough for a paragraph without squeezing the strips into a rule.
 */
const SPREAD = 4.2;

/** How wide each week's turn is, as a share of the scroll. */
const STEP = 1 / weeks.length;

/**
 * How open band `i` is at progress `p`. A gaussian rather than a window, so
 * bands hand height to each other continuously and nothing snaps.
 *
 * Progress is remapped onto the band centres first: without that the first and
 * last weeks would only ever be half open, since their centres sit a half step
 * inside the range.
 */
function openness(p: number, i: number) {
  const first = STEP / 2;
  const q = first + Math.min(1, Math.max(0, p)) * (1 - STEP);
  const x = (q - (i + 0.5) * STEP) / STEP;
  return Math.exp(-x * x * 2.6);
}

/**
 * Everything here reads `--open` off the band rather than taking it as a prop.
 * The scroll handler writes that one variable per band per frame, so the plate,
 * the lit edge, the title weight and the paragraph all follow without React
 * rendering anything: a prop would only ever hold the value it had at mount.
 */
function Band({ week }: { week: (typeof weeks)[number] }) {
  return (
    <>
      {/* The ground of the band. */}
      <div className="absolute inset-0" style={{ opacity: "var(--open)" }} aria-hidden="true">
        <Image src={week.image} alt="" fill sizes="100vw" className="object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, var(--bg-base) 6%, color-mix(in oklch, var(--bg-base) 78%, transparent) 46%, color-mix(in oklch, var(--bg-base) 30%, transparent) 100%)",
          }}
        />
      </div>

      {/* The lit edge, the same one the questions use for the open door. */}
      <div
        className="absolute inset-y-0 left-0 w-px origin-center bg-warm"
        style={{ opacity: "var(--open)", transform: "scaleY(var(--open))" }}
        aria-hidden="true"
      />

      {/* The label column is fixed width so the titles line up down the stack.
          It stays narrow on a phone: at the desktop width it took a third of
          the screen and squeezed the paragraph to under thirty characters. */}
      <div className="relative flex h-full items-center gap-3 pl-4 pr-3 sm:gap-10 sm:pl-9 sm:pr-4">
        <p className="meta w-[3.25rem] shrink-0 text-warm sm:w-[6rem]">{week.label}</p>
        <div className="min-w-0">
          <h3
            className="voice text-[clamp(1.35rem,2.6vw,2.5rem)] leading-[1.1]"
            style={{ color: "color-mix(in oklch, var(--text-primary) calc(52% + var(--open) * 48%), transparent)" }}
          >
            {week.title}
          </h3>
          {/* The paragraph has to give up its *height* when the band closes,
              not just its opacity. Left in the flow at full height it pushes
              the title up out of a strip that is only tall enough for one line,
              so every closed week showed a title sliced through the middle. */}
          <p
            className="body-copy max-w-[52ch] overflow-hidden"
            style={{
              opacity: "calc(var(--open) * 1.6 - 0.6)",
              maxHeight: "calc(var(--open) * 26vh)",
              marginTop: "calc(var(--open) * 1rem)",
            }}
          >
            {week.body}
          </p>
        </div>
      </div>
    </>
  );
}

export function FirstMonth() {
  const bands = useRef<(HTMLLIElement | null)[]>([]);
  const reduced = useReducedMotion();

  const onProgress = useCallback((p: number) => {
    for (let i = 0; i < weeks.length; i++) {
      const node = bands.current[i];
      if (!node) continue;
      const open = openness(p, i);
      node.style.flexGrow = String(1 + SPREAD * open);
      node.style.setProperty("--open", open.toFixed(4));
    }
  }, []);

  const heading = (
    <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-b border-rule/25 pb-5">
      <RevealChars as="h2" id="month-title" hold className="display text-[clamp(1.3rem,2.4vw,2.2rem)] text-primary">
        Your first month, honestly
      </RevealChars>
      <p className="meta text-muted">Second person, because it is about you</p>
    </div>
  );

  if (reduced) {
    return (
      <section id="first-month" data-tone="ground" className="gutter relative py-[14vh]" aria-labelledby="month-title">
        {heading}
        <ol className="mt-10 flex flex-col">
          {weeks.map((w) => (
            <li
              key={w.label}
              className="relative min-h-[34vh] border-t border-rule/20"
              style={{ ["--open" as string]: 1 }}
            >
              <Band week={w} />
            </li>
          ))}
        </ol>
        <Coda />
      </section>
    );
  }

  return (
    <section id="first-month" data-tone="ground" aria-labelledby="month-title">
      <StickyStage
        vh={440}
        vhMobile={320}
        tone="ground"
        settled={0}
        onProgress={onProgress}
        stageClassName="flex flex-col"
      >
        <div className="gutter pt-[14vh]">{heading}</div>

        <ol className="mt-6 flex min-h-0 flex-1 flex-col gutter pb-[8vh]">
          {weeks.map((w, i) => (
            <li
              key={w.label}
              ref={(n) => {
                bands.current[i] = n;
              }}
              className="relative overflow-hidden border-t border-rule/20 last:border-b"
              style={{ flexBasis: 0, flexGrow: 1 + SPREAD * openness(0, i), ["--open" as string]: openness(0, i) }}
            >
              <Band week={w} />
            </li>
          ))}
        </ol>
      </StickyStage>

      <div className="gutter">
        <Coda />
      </div>
    </section>
  );
}

/** The line the whole section is arguing toward. */
function Coda() {
  return (
    <div className="border-t border-rule/25 py-[12vh]">
      <p className="voice max-w-[26ch] text-[clamp(1.5rem,3vw,2.8rem)] leading-[1.12] text-primary">{inductionClose}</p>
      <p className="meta mt-8 text-muted">
        <Link href="/#dawn" className="text-link text-primary/80 hover:text-primary" data-cursor="Go">
          The questions people ask before they walk in
        </Link>
      </p>
    </div>
  );
}
