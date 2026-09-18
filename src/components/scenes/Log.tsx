"use client";

/**
 * 05 The Log
 * Six things that shipped, printed and pinned to a wall.
 *
 * The night shift ended with the camera inside a screen gone dark; the lights
 * come up on an archive wall. Every project is a real screenshot printed on
 * grid paper, torn off the pad and pinned, with an index card stuck to it that
 * says what it is and which room made it. One lit cable runs pin to pin along
 * the wall, and it lights ahead of you as the camera tracks along.
 *
 * Any sheet can be taken off the wall: click it, or Enter on it, and it comes
 * to you, squared up and large, with its card read out beside it. Escape, the
 * card's own button, or scrolling on puts it back where it was. It is the same
 * sheet the whole time, moved, not a copy in a modal.
 *
 * At the end of the wall a folded sheet is pinned up: your first month. It is
 * taken down and brought forward to where the next scene hangs it as a
 * calendar, while the rest of the wall falls back into the dark.
 *
 * Positions are in wall units (`u`), a share of the frame's height capped by
 * its width, so the wall is the same wall on a phone, only smaller.
 *
 * Progress:
 *   0.00 - 0.05   the lights come up
 *   0.10 - 0.88   the camera tracks along the wall
 *   0.90 - 1.00   the folded sheet comes forward
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLenis } from "lenis/react";
import { gsap } from "@/lib/gsap";
import { Scene } from "@/components/world/Scene";
import { Light, span, type LightPoint } from "@/components/world/Light";
import { MonthCover, PAGE_RATIO, PAGE_TILT, monthPageRect } from "@/components/world/MonthPage";
import { Paper } from "@/components/world/Paper";
import { Tape } from "@/components/world/Tape";
import { ActionLink } from "@/components/world/ActionLink";
import type { TearSides } from "@/components/world/tornEdge";
import { useReducedMotion } from "@/lib/useMedia";
import { log, projects, rooms, type Project } from "@/content/home";

const ease = (t: number) => t * t * (3 - 2 * t);

const TRACK_FROM = 0.1;
const TRACK_TO = 0.88;
const PUSH_FROM = 0.9;

type Pin = { id: string; x: number; y: number; w: number; r: number; tear: TearSides; seed: number };

/** Where each sheet is pinned: x and width in wall units, y as a share of the frame's height. */
const PINS: Pin[] = [
  { id: "waves-web", x: 86, y: 0.5, w: 58, r: -1.6, tear: "bottom", seed: 3 },
  { id: "class-sync", x: 152, y: 0.42, w: 46, r: 2.1, tear: "top", seed: 7 },
  { id: "devfest-site", x: 214, y: 0.56, w: 54, r: -2.2, tear: "both", seed: 11 },
  { id: "waves-app", x: 278, y: 0.42, w: 50, r: 1.5, tear: "bottom", seed: 5 },
  { id: "maestro", x: 338, y: 0.58, w: 44, r: -1.1, tear: "top", seed: 13 },
  { id: "csa-times", x: 398, y: 0.45, w: 50, r: 2.4, tear: "both", seed: 17 },
];
/** The folded schedule at the end of the wall, and the tab before it. */
const FOLDED = { x: 482, y: 0.5, w: 30 };
const TAB = { x: 442, y: 0.8 };
const MARGIN = 0.05;

const sheets = PINS.map((pin) => {
  const project = projects.find((p) => p.id === pin.id) as Project;
  return { pin, project, room: roomFor(project.vertical) };
});

function roomFor(vertical: string) {
  return rooms.find((r) => r.name.toLowerCase().startsWith(vertical.toLowerCase()));
}

function unitFor(W: number, H: number) {
  return Math.min(H / 100, W / 75);
}

/** A sheet's height in wall units: the print plus its paper margin. */
function sheetH(pin: Pin, p: Project) {
  const inner = pin.w * (1 - MARGIN * 2);
  return (inner * p.height) / p.width + pin.w * MARGIN * 2;
}

/** How far the wall has moved at progress `p`, in pixels. */
function travelAt(p: number, u: number, W: number) {
  const end = FOLDED.x * u - W / 2;
  return span(p, TRACK_FROM, TRACK_TO) * end;
}

export function Log() {
  const reduced = useReducedMotion();
  if (reduced) return <StillLog />;
  return <MovingLog />;
}

