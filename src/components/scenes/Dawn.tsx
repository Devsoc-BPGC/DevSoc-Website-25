"use client";

/**
 * 10 Dawn
 * The night gives way. The list is out, and the questions get answered.
 *
 * The coordinators ended with the light laid flat along the bottom of the
 * frame; this scene starts on it. It rises, and the sky comes up behind it:
 * warm at the horizon first, blue overhead in the hour before it is day, then
 * bone. It is the one change of ground on the site, done as a sunrise rather
 * than a switch, and it is continuous, so scrolling back up puts the night
 * back.
 *
 * When the sky is light the news is set in it, with the way to the full list
 * printed on a strip torn off the roll. Then the page carries on down, on the
 * paper-coloured ground, into the questions: numbered, because they are a
 * list, one open at a time, each answer a note with a marker bracket, and the
 * open one's number circled the way the calendar circles today.
 *
 * Progress (the sunrise):
 *   0.00 - 0.70   the light rises and the sky comes up
 *   0.45 - 0.75   the news
 *   0.62 - 0.80   the light burns off, leaving the horizon as a rule
 */

import { useCallback, useId, useRef, useState } from "react";
import { Scene } from "@/components/world/Scene";
import { Light, span, type LightPoint } from "@/components/world/Light";
import { HORIZON_AT } from "@/components/scenes/Coordinators";
import { useReducedMotion } from "@/lib/useMedia";
import { dawn, faq } from "@/content/home";

const ease = (t: number) => t * t * (3 - 2 * t);

/** Where the horizon ends up. */
const RISEN = 0.66;
const HORIZON: LightPoint[] = [
  [0, HORIZON_AT],
  [1, HORIZON_AT],
];

/** The way to the full list, on a strip torn off the roll: feed holes, dot-matrix, a ragged tear either end. */
function RollStrip() {
  return (
    <a
      href={dawn.link.href}
      data-cursor="Go"
      className="group relative inline-block -rotate-2 transition-transform duration-700 ease-[var(--ease-out-expo)] hover:-rotate-1 focus-visible:-rotate-1"
      style={{ filter: "drop-shadow(0 1px 1px rgb(13 14 12 / 0.35)) drop-shadow(0 8px 12px rgb(13 14 12 / 0.22))" }}
    >
      <span
        className="fanfold block px-[3.6rem] py-4 shadow-none!"
        style={{
          clipPath:
            "polygon(0 6%, 2% 0, 5% 9%, 8% 1%, 11% 7%, 14% 0, 100% 0, 98% 8%, 100% 16%, 97% 30%, 100% 44%, 98% 58%, 100% 72%, 97% 86%, 100% 100%, 86% 94%, 83% 100%, 0 100%, 2% 88%, 0 74%, 3% 60%, 0 46%, 2% 32%, 0 18%)",
        }}
      >
        <span className="dotmatrix flex items-center gap-4 whitespace-nowrap text-[1.05rem] font-semibold uppercase tracking-[0.04em] text-[var(--c-ink)]">
          {dawn.link.label}
          <span aria-hidden="true" className="relative block h-px w-9 bg-current transition-[width] duration-700 ease-[var(--ease-out-expo)] group-hover:w-14">
            <span className="absolute -right-px top-1/2 block h-[7px] w-[7px] -translate-y-1/2 rotate-45 border-r border-t border-current" />
          </span>
        </span>
      </span>
    </a>
  );
}

function News() {
  return (
    <div className="text-center">
      <h2 id="dawn-title" className="display mx-auto max-w-[16ch] text-[clamp(3rem,7.2vw,7rem)] leading-[0.86] text-[var(--c-ink)]">
        {dawn.headline}
      </h2>
      <p className="mx-auto mt-5 max-w-[44ch] text-[clamp(1rem,1.25vw,1.2rem)] leading-[1.55] text-[var(--c-ink)]/80">{dawn.line}</p>
      <div className="mt-8">
        <RollStrip />
      </div>
    </div>
  );
}

