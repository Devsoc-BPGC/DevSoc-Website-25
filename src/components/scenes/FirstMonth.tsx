"use client";

/**
 * 06 Your first month
 * The production schedule for your first four weeks, as one long printed sheet.
 *
 * The log ended with the camera inside a folded sheet, on blank paper; this
 * scene starts on that paper and pulls back until it is a schedule pinned to
 * the dark, then walks down it one week at a time. The week numbers stand in
 * the dark beside the sheet, threaded on the light, which runs down the margin
 * as far as you have read.
 *
 * Every week has its own thing fixed to the schedule, and each goes up as its
 * week comes into view: the induction form, clipped on, with one box ticked;
 * the room directory with a room circled in marker; the build ticket; the
 * first review, a printout marked up in blue; and the stamp. The marker lines
 * are drawn by a single number per week, so scrolling back up takes them off
 * the page again.
 *
 * The sheet ends on a perforation, and what is under it is the next scene's
 * paper: fan-fold, with the feed holes down both edges.
 *
 * Progress:
 *   0.00 - 0.07   pull back off the paper
 *   0.04 - 0.97   down the schedule
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Scene } from "@/components/world/Scene";
import { Light, span, type LightPoint } from "@/components/world/Light";
import { Paper } from "@/components/world/Paper";
import { Tape } from "@/components/world/Tape";
import { RoomPlate, Stamp } from "@/components/world/Label";
import { useReducedMotion } from "@/lib/useMedia";
import { firstMonth, rooms, weeks, type WeekKind } from "@/content/home";

const ease = (t: number) => t * t * (3 - 2 * t);

const PULL_TO = 0.07;
const TRAVEL_FROM = 0.04;
const TRAVEL_TO = 0.97;
/** How far into the paper the camera starts, matching where the log left it. */
const ZOOM = 7;

type SheetLayout = { H: number; sheetH: number; top: number; fold: number };

/** Where the fold sits on the frame at the end, and where the roll's paper starts. */
export const FOLD_AT = 0.06;

/** How far the sheet has travelled up the frame at progress `p`: until the fold is at the top. */
function travelAt(p: number, L: SheetLayout) {
  const end = L.top + L.fold - L.H * FOLD_AT;
  return ease(span(p, TRAVEL_FROM, TRAVEL_TO)) * end;
}

/**
 * A marker stroke. It draws as its week comes up: `from` and `to` are the
 * stretch of the week's progress (`--t`) it takes, done in CSS off that one
 * number with a unit path length, so there is nothing to measure.
 */
function Marker({ d, from, to, width = 3, className }: { d: string; from: number; to: number; width?: number; className?: string }) {
  const k = 1 / (to - from);
  return (
    <path
      d={d}
      pathLength={1}
      fill="none"
      stroke="var(--c-blue)"
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      className={className}
      style={{
        strokeDasharray: 1,
        strokeDashoffset: `calc(1 - clamp(0, (var(--t, 1) - ${from}) * ${k.toFixed(3)}, 1))`,
      }}
    />
  );
}