function MovingLog() {
  const camera = useRef<HTMLDivElement>(null);
  const wall = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLDivElement>(null);
  const shade = useRef<HTMLDivElement>(null);
  const recede = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const putBackButton = useRef<HTMLButtonElement>(null);
  const lifts = useRef<(HTMLDivElement | null)[]>([]);
  const turns = useRef<(HTMLDivElement | null)[]>([]);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const lenis = useLenis();

  const [cable, setCable] = useState<LightPoint[]>([]);
  const [held, setHeld] = useState<number | null>(null);
  const heldRef = useRef<number | null>(null);
  const heldAt = useRef(0);
  const frame = useRef({ W: 1, H: 1, u: 1 });
  const last = useRef(0);
  const apply = useRef<(p: number) => void>(() => {});

  useEffect(() => {
    const measure = () => {
      const c = camera.current;
      if (!c) return;
      const W = c.offsetWidth;
      const H = c.offsetHeight;
      const u = unitFor(W, H);
      frame.current = { W, H, u };
      const wallW = FOLDED.x * u + W / 2 + 40;
      if (wall.current) {
        wall.current.style.width = `${wallW}px`;
        wall.current.style.setProperty("--u", `${u}px`);
      }
      if (back.current) back.current.style.width = `${wallW}px`;

      // The cable, pin to pin, from the wall's left edge to the folded sheet.
      const pts: LightPoint[] = [[0, 0.16]];
      sheets.forEach(({ pin, project }) => {
        const top = pin.y * H - (sheetH(pin, project) * u) / 2 + u * 1.2;
        pts.push([(pin.x * u) / wallW, top / H]);
      });
      pts.push([(TAB.x * u) / wallW, 0.3]);
      pts.push([(FOLDED.x * u) / wallW, (FOLDED.y * H - (FOLDED.w * PAGE_RATIO * u) / 2 + FOLDED.w * 0.04 * u) / H]);
      setCable(pts);
      requestAnimationFrame(() => apply.current(last.current));
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const putBack = useCallback((returnFocus = false) => {
    const i = heldRef.current;
    if (i === null) return;
    heldRef.current = null;
    const lift = lifts.current[i];
    const turn = turns.current[i];
    const pin = PINS[i];
    gsap.to(lift, { x: 0, y: 0, scale: 1, duration: 0.9, ease: "expo.inOut", overwrite: true });
    gsap.to(turn, { rotation: pin.r, duration: 0.9, ease: "expo.inOut", overwrite: true });
    gsap.to(cards.current[i], { opacity: 1, duration: 0.6, delay: 0.5, ease: "power2.out", overwrite: true });
    gsap.to(shade.current, { opacity: 0, duration: 0.7, ease: "power2.out", overwrite: true });
    gsap.to(panel.current, {
      opacity: 0,
      y: 16,
      duration: 0.5,
      ease: "power2.in",
      overwrite: true,
      onComplete: () => setHeld((h) => (h === i ? null : h)),
    });
    const b = buttons.current[i];
    if (b) {
      gsap.set(b, { zIndex: 20, delay: 0.9 });
      if (returnFocus) b.focus({ preventScroll: true });
    }
  }, []);

  const pickUp = useCallback(
    (i: number) => {
      if (heldRef.current === i) return putBack(true);
      if (heldRef.current !== null) putBack();
      const lift = lifts.current[i];
      const b = buttons.current[i];
      if (!lift || !b) return;
      const { W, H, u } = frame.current;
      const { pin, project } = sheets[i];
      const travel = travelAt(last.current, u, W);
      // Where the sheet is now, on the frame, and where a hand would hold it.
      const cx = pin.x * u - travel;
      const cy = pin.y * H;
      const w = pin.w * u;
      const h = sheetH(pin, project) * u;
      const narrow = W < 768;
      const tx = narrow ? W / 2 : W * 0.36;
      const ty = narrow ? H * 0.34 : H * 0.5;
      const s = Math.min(narrow ? (W * 0.92) / w : (W * 0.56) / w, narrow ? (H * 0.46) / h : (H * 0.74) / h, 2.6);

      heldRef.current = i;
      heldAt.current = last.current;
      setHeld(i);
      gsap.set(b, { zIndex: 60 });
      gsap.to(lift, { x: tx - cx, y: ty - cy, scale: s, duration: 1.1, ease: "expo.out", overwrite: true });
      gsap.to(turns.current[i], { rotation: 0, duration: 1.1, ease: "expo.out", overwrite: true });
      // Its card is read out beside it, so the one stuck to it steps aside.
      gsap.to(cards.current[i], { opacity: 0, duration: 0.4, ease: "power2.out", overwrite: true });
      gsap.to(shade.current, { opacity: 1, duration: 0.8, ease: "power2.out", overwrite: true });
    },
    [putBack],
  );

  // The card comes in once React has put the held project's words in it.
  useEffect(() => {
    if (held === null || heldRef.current !== held) return;
    gsap.fromTo(panel.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.25, ease: "expo.out", overwrite: true });
    putBackButton.current?.focus({ preventScroll: true });
  }, [held]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && heldRef.current !== null) putBack(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [putBack]);

  const onProgress = useCallback(
    (p: number) => {
      last.current = p;
      const { W, H, u } = frame.current;
      const c = camera.current;
      const wl = wall.current;
      if (!c || !wl) return;

      // Scrolling on puts a held sheet back.
      if (heldRef.current !== null && Math.abs(p - heldAt.current) > 0.006) putBack();

      const travel = travelAt(p, u, W);
      wl.style.transform = `translate3d(${(-travel).toFixed(1)}px, 0, 0)`;
      if (back.current) back.current.style.transform = `translate3d(${(-travel * 0.55).toFixed(1)}px, 0, 0)`;
      c.style.opacity = span(p, 0, 0.05).toFixed(3);

      // The folded sheet is taken down and brought forward to where the
      // calendar hangs; the rest of the wall falls back into the dark. It ends
      // exactly on the next scene's first frame.
      const push = ease(span(p, PUSH_FROM, 1));
      recede.current?.style.setProperty("opacity", push.toFixed(3));
      back.current?.style.setProperty("opacity", (1 - push).toFixed(3));
      if (push > 0) {
        const fh = FOLDED.w * PAGE_RATIO * u;
        const cx = FOLDED.x * u - travel;
        const cy = FOLDED.y * H;
        const target = monthPageRect(W, H);
        const z = Math.pow(target.h / fh, push);
        const tx = cx + (target.cx - cx) * push - z * cx;
        const ty = cy + (target.cy - cy) * push - z * cy;
        c.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${z.toFixed(5)})`;
      } else {
        c.style.transform = "";
      }
    },
    [putBack],
  );

  useEffect(() => {
    apply.current = onProgress;
  }, [onProgress]);

  const drawCable = useCallback((p: number) => [0, Math.min(1, 0.22 + span(p, TRACK_FROM, TRACK_TO) * 0.86)] as const, []);
  const cableIntensity = useCallback((p: number) => span(p, 0.02, 0.07) * (1 - span(p, PUSH_FROM, 0.96)), []);

  /** Tabbing to a sheet that is off the frame brings the wall round to it. */
  const bringIntoView = (i: number) => {
    const { W, u } = frame.current;
    const x = PINS[i].x * u - travelAt(last.current, u, W);
    if (x > W * 0.12 && x < W * 0.88) return;
    const end = FOLDED.x * u - W / 2;
    const want = Math.min(1, Math.max(0, (PINS[i].x * u - W / 2) / end));
    const p = TRACK_FROM + want * (TRACK_TO - TRACK_FROM);
    const sec = document.getElementById("log");
    if (!sec) return;
    const y = sec.getBoundingClientRect().top + window.scrollY + (sec.offsetHeight - window.innerHeight) * p;
    if (lenis) lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y });
  };

  const current = held !== null ? sheets[held] : null;

  return (
    <Scene id="log" vh={520} vhMobile={420} settled={0.2} onProgress={onProgress} aria-labelledby="log-title">
      <div ref={camera} className="absolute inset-0 origin-top-left" style={{ opacity: 0 }}>
        {/* The wall behind: a faint pinboard grid, further away, so slower. */}
        <div
          ref={back}
          aria-hidden="true"
          className="absolute inset-y-0 left-0"
          style={{
            backgroundImage:
              "linear-gradient(color-mix(in srgb, var(--c-blue) 9%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--c-blue) 9%, transparent) 1px, transparent 1px)",
            backgroundSize: "6vh 6vh",
            maskImage: "linear-gradient(transparent 4%, #000 22%, #000 80%, transparent 96%)",
            WebkitMaskImage: "linear-gradient(transparent 4%, #000 22%, #000 80%, transparent 96%)",
          }}
        />

        <div ref={wall} className="absolute inset-y-0 left-0">
          <div className="absolute left-[calc(var(--u)*8)] top-[13vh] w-[calc(var(--u)*34)] max-md:top-[11vh]">
            <h2 id="log-title" className="display text-[calc(var(--u)*17)] leading-[0.8] text-[var(--c-bone)]">
              {log.title}
            </h2>
            <p className="mt-[calc(var(--u)*3)] max-w-[30ch] text-[clamp(0.95rem,calc(var(--u)*1.9),1.15rem)] leading-[1.55] text-[var(--c-bone)]/85">
              {log.line}
            </p>
          </div>

          {cable.length ? <Light points={cable} kind="cable" sag={0.07} draw={drawCable} intensity={cableIntensity} /> : null}

          {sheets.map(({ pin, project, room }, i) => {
            const h = sheetH(pin, project);
            return (
              <button
                key={project.id}
                type="button"
                ref={(n) => {
                  buttons.current[i] = n;
                }}
                onClick={() => pickUp(i)}
                onFocus={() => bringIntoView(i)}
                aria-label={`${log.pickUp}: ${project.title}, ${project.year}`}
                aria-pressed={held === i}
                data-cursor={held === i ? log.putBack : log.pickUp}
                className="group absolute text-left"
                style={{
                  left: `calc(var(--u) * ${pin.x - pin.w / 2})`,
                  top: `calc(${pin.y * 100}% - var(--u) * ${h / 2})`,
                  width: `calc(var(--u) * ${pin.w})`,
                  height: `calc(var(--u) * ${h})`,
                  zIndex: 20,
                }}
              >
                <div
                  ref={(n) => {
                    lifts.current[i] = n;
                  }}
                  className="h-full w-full will-change-transform"
                >
                  <div className="h-full w-full transition-[translate] duration-700 ease-[var(--ease-out-expo)] group-hover:-translate-y-2 group-focus-visible:-translate-y-2 group-aria-pressed:translate-y-0">
                    <div
                      ref={(n) => {
                        turns.current[i] = n;
                      }}
                      className="relative h-full w-full"
                      style={{ transform: `rotate(${pin.r}deg)` }}
                    >
                      <Paper tone="grid" tear={pin.tear} seed={pin.seed} className="h-full w-full" innerClassName="p-[5%]">
                        <div className="relative h-full w-full overflow-hidden">
                          <Image
                            src={project.image}
                            alt=""
                            fill
                            sizes="(max-width: 768px) 90vw, 60vw"
                            className="object-cover mix-blend-multiply contrast-[0.96]"
                          />
                        </div>
                      </Paper>
                      {/* The pin. */}
                      <span
                        aria-hidden="true"
                        className="absolute left-1/2 top-[calc(var(--u)*1.2)] block h-[calc(var(--u)*1.1)] w-[calc(var(--u)*1.1)] -translate-x-1/2 -translate-y-1/2 rounded-full"
                        style={{ background: "radial-gradient(circle at 35% 30%, #d8d6d0, #777872 55%, #3a3b38)", boxShadow: "0 2px 3px rgb(13 14 12 / 0.6)" }}
                      />
                      {/* The index card stuck to it. */}
                      <div
                        ref={(n) => {
                          cards.current[i] = n;
                        }}
                        className="absolute -bottom-[calc(var(--u)*3)] right-[-4%] w-[clamp(8.5rem,calc(var(--u)*17),13rem)]"
                        style={{ transform: `rotate(${(-pin.r * 1.3).toFixed(2)}deg)` }}
                      >
                        <Paper tone="bone" className="px-3 pb-2.5 pt-3">
                          <Tape className="-top-2 left-4 h-[1rem]! w-[3.6rem]!" rotate={-6} />
                          {room ? <p className="meta text-[0.7rem] text-[var(--c-blue)]">{`${room.number} ${project.vertical}`}</p> : null}
                          <p className="display mt-1 text-[clamp(1.2rem,calc(var(--u)*2.6),1.8rem)] leading-[0.9] text-[var(--c-ink)]">{project.title}</p>
                          <p className="meta mt-1 text-[0.7rem] text-[var(--c-ink)]/65">{project.year}</p>
                        </Paper>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {/* The tab to the rest of the archive. */}
          <div
            className="absolute"
            style={{ left: `calc(var(--u) * ${TAB.x - 11})`, top: `calc(${TAB.y * 100}% - 2.2rem)`, zIndex: 20 }}
          >
            <Paper tone="warm" rotate={-2} className="px-4 py-3">
              <Tape className="-top-2.5 left-6" rotate={-3} />
              <ActionLink href={log.link.href} className="text-[1rem] text-[var(--c-ink)]">
                {log.link.label}
              </ActionLink>
            </Paper>
          </div>

          {/* When the folded sheet is brought forward, the wall falls back behind it. */}
          <div ref={recede} aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[var(--c-ink)]" style={{ opacity: 0, zIndex: 25 }} />

          {/* The first month, folded in three and pinned up last. */}
          <div
            aria-hidden="true"
            className="absolute"
            style={{
              left: `calc(var(--u) * ${FOLDED.x - FOLDED.w / 2})`,
              top: `calc(${FOLDED.y * 100}% - var(--u) * ${(FOLDED.w * PAGE_RATIO) / 2})`,
              width: `calc(var(--u) * ${FOLDED.w})`,
              height: `calc(var(--u) * ${FOLDED.w * PAGE_RATIO})`,
              rotate: `${PAGE_TILT}deg`,
              zIndex: 30,
            }}
          >
            <MonthCover />
          </div>

          {/* Behind a sheet that has been taken down, the wall goes dim. */}
          <div
            ref={shade}
            aria-hidden="true"
            onClick={() => putBack(true)}
            className="absolute inset-0 bg-[var(--c-ink)]/80"
            style={{ opacity: 0, zIndex: 50, pointerEvents: held === null ? "none" : "auto" }}
          />
        </div>

      </div>

      {/* The card of the sheet in hand. */}
      <div
        ref={panel}
        className="absolute bottom-[5vh] left-[var(--gutter)] right-[var(--gutter)] md:bottom-auto md:left-auto md:right-[5vw] md:top-1/2 md:w-[min(24rem,28vw)] md:-translate-y-1/2"
        style={{ opacity: 0, zIndex: 70, pointerEvents: held === null ? "none" : "auto" }}
        aria-live="polite"
        hidden={held === null}
      >
        {current ? (
          <Paper tone="bone" rotate={-1} className="px-6 pb-5 pt-6">
            <Tape className="-top-2.5 left-10" rotate={-4} />
            <p className="meta text-[0.75rem] text-[var(--c-ink)]/70">
              {current.room ? <span className="text-[var(--c-blue)]">{`${current.room.number} ${current.project.vertical}`}</span> : null}
              {`  ${current.project.year}`}
            </p>
            <h3 className="display mt-2 text-[clamp(2.2rem,3.4vw,3.4rem)] leading-[0.88] text-[var(--c-ink)]">{current.project.title}</h3>
            <p className="mt-3 text-[0.98rem] leading-[1.55] text-[var(--c-ink)]/85">{current.project.blurb}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-[var(--c-ink)]">
              <button ref={putBackButton} type="button" onClick={() => putBack(true)} className="text-[0.95rem] font-medium underline-offset-4 hover:underline">
                {log.putBack}
              </button>
              <ActionLink href={log.link.href} className="text-[0.95rem]">
                {log.link.label}
              </ActionLink>
            </div>
          </Paper>
        ) : null}
      </div>
    </Scene>
  );
}

/** Reduced motion: the sheets on a still wall, every card already read out. */
function StillLog() {
  return (
    <Scene id="log" aria-labelledby="log-title" stageClassName="px-[var(--gutter)] py-[14vh]">
      <h2 id="log-title" className="display text-[clamp(3rem,8vw,6rem)] leading-[0.85] text-[var(--c-bone)]">
        {log.title}
      </h2>
      <p className="body-copy mt-4 max-w-[40ch]">{log.line}</p>
      <ul className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {sheets.map(({ pin, project, room }) => (
          <li key={project.id}>
            <Paper tone="grid" tear={pin.tear} seed={pin.seed} innerClassName="p-[5%]">
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: `${project.width} / ${project.height}` }}>
                <Image src={project.image} alt="" fill sizes="(max-width: 768px) 90vw, 30vw" className="object-cover mix-blend-multiply" />
              </div>
            </Paper>
            <p className="meta mt-4 text-[0.75rem] text-[var(--c-gray)]">{room ? `${room.number} ${project.vertical}  ${project.year}` : project.year}</p>
            <h3 className="display mt-1 text-[1.8rem] text-[var(--c-bone)]">{project.title}</h3>
            <p className="mt-2 text-[0.98rem] leading-[1.55] text-[var(--c-bone)]/85">{project.blurb}</p>
          </li>
        ))}
      </ul>
      <div className="mt-12">
        <ActionLink href={log.link.href} className="text-[var(--c-bone)]">
          {log.link.label}
        </ActionLink>
      </div>
    </Scene>
  );
}