/** The questions: one open at a time. */
function Questions() {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();
  return (
    <section aria-labelledby={`${id}-title`} className="lit relative px-[var(--gutter)] pb-[16vh] pt-[10vh]">
      <div className="mx-auto grid max-w-[80rem] gap-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-[6vw]">
        <div className="lg:sticky lg:top-[14vh] lg:self-start">
          <h2 id={`${id}-title`} className="display text-[clamp(3.2rem,7vw,6.5rem)] leading-[0.84] text-[var(--c-ink)]">
            {dawn.questions.title}
          </h2>
          <p className="mt-5 max-w-[34ch] text-[1.05rem] leading-[1.6] text-[var(--c-ink)]/80">{dawn.questions.line}</p>
        </div>

        <ol className="border-t border-[var(--c-ink)]/25">
          {faq.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={f.q} className="border-b border-[var(--c-ink)]/25">
                <h3>
                  <button
                    type="button"
                    id={`${id}-q${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`${id}-a${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="group flex w-full items-start gap-5 py-6 text-left md:gap-8"
                  >
                    {/* The number, circled in marker when it is the open one. */}
                    <span className="relative mt-[0.35em] w-[2.4rem] shrink-0 text-center">
                      <span className="meta text-[0.85rem] tabular-nums text-[var(--c-blue)]">{String(i + 1).padStart(2, "0")}</span>
                      <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute -inset-x-2 -inset-y-3 h-[calc(100%+1.5rem)] w-[calc(100%+1rem)] overflow-visible">
                        <path
                          d="M62 8 C 26 2, 4 22, 8 52 C 12 82, 52 96, 80 80 C 100 66, 98 30, 76 14 C 64 6, 48 6, 36 10"
                          pathLength={1}
                          fill="none"
                          stroke="var(--c-blue)"
                          strokeWidth={2.4}
                          strokeLinecap="round"
                          vectorEffect="non-scaling-stroke"
                          className="transition-[stroke-dashoffset] duration-700 ease-[var(--ease-out-expo)]"
                          style={{ strokeDasharray: 1, strokeDashoffset: isOpen ? 0 : 1 }}
                        />
                      </svg>
                    </span>
                    <span className="display flex-1 text-[clamp(1.7rem,3vw,3rem)] leading-[0.92] text-[var(--c-ink)] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5">
                      {f.q}
                    </span>
                  </button>
                </h3>
                <div
                  id={`${id}-a${i}`}
                  role="region"
                  aria-labelledby={`${id}-q${i}`}
                  className="grid transition-[grid-template-rows] duration-700 ease-[var(--ease-out-expo)]"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  inert={!isOpen}
                >
                  <div className="overflow-hidden">
                    {/* The answer, as a note in the margin with a marker bracket. */}
                    <div className="flex gap-4 pb-8 pl-[3.65rem] md:pl-[4.4rem]">
                      <svg aria-hidden="true" viewBox="0 0 12 100" preserveAspectRatio="none" className="h-auto w-3 shrink-0 self-stretch overflow-visible">
                        <path
                          d="M11 2 C 4 2, 3 4, 3 12 L 3 88 C 3 96, 4 98, 11 98"
                          pathLength={1}
                          fill="none"
                          stroke="var(--c-blue)"
                          strokeWidth={2.4}
                          strokeLinecap="round"
                          vectorEffect="non-scaling-stroke"
                          className="transition-[stroke-dashoffset] delay-150 duration-1000 ease-[var(--ease-out-expo)]"
                          style={{ strokeDasharray: 1, strokeDashoffset: isOpen ? 0 : 1 }}
                        />
                      </svg>
                      <p className="max-w-[52ch] text-[clamp(1rem,1.2vw,1.15rem)] leading-[1.6] text-[var(--c-ink)]/85">{f.a}</p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export function Dawn() {
  const reduced = useReducedMotion();
  return (
    <>
      {reduced ? (
        <Scene id="dawn" aria-labelledby="dawn-title" stageClassName="lit grid place-items-center px-[var(--gutter)] py-[14vh]">
          <News />
        </Scene>
      ) : (
        <MovingDawn />
      )}
      <Questions />
    </>
  );
}

function MovingDawn() {
  const root = useRef<HTMLDivElement>(null);
  const rise = useRef<HTMLDivElement>(null);
  const news = useRef<HTMLDivElement>(null);

  const onProgress = useCallback((p: number) => {
    const el = root.current;
    if (!el) return;
    // The sun: one number for the sky, the ground and where the horizon is.
    // Overhead the night goes to the blue hour first, then to day; at the
    // horizon it goes straight to warm paper, ahead of the rest of the sky.
    const sun = ease(span(p, 0.02, 0.7));
    el.style.setProperty("--blue-hour", Math.min(1, sun * 2.2).toFixed(4));
    el.style.setProperty("--day", span(sun, 0.42, 1).toFixed(4));
    el.style.setProperty("--glow", Math.min(1, sun * 1.8).toFixed(4));
    el.style.setProperty("--sun", sun.toFixed(4));
    const y = HORIZON_AT + (RISEN - HORIZON_AT) * ease(span(p, 0, 0.62));
    el.style.setProperty("--horizon", `${(y * 100).toFixed(3)}%`);
    rise.current?.style.setProperty("transform", `translate3d(0, ${((y - HORIZON_AT) * 100).toFixed(3)}%, 0)`);
    const n = span(p, 0.45, 0.72);
    news.current?.style.setProperty("opacity", n.toFixed(3));
    news.current?.style.setProperty("transform", `translate3d(0, ${((1 - ease(n)) * 24).toFixed(1)}px, 0)`);
    el.style.setProperty("--rule", span(p, 0.6, 0.78).toFixed(3));
  }, []);

  const lightOn = useCallback((p: number) => 1 - span(p, 0.62, 0.8), []);

  return (
    <Scene id="dawn" vh={300} vhMobile={240} settled={0.9} onProgress={onProgress} aria-labelledby="dawn-title">
      <div
        ref={root}
        className="absolute inset-0"
        style={{
          // The sky: warm at the horizon ahead of the rest, blue overhead in
          // the hour before it is day.
          background:
            "linear-gradient(to top, color-mix(in oklab, var(--c-bone) calc(var(--day, 0) * 100%), color-mix(in oklab, var(--c-paper) calc(var(--glow, 0) * 100%), var(--c-ink-2))) calc(100% - var(--horizon, 90%)), color-mix(in oklab, var(--c-bone) calc(var(--day, 0) * 100%), color-mix(in oklab, color-mix(in oklab, var(--c-blue) 42%, var(--c-ink)) calc(var(--blue-hour, 0) * 100%), var(--c-ink))) 100%)",
        }}
      >
        {/* The ground, under the horizon: darker than the sky until the end. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0"
          style={{
            top: "var(--horizon, 90%)",
            background: "color-mix(in oklab, var(--c-bone) calc(var(--day, 0) * 100%), color-mix(in oklab, var(--c-steel) calc(var(--glow, 0) * 45%), var(--c-ink)))",
          }}
        />
        {/* The horizon itself, once the light has burnt off: a rule. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-[var(--gutter)] h-px bg-[var(--c-ink)]"
          style={{ top: "var(--horizon, 90%)", opacity: "calc(var(--rule, 0) * 0.35)" }}
        />
        <div ref={rise} className="absolute inset-0">
          <Light points={HORIZON} kind="horizon" intensity={lightOn} />
        </div>

        {/* The news, set in the sky. */}
        <div ref={news} className="absolute inset-x-[var(--gutter)] bottom-[calc(100%-var(--horizon,90%)+6vh)]" style={{ opacity: 0 }}>
          <News />
        </div>
      </div>
    </Scene>
  );
}