/** Goes up as its week comes into view: from a little lower and less square, onto the sheet. */
function Affixed({ children, rotate, className, style }: { children: ReactNode; rotate: number; className?: string; style?: CSSProperties }) {
  return (
    <div
      className={`relative ${className ?? ""}`}
      style={{
        translate: "0 calc((1 - clamp(0, var(--t, 1) * 2.4, 1)) * 48px)",
        rotate: `calc(${rotate}deg + (1 - clamp(0, var(--t, 1) * 2.4, 1)) * ${rotate < 0 ? -5 : 5}deg)`,
        opacity: "clamp(0, var(--t, 1) * 3.2, 1)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function FormObject() {
  return (
    <Affixed rotate={-1.8} className="w-[min(100%,24rem)]">
      {/* The clip. */}
      <span aria-hidden="true" className="absolute left-1/2 top-[-0.9rem] z-10 h-[1.6rem] w-[5.5rem] -translate-x-1/2 bg-[linear-gradient(#3a3c40,#1d1f22)] [clip-path:polygon(8%_0,92%_0,100%_100%,0_100%)]" />
      <Paper tone="warm" className="px-6 pb-7 pt-8">
        <p className="display text-[1.7rem] leading-none text-[var(--c-ink)]">{weeks[0].title}</p>
        <div className="mt-6 space-y-5">
          {firstMonth.formFields.map((f, i) => (
            <div key={f} className="flex items-end gap-3">
              <span aria-hidden="true" className="relative mb-0.5 block h-4 w-4 shrink-0 border border-[var(--c-ink)]/60">
                {i === 2 ? (
                  <svg viewBox="0 0 20 20" className="absolute -left-1 -top-2 h-7 w-7 overflow-visible">
                    <Marker d="M3 11 L8 16 L19 1" from={0.5} to={0.75} width={3.2} />
                  </svg>
                ) : null}
              </span>
              <span className="meta whitespace-nowrap text-[0.78rem] text-[var(--c-ink)]/75">{f}</span>
              <span aria-hidden="true" className="mb-1 block h-px flex-1 bg-[var(--c-ink)]/35" />
            </div>
          ))}
        </div>
      </Paper>
    </Affixed>
  );
}

function SignObject() {
  return (
    <Affixed rotate={1.2} className="w-[min(100%,26rem)]">
      <div className="relative bg-[var(--c-ink-2)] p-4 shadow-[var(--shadow-paper)]">
        {[
          "left-1.5 top-1.5",
          "right-1.5 top-1.5",
          "left-1.5 bottom-1.5",
          "right-1.5 bottom-1.5",
        ].map((pos) => (
          <span key={pos} aria-hidden="true" className={`absolute ${pos} h-1.5 w-1.5 rounded-full bg-[var(--c-steel)]`} />
        ))}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {rooms.map((r, i) => (
            <div key={r.id} className="relative">
              <RoomPlate number={r.number} name={r.name} className="w-full" />
              {i === 0 ? (
                <svg aria-hidden="true" viewBox="0 0 100 60" preserveAspectRatio="none" className="pointer-events-none absolute -inset-x-3 -inset-y-3 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)] overflow-visible">
                  <Marker d="M58 4 C 20 2, 2 16, 4 32 C 6 50, 40 58, 70 55 C 94 52, 99 34, 94 20 C 88 7, 66 2, 44 6" from={0.45} to={0.8} width={3} />
                </svg>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </Affixed>
  );
}

function TicketObject() {
  const { ticket } = firstMonth;
  // Two semicircle bites where the stub tears off, top and bottom.
  const notch =
    "radial-gradient(circle at calc(100% - 5.5rem) 0, transparent 0.55rem, #000 0.6rem) top / 100% 51% no-repeat, radial-gradient(circle at calc(100% - 5.5rem) 100%, transparent 0.55rem, #000 0.6rem) bottom / 100% 51% no-repeat";
  return (
    <Affixed rotate={-2.4} className="w-[min(100%,25rem)]">
      <div className="relative" style={{ filter: "drop-shadow(0 1px 1px rgb(13 14 12 / 0.4)) drop-shadow(0 8px 12px rgb(13 14 12 / 0.3))" }}>
        <div className="paper paper--warm flex shadow-none!" style={{ WebkitMask: notch, mask: notch }}>
          <div className="flex-1 px-5 py-5">
            <p className="meta text-[0.72rem] text-[var(--c-ink)]/60">{ticket.heading}</p>
            <p className="display mt-2 text-[2.6rem] leading-[0.85] text-[var(--c-blue)]">{ticket.due}</p>
            <div className="mt-4 flex items-baseline gap-3 border-t border-[var(--c-ink)]/25 pt-2">
              <span className="meta text-[0.72rem] text-[var(--c-ink)]/60">{ticket.owner}</span>
              <span className="text-[0.95rem] font-semibold text-[var(--c-ink)]">{ticket.you}</span>
            </div>
          </div>
          <div className="flex w-[5.5rem] items-center justify-center border-l-2 border-dashed border-[var(--c-ink)]/35">
            <span className="display text-[1.3rem] text-[var(--c-ink)] [writing-mode:vertical-rl]">{weeks[2].label}</span>
          </div>
        </div>
      </div>
    </Affixed>
  );
}

function ReviewObject() {
  const [why, name, ship] = firstMonth.reviewNotes;
  /** Which printed line each note is about, and when in the week it is written. */
  const notes: Record<number, { text: string; at: number; tick?: boolean }> = {
    3: { text: why, at: 0.4 },
    4: { text: name, at: 0.56 },
    7: { text: ship, at: 0.74, tick: true },
  };
  return (
    <Affixed rotate={1.6} className="w-[min(100%,28rem)]">
      <Paper tone="bone" className="py-5 pl-5 pr-[40%]">
        <Tape className="-top-2.5 left-8" rotate={-4} />
        <div className="text-[0.72rem] leading-[1.9] text-[var(--c-ink)]/85 sm:text-[0.8rem]">
          {firstMonth.reviewCode.map((l, i) => {
            const note = notes[i];
            return (
              <p key={i} className="relative whitespace-pre">
                {l}
                {i === 3 ? (
                  <svg aria-hidden="true" viewBox="0 0 100 10" preserveAspectRatio="none" className="absolute left-[0.4em] top-1/2 h-2 w-[calc(100%-0.4em)] -translate-y-1/2 overflow-visible">
                    <Marker d="M0 6 L100 4" from={0.34} to={0.42} width={2.4} />
                  </svg>
                ) : null}
                {i === 4 ? (
                  <svg aria-hidden="true" viewBox="0 0 100 10" preserveAspectRatio="none" className="absolute bottom-[0.1em] left-[3.3em] h-2 w-[0.9em] overflow-visible">
                    <Marker d="M0 5 L100 6" from={0.5} to={0.58} width={2.4} />
                  </svg>
                ) : null}
                {note ? (
                  <span className="absolute left-[calc(100%+0.6rem)] top-1/2 flex -translate-y-1/2 items-center gap-1.5 whitespace-nowrap">
                    <svg aria-hidden="true" viewBox="0 0 24 12" className="h-3 w-4 shrink-0 overflow-visible sm:w-6">
                      <Marker d={note.tick ? "M3 6 L9 11 L22 0" : "M0 7 C 8 4, 16 8, 24 6"} from={note.at} to={note.at + 0.06} width={2.4} />
                    </svg>
                    <span
                      className="display text-[0.86rem] leading-none text-[var(--c-blue)] sm:text-[1.02rem]"
                      style={{ opacity: `clamp(0, (var(--t, 1) - ${note.at + 0.04}) * 10, 1)` }}
                    >
                      {note.text}
                    </span>
                  </span>
                ) : null}
              </p>
            );
          })}
        </div>
      </Paper>
    </Affixed>
  );
}

function StampObject() {
  return (
    <div
      className="flex h-full items-center justify-center py-6"
      style={{
        scale: "calc(1 + (1 - clamp(0, (var(--t, 1) - 0.42) * 12, 1)) * 0.5)",
        opacity: "clamp(0, (var(--t, 1) - 0.42) * 12, 1)",
      }}
    >
      <Stamp rotate={-9} className="border-[5px] px-5 py-2 text-[clamp(3.4rem,7vw,6rem)]">
        {firstMonth.stamp}
      </Stamp>
    </div>
  );
}

const OBJECTS: Record<WeekKind, () => ReactNode> = {
  form: FormObject,
  sign: SignObject,
  ticket: TicketObject,
  review: ReviewObject,
  stamp: StampObject,
};

/** The schedule itself. Laid out in normal flow, so the still version is the same sheet. */
function Schedule({
  rowRef,
  foldRef,
}: {
  rowRef?: (i: number) => (n: HTMLDivElement | null) => void;
  foldRef?: (n: HTMLDivElement | null) => void;
}) {
  return (
    <div className="fanfold">
      <div className="px-[max(7%,3.6rem)] pb-[7vh] pt-[10vh]">
        <p className="meta text-[0.8rem] text-[var(--c-ink)]/65">{firstMonth.line}</p>
        <h2 id="first-month-title" className="display mt-4 max-w-[13ch] text-[clamp(2.8rem,6vw,6rem)] leading-[0.86] text-[var(--c-ink)]">
          {firstMonth.title}
        </h2>
        <div className="meta mt-[6vh] grid grid-cols-[6rem_1fr] border-b border-[var(--c-ink)]/30 pb-2 text-[0.75rem] text-[var(--c-ink)]/60 max-md:hidden">
          <span>{firstMonth.columns[0]}</span>
          <span>{firstMonth.columns[1]}</span>
        </div>
      </div>

      {weeks.map((w, i) => {
        const Obj = OBJECTS[w.kind];
        return (
          <div
            key={w.label}
            ref={rowRef?.(i)}
            className="relative grid items-center gap-10 border-t border-[var(--c-ink)]/15 px-[max(7%,3.6rem)] py-[9vh] md:min-h-[78vh] md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:gap-[4vw]"
          >
            {/* The week's number, standing in the dark beside the sheet. */}
            <span
              aria-hidden="true"
              className="display pointer-events-none absolute right-[calc(100%+7vw)] top-[8vh] hidden text-[clamp(8rem,16vw,16rem)] leading-[0.8] text-[var(--c-bone)] md:block"
              style={{ opacity: "clamp(0.18, var(--t, 1) * 2, 1)" }}
            >
              {i}
            </span>
            <div>
              <p className="display text-[3.2rem] leading-[0.8] text-[var(--c-blue)] md:hidden">{i}</p>
              <p className="meta mt-3 text-[0.8rem] text-[var(--c-ink)]/65 md:mt-0">{w.label}</p>
              <h3 className="display mt-2 text-[clamp(2.2rem,3.6vw,3.4rem)] leading-[0.88] text-[var(--c-ink)]">{w.title}</h3>
              <p className="mt-4 max-w-[38ch] text-[1.02rem] leading-[1.6] text-[var(--c-ink)]/85">{w.body}</p>
            </div>
            <div className="flex justify-center md:justify-end">
              <Obj />
            </div>
          </div>
        );
      })}

      <div className="border-t border-[var(--c-ink)]/15 px-[max(7%,3.6rem)] py-[12vh]">
        <p className="display max-w-[18ch] text-[clamp(2.2rem,4.4vw,4.4rem)] leading-[0.9] text-[var(--c-ink)]">{firstMonth.coda}</p>
      </div>

      {/* The fold, and under it the next scene's paper: the roll of names is
          printed on the same run, and starts here. It restarts the feed holes
          at the fold, as the roll's own sheet does, so the two line up. */}
      <div ref={foldRef} aria-hidden="true" className="fanfold z-[1] h-[100vh] border-t-2 border-dashed border-[var(--c-ink)]/40 shadow-none!" />
    </div>
  );
}

export function FirstMonth() {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <Scene id="first-month" aria-labelledby="first-month-title" stageClassName="px-[var(--gutter)] py-[10vh]">
        <div className="mx-auto max-w-[72rem]">
          <Schedule />
        </div>
      </Scene>
    );
  }
  return <MovingFirstMonth />;
}

function MovingFirstMonth() {
  const camera = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const rows = useRef<(HTMLDivElement | null)[]>([]);
  const layout = useRef({ W: 1, H: 1, sheetH: 1, top: 0, fold: 1, rows: [] as number[], zx: 0, zy: 0 });
  const fold = useRef<HTMLDivElement>(null);
  const last = useRef(0);
  const apply = useRef<(p: number) => void>(() => {});
  const [thread, setThread] = useState<LightPoint[]>([]);

  useEffect(() => {
    const measure = () => {
      const c = camera.current;
      const s = sheet.current;
      if (!c || !s) return;
      const W = c.offsetWidth;
      const H = c.offsetHeight;
      const narrow = W < 768;
      layout.current = {
        W,
        H,
        sheetH: s.offsetHeight,
        top: s.offsetTop,
        fold: fold.current?.offsetTop ?? s.offsetHeight,
        rows: rows.current.map((r) => r?.offsetTop ?? 0),
        // A blank patch of paper to start inside: right of the title on a wide
        // frame, under the header's words on a phone.
        zx: narrow ? W * 0.8 : W * 0.86,
        zy: narrow ? H * 0.06 + s.offsetTop : H * 0.3,
      };
      setThread([
        [0.5, 0],
        [0.5, 1],
      ]);
      requestAnimationFrame(() => apply.current(last.current));
    };
    measure();
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    if (sheet.current) ro.observe(sheet.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const onProgress = useCallback((p: number) => {
    last.current = p;
    const c = camera.current;
    const s = sheet.current;
    if (!c || !s) return;
    const L = layout.current;

    const travel = travelAt(p, L);
    s.style.setProperty("transform", `translate3d(0, ${(-travel).toFixed(1)}px, 0)`);

    // Off the paper: the camera starts deep in a blank patch and pulls back.
    const pull = 1 - ease(span(p, 0, PULL_TO));
    const z = Math.pow(ZOOM, pull);
    c.style.setProperty("transform-origin", `${L.zx.toFixed(1)}px ${L.zy.toFixed(1)}px`);
    c.style.setProperty("transform", pull > 0 ? `scale(${z.toFixed(4)})` : "none");

    // Each week's own progress: 0 as it comes up the bottom of the frame, 1
    // once it is well in.
    rows.current.forEach((r, i) => {
      if (!r) return;
      const y = L.top + L.rows[i] - travel;
      const t = Math.min(1, Math.max(0, (L.H * 0.92 - y) / (L.H * 0.72)));
      r.style.setProperty("--t", t.toFixed(3));
    });
  }, []);

  useEffect(() => {
    apply.current = onProgress;
  }, [onProgress]);

  /** The thread is lit down to wherever the reading line is on the sheet. */
  const drawThread = useCallback((p: number) => {
    const L = layout.current;
    const read = travelAt(p, L) + L.H * 0.62 - L.top;
    return [0, Math.min(L.fold / L.sheetH, Math.max(0, read / L.sheetH))] as const;
  }, []);
  const threadIntensity = useCallback((p: number) => span(p, PULL_TO * 0.6, PULL_TO + 0.03), []);

  return (
    <Scene id="first-month" vh={680} vhMobile={760} settled={0.3} onProgress={onProgress} aria-labelledby="first-month-title">
      <div ref={camera} className="absolute inset-0">
        <div
          ref={sheet}
          className="absolute left-[4vw] right-[4vw] top-[5vh] will-change-transform md:left-[30vw] md:right-[6vw]"
        >
          {/* The thread down the margin, in the dark beside the sheet. */}
          <div aria-hidden="true" className="absolute inset-y-0 right-[calc(100%+3.2vw)] hidden w-8 md:block">
            {thread.length ? <Light points={thread} kind="cable" sag={0} draw={drawThread} intensity={threadIntensity} /> : null}
          </div>
          <Schedule
            rowRef={(i) => (n) => {
              rows.current[i] = n;
            }}
            foldRef={(n) => {
              fold.current = n;
            }}
          />
        </div>
      </div>
    </Scene>
  );
}
