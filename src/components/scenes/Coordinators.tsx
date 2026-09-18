"use client";

/**
 * 09 The coordinators
 * This year's call sheet: seven people, one at a time, on the stage.
 *
 * DevFest ended with its poster down and the title stencilled on the wall
 * behind it; this scene starts on that frame. The title goes up to the corner
 * as the head of the call sheet, the list of the seven comes up under it, and
 * then each of them takes the stage in turn.
 *
 * Whoever is on stands in the middle with their name behind them at poster
 * scale. Where the letters cross them they turn to outline, so the name reads
 * as one word and the person is never covered: the name is drawn twice, solid
 * behind the portrait and outlined over it, the outline clipped to the
 * portrait's own frame. Their role, their rooms and their link are read out on
 * the right, and their line on the call sheet is lit, with the light run down
 * the sheet to it.
 *
 * At the end the stage empties and the light is laid flat along the bottom of
 * the frame, which is where the next scene's horizon is.
 *
 * Progress:
 *   0.00 - 0.10   the title goes up; the call sheet comes up under it
 *   0.10 - 0.92   seven people, one after another
 *   0.92 - 1.00   the stage empties; the light lies down as a horizon
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { useLenis } from "lenis/react";
import { Scene } from "@/components/world/Scene";
import { Light, span, type LightPoint } from "@/components/world/Light";
import { RoomPlate } from "@/components/world/Label";
import { ActionLink } from "@/components/world/ActionLink";
import { CrewTitle, crewTitleAt } from "@/components/world/CrewTitle";
import { useReducedMotion } from "@/lib/useMedia";
import { crew, crewCopy, rooms, type CrewMember } from "@/content/home";

const ease = (t: number) => t * t * (3 - 2 * t);

const SHEET_TO = 0.1;
const CAST_FROM = 0.1;
const CAST_TO = 0.92;
const N = crew.length;
const each = (CAST_TO - CAST_FROM) / N;

/** Where the next scene's horizon lies, as a share of the frame. */
export const HORIZON_AT = 0.9;
const HORIZON: LightPoint[] = [
  [0, HORIZON_AT],
  [1, HORIZON_AT],
];

/**
 * Person `i`'s share of the stage at progress `p`: on across the middle of
 * their stretch, and gone before the next comes on, so two names are never
 * on the wall at once.
 */
function weightOf(p: number, i: number) {
  const k = (p - CAST_FROM) / each;
  const w = Math.max(0, Math.min(1, (0.5 - Math.abs(k - i - 0.5)) * 7));
  // The first is already on as the sheet comes up; the last leaves with the stage.
  if (i === 0 && p < CAST_FROM + each * 0.5) return span(p, SHEET_TO * 0.6, CAST_FROM + 0.01);
  if (i === N - 1 && p > CAST_TO - each * 0.5) return 1 - span(p, CAST_TO - 0.01, CAST_TO + 0.03);
  return w;
}

const progressFor = (i: number) => CAST_FROM + (i + 0.5) * each;

const nameLines = (name: string) => name.toUpperCase().split(" ");

const roomNames = (numbers: string[]) => numbers.map((n) => rooms.find((r) => r.number === n)).filter((r) => !!r);

/** The name at poster scale. Rendered twice per person: solid behind, outlined over the portrait. */
function Name({ person, outline = false }: { person: CrewMember; outline?: boolean }) {
  return (
    <p
      aria-hidden="true"
      className="display text-center text-[clamp(5rem,15.5vw,16rem)] leading-[0.8]"
      style={
        outline
          ? { color: "transparent", WebkitTextStroke: "1.5px color-mix(in srgb, var(--c-bone) 80%, transparent)" }
          : { color: "color-mix(in srgb, var(--c-bone) 92%, transparent)" }
      }
    >
      {nameLines(person.name).map((l) => (
        <span key={l} className="block">
          {l}
        </span>
      ))}
    </p>
  );
}

function Details({ person }: { person: CrewMember }) {
  const heads = roomNames(person.rooms);
  return (
    <>
      <p className="meta text-[0.8rem] text-[var(--c-gray)]">{person.coordinator ? crewCopy.sheet : crewCopy.heads}</p>
      <h3 className="display mt-2 text-[clamp(1.8rem,2.6vw,2.8rem)] leading-[0.9] text-[var(--c-bone)]">{person.role}</h3>
      <p className="mt-2 text-[1.05rem] text-[var(--c-bone)]/85">{person.name}</p>
      {heads.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {heads.map((r) => (
            <RoomPlate key={r.id} number={r.number} name={r.name} />
          ))}
        </div>
      ) : null}
      <div className="mt-5">
        <ActionLink href={person.link} className="text-[1rem] text-[var(--c-bone)]" cursor={crewCopy.profile}>
          <span>
            {crewCopy.profile}
            <span className="sr-only">{`: ${person.name}`}</span>
          </span>
        </ActionLink>
      </div>
    </>
  );
}

export function Coordinators() {
  const reduced = useReducedMotion();
  if (reduced) return <StillCoordinators />;
  return <MovingCoordinators />;
}

function MovingCoordinators() {
  const root = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLDivElement>(null);
  const titleSmall = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLOListElement>(null);
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const names = useRef<(HTMLDivElement | null)[]>([]);
  const portraits = useRef<(HTMLDivElement | null)[]>([]);
  const details = useRef<(HTMLDivElement | null)[]>([]);
  const lenis = useLenis();
  const [cable, setCable] = useState<LightPoint[]>([]);
  const rowAt = useRef<number[]>([]);
  const last = useRef(0);
  const apply = useRef<(p: number) => void>(() => {});
  const titleAt = crewTitleAt();

  useEffect(() => {
    const measure = () => {
      const el = root.current;
      const s = sheet.current;
      if (!el || !s) return;
      const H = el.offsetHeight;
      const W = el.offsetWidth;
      // The light runs down the left of the call sheet, from its head to its foot.
      const r = s.getBoundingClientRect();
      const e = el.getBoundingClientRect();
      const x = (r.left - e.left - 14) / W;
      const top = (r.top - e.top) / H;
      const bottom = (r.bottom - e.top) / H;
      setCable([
        [x, top],
        [x, bottom],
      ]);
      rowAt.current = rows.current.map((row) => (row ? (row.getBoundingClientRect().top + row.offsetHeight / 2 - r.top) / r.height : 0));
      requestAnimationFrame(() => apply.current(last.current));
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const onProgress = useCallback((p: number) => {
    last.current = p;
    const el = root.current;
    if (!el) return;

    // The stencilled title hands over to the head of the call sheet.
    const up = ease(span(p, 0.01, SHEET_TO));
    title.current?.style.setProperty("opacity", (1 - span(p, 0.02, 0.06)).toFixed(3));
    title.current?.style.setProperty("scale", (1 - up * 0.12).toFixed(4));
    titleSmall.current?.style.setProperty("opacity", span(p, 0.05, SHEET_TO).toFixed(3));
    el.style.setProperty("--sheet", (span(p, 0.04, SHEET_TO) * (1 - span(p, CAST_TO, CAST_TO + 0.04))).toFixed(3));
    el.style.setProperty("--stage", (1 - span(p, CAST_TO, CAST_TO + 0.04)).toFixed(3));

    crew.forEach((_, i) => {
      const w = weightOf(p, i);
      const drift = ((p - progressFor(i)) / each) * -18;
      const n = names.current[i];
      const pt = portraits.current[i];
      const d = details.current[i];
      if (n) {
        n.style.setProperty("opacity", w.toFixed(3));
        // A transform, not `translate`: the class already uses that to centre it.
        n.style.setProperty("transform", `translateY(${drift.toFixed(1)}px)`);
      }
      if (pt) {
        pt.style.setProperty("opacity", w.toFixed(3));
        pt.style.setProperty("visibility", w > 0 ? "visible" : "hidden");
        pt.style.setProperty("scale", (1.03 - w * 0.03).toFixed(4));
      }
      if (d) {
        d.style.setProperty("opacity", w.toFixed(3));
        d.style.setProperty("visibility", w > 0.05 ? "visible" : "hidden");
      }
      rows.current[i]?.style.setProperty("--on", w.toFixed(3));
    });
  }, []);

  useEffect(() => {
    apply.current = onProgress;
  }, [onProgress]);

  /** The light is run down the sheet to whoever is on. */
  const drawCable = useCallback((p: number) => {
    const k = Math.max(0, Math.min(N - 1, Math.round((p - CAST_FROM) / each - 0.5)));
    const to = rowAt.current[k] ?? 0;
    return [0, span(p, 0.06, SHEET_TO) * to * (1 - span(p, CAST_TO, CAST_TO + 0.03)) + 0.0001] as const;
  }, []);
  const cableOn = useCallback((p: number) => span(p, 0.05, SHEET_TO) * (1 - span(p, CAST_TO, CAST_TO + 0.03)), []);
  /** Then it lies down along the bottom, from the middle out. */
  const drawHorizon = useCallback((p: number) => {
    const t = ease(span(p, CAST_TO + 0.01, 0.99));
    return [0.5 - t / 2, 0.5 + t / 2] as const;
  }, []);

  const goTo = (i: number) => {
    const sec = document.getElementById("crew");
    if (!sec) return;
    const y = sec.getBoundingClientRect().top + window.scrollY + (sec.offsetHeight - window.innerHeight) * progressFor(i);
    if (lenis) lenis.scrollTo(y, { duration: 1.4 });
    else window.scrollTo({ top: y });
  };

  return (
    <Scene continues id="crew" vh={620} vhMobile={520} settled={progressFor(0)} onProgress={onProgress} aria-labelledby="coordinators-title">
      <div ref={root} className="absolute inset-0">
        {/* Where the last scene left it. */}
        <div
          ref={title}
          aria-hidden="true"
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${titleAt.x * 100}%`, top: `${titleAt.y * 100}%` }}
        >
          <CrewTitle />
        </div>

        {/* The stage: names behind, portraits in front. */}
        <div className="absolute inset-0" style={{ opacity: "var(--stage, 1)" }}>
          {crew.map((person, i) => (
            <div
              key={`name-${person.id}`}
              ref={(n) => {
                names.current[i] = n;
              }}
              className="pointer-events-none absolute inset-x-0 top-[40vh] -translate-y-1/2 max-md:top-[30vh]"
              style={{ opacity: 0 }}
            >
              <Name person={person} />
            </div>
          ))}

          {crew.map((person, i) => (
            <div
              key={`portrait-${person.id}`}
              ref={(n) => {
                portraits.current[i] = n;
              }}
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-1/2 aspect-square h-[76vh] origin-bottom -translate-x-1/2 max-md:bottom-[30vh] max-md:h-auto max-md:w-[92vw]"
              style={{ opacity: 0, visibility: "hidden" }}
            >
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  maskImage: "radial-gradient(62% 64% at 50% 44%, #000 58%, transparent 100%)",
                  WebkitMaskImage: "radial-gradient(62% 64% at 50% 44%, #000 58%, transparent 100%)",
                }}
              >
                <Image src={person.image} alt="" fill sizes="(max-width: 768px) 92vw, 76vh" className="object-cover" />
                {/* The outline of the name, where it crosses them. Placed in
                    frame coordinates so it lies exactly on the solid name. */}
                <div className="absolute left-[calc(50%-50vw)] top-[calc(40vh-24vh)] w-[100vw] -translate-y-1/2 max-md:top-[calc(30vh-(100dvh-30vh-92vw))]">
                  <Name person={person} outline />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* The call sheet. */}
        <div className="absolute left-[var(--gutter)] top-[13vh] w-[min(19rem,24vw)] max-md:hidden" style={{ opacity: "var(--sheet, 0)" }}>
          <div ref={titleSmall} style={{ opacity: 0 }}>
            <p className="meta text-[0.8rem] text-[var(--c-gray)]">{crewCopy.sheet}</p>
            <h2 id="coordinators-title" className="display mt-2 text-[clamp(1.8rem,2.4vw,2.4rem)] leading-[0.9] text-[var(--c-bone)]">
              {crewCopy.title}
            </h2>
          </div>
          <ol ref={sheet} className="mt-6 border-t border-[var(--c-steel)]/40">
            {crew.map((person, i) => (
              <li
                key={person.id}
                ref={(n) => {
                  rows.current[i] = n;
                }}
                className="border-b border-[var(--c-steel)]/40"
                style={{ ["--on" as string]: 0 } as CSSProperties}
              >
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  className="flex w-full items-baseline justify-between gap-3 py-2.5 text-left"
                  style={{ color: "color-mix(in srgb, var(--c-bone) calc(45% + var(--on) * 55%), transparent)" }}
                >
                  <span className="display text-[1.2rem] leading-none">{person.name}</span>
                  <span className="meta shrink-0 text-[0.72rem]" style={{ color: "color-mix(in srgb, var(--c-blue) calc(55% + var(--on) * 45%), var(--c-gray))" }}>
                    {person.rooms.length ? person.rooms.join(" ") : person.role}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
        {cable.length ? <Light points={cable} kind="cable" sag={0} draw={drawCable} intensity={cableOn} /> : null}

        {/* Whoever is on, read out. */}
        <div className="absolute bottom-[12vh] right-[var(--gutter)] w-[min(20rem,24vw)] max-md:bottom-[6vh] max-md:left-[var(--gutter)] max-md:w-auto">
          {crew.map((person, i) => (
            <div
              key={`details-${person.id}`}
              ref={(n) => {
                details.current[i] = n;
              }}
              className="absolute inset-x-0 bottom-0"
              style={{ opacity: 0, visibility: "hidden" }}
            >
              <Details person={person} />
            </div>
          ))}
        </div>

        <Light points={HORIZON} kind="horizon" draw={drawHorizon} />
      </div>
    </Scene>
  );
}

/** Reduced motion: the call sheet, with everyone on it at once. */
function StillCoordinators() {
  return (
    <Scene id="crew" aria-labelledby="coordinators-title" stageClassName="px-[var(--gutter)] py-[12vh]">
      <p className="meta text-[0.8rem] text-[var(--c-gray)]">{crewCopy.sheet}</p>
      <h2 id="coordinators-title" className="display mt-2 text-[clamp(2.6rem,6vw,5.8rem)] leading-[0.85] text-[var(--c-bone)]">
        {crewCopy.title}
      </h2>
      <p className="body-copy mt-4 max-w-[48ch]">{crewCopy.line}</p>
      <ul className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {crew.map((person) => (
          <li key={person.id}>
            <div className="relative aspect-square w-full overflow-hidden">
              <Image src={person.image} alt={person.name} fill sizes="(max-width: 640px) 90vw, 22vw" className="object-cover" />
            </div>
            <div className="mt-4">
              <Details person={person} />
            </div>
          </li>
        ))}
      </ul>
    </Scene>
  );
}
