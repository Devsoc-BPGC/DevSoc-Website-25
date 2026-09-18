"use client";

/**
 * 06 Your first month
 * Your first five weeks, as a calendar on the wall that fills up.
 *
 * The log ended by taking its folded sheet down and bringing it forward; this
 * scene starts on that frame, with the sheet hung on a wire, and the calendar
 * rules itself onto it. Then the month runs: a marker crosses off the days one
 * by one and circles today, each week's name is written into its row, and each
 * week pins its own thing to the wall around the calendar and leaves it there,
 * so by week four the wall is full. The induction form, the room directory with
 * a room circled, the build ticket, the first review marked up in blue, and on
 * the last row, the stamp.
 *
 * The week being read is set large beside the calendar. Every mark on the
 * calendar is drawn off one number (the days gone), so scrolling back up takes
 * them off again, in order.
 *
 * The calendar hangs on the same wall as the roll of names below it; when the
 * month is done the camera carries on down to it.
 *
 * Progress:
 *   0.00 - 0.08   the calendar rules itself onto the sheet; the wire lights
 *   0.10 - 0.90   five weeks, a fifth each
 *   0.90 - 1.00   the coda
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Scene } from "@/components/world/Scene";
import { Light, span, type LightPoint } from "@/components/world/Light";
import { Paper } from "@/components/world/Paper";
import { Tape } from "@/components/world/Tape";
import { RoomPlate, Stamp } from "@/components/world/Label";
import { MonthCover, PAGE_TILT, monthPageRect } from "@/components/world/MonthPage";
import { useReducedMotion } from "@/lib/useMedia";
import { firstMonth, rooms, weeks, type WeekKind } from "@/content/home";

const GRID_TO = 0.08;
const WEEK_FROM = 0.1;
const WEEK_LEN = 0.16;
const CODA_FROM = 0.9;
const DAYS = 35;
const DAY_NAMES = ["M", "T", "W", "T", "F", "S", "S"];

const weekStart = (i: number) => WEEK_FROM + i * WEEK_LEN;
/** Days gone, continuously, so the marker crosses each off as you scroll. */
const daysAt = (p: number) => Math.max(0, Math.min(DAYS, ((p - WEEK_FROM) / (WEEK_LEN * 5)) * DAYS));

/**
 * A marker stroke, drawn off a CSS number rather than measured: `from` and
 * `to` are the stretch of the variable it takes, with a unit path length.
 */
function Marker({
  d,
  from,
  to,
  width = 3,
  variable = "--t",
  scales = false,
}: {
  d: string;
  from: number;
  to: number;
  width?: number;
  variable?: string;
  /** Stroke width in the drawing's own units. Needed on tiny drawings, where
   *  a non-scaling stroke throws the unit path length off. */
  scales?: boolean;
}) {
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
      vectorEffect={scales ? undefined : "non-scaling-stroke"}
      style={{
        strokeDasharray: 1,
        strokeDashoffset: `calc(1 - clamp(0, (var(${variable}, 1) - ${from}) * ${k.toFixed(3)}, 1))`,
      }}
    />
  );
}

/** Goes up as its week begins: from a little lower and less square, onto the wall. */
function Affixed({ children, rotate, className, style }: { children: ReactNode; rotate: number; className?: string; style?: CSSProperties }) {
  return (
    <div
      className={`relative ${className ?? ""}`}
      style={{
        translate: "0 calc((1 - clamp(0, var(--t, 1) * 3, 1)) * 48px)",
        rotate: `calc(${rotate}deg + (1 - clamp(0, var(--t, 1) * 3, 1)) * ${rotate < 0 ? -6 : 6}deg)`,
        opacity: "clamp(0, var(--t, 1) * 4, 1)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function FormObject() {
  return (
    <Affixed rotate={-2.6} className="w-[22rem]">
      <span aria-hidden="true" className="absolute left-1/2 top-[-0.9rem] z-10 h-[1.6rem] w-[5.5rem] -translate-x-1/2 bg-[linear-gradient(#3a3c40,#1d1f22)] [clip-path:polygon(8%_0,92%_0,100%_100%,0_100%)]" />
      <Paper tone="warm" className="px-6 pb-7 pt-8">
        <p className="display text-[1.7rem] leading-none text-[var(--c-ink)]">{weeks[0].title}</p>
        <div className="mt-6 space-y-5">
          {firstMonth.formFields.map((f, i) => (
            <div key={f} className="flex items-end gap-3">
              <span aria-hidden="true" className="relative mb-0.5 block h-4 w-4 shrink-0 border border-[var(--c-ink)]/60">
                {i === 2 ? (
                  <svg viewBox="0 0 20 20" className="absolute -left-1 -top-2 h-7 w-7 overflow-visible">
                    <Marker d="M3 11 L8 16 L19 1" from={0.35} to={0.55} width={3.2} />
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
    <Affixed rotate={1.6} className="w-[24rem]">
      <div className="relative bg-[var(--c-ink-2)] p-4 shadow-[var(--shadow-paper)] outline outline-1 outline-[var(--c-steel)]/40">
        {["left-1.5 top-1.5", "right-1.5 top-1.5", "left-1.5 bottom-1.5", "right-1.5 bottom-1.5"].map((pos) => (
          <span key={pos} aria-hidden="true" className={`absolute ${pos} h-1.5 w-1.5 rounded-full bg-[var(--c-steel)]`} />
        ))}
        <div className="grid grid-cols-3 gap-2">
          {rooms.map((r, i) => (
            <div key={r.id} className="relative">
              <RoomPlate number={r.number} name={r.name} className="h-full w-full" />
              {i === 0 ? (
                <svg aria-hidden="true" viewBox="0 0 100 60" preserveAspectRatio="none" className="pointer-events-none absolute -inset-x-3 -inset-y-3 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)] overflow-visible">
                  <Marker d="M58 4 C 20 2, 2 16, 4 32 C 6 50, 40 58, 70 55 C 94 52, 99 34, 94 20 C 88 7, 66 2, 44 6" from={0.3} to={0.6} width={3} />
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
    <Affixed rotate={-3.2} className="w-[23rem]">
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
    3: { text: why, at: 0.3 },
    4: { text: name, at: 0.45 },
    7: { text: ship, at: 0.6, tick: true },
  };
  return (
    <Affixed rotate={2.2} className="w-[26rem]">
      <Paper tone="bone" className="py-5 pl-5 pr-[40%]">
        <Tape className="-top-2.5 left-8" rotate={-4} />
        <div className="text-[0.8rem] leading-[1.9] text-[var(--c-ink)]/85">
          {firstMonth.reviewCode.map((l, i) => {
            const note = notes[i];
            return (
              <p key={i} className="relative whitespace-pre">
                {l}
                {i === 3 ? (
                  <svg aria-hidden="true" viewBox="0 0 100 10" preserveAspectRatio="none" className="absolute left-[0.4em] top-1/2 h-2 w-[calc(100%-0.4em)] -translate-y-1/2 overflow-visible">
                    <Marker d="M0 6 L100 4" from={0.24} to={0.32} width={2.4} />
                  </svg>
                ) : null}
                {i === 4 ? (
                  <svg aria-hidden="true" viewBox="0 0 100 10" preserveAspectRatio="none" className="absolute bottom-[0.1em] left-[3.3em] h-2 w-[0.9em] overflow-visible">
                    <Marker d="M0 5 L100 6" from={0.4} to={0.47} width={2.4} />
                  </svg>
                ) : null}
                {note ? (
                  <span className="absolute left-[calc(100%+0.6rem)] top-1/2 flex -translate-y-1/2 items-center gap-1.5 whitespace-nowrap">
                    <svg aria-hidden="true" viewBox="0 0 24 12" className="h-3 w-6 shrink-0 overflow-visible">
                      <Marker d={note.tick ? "M3 6 L9 11 L22 0" : "M0 7 C 8 4, 16 8, 24 6"} from={note.at} to={note.at + 0.06} width={2.4} />
                    </svg>
                    <span className="display text-[1.02rem] leading-none text-[var(--c-blue)]" style={{ opacity: `clamp(0, (var(--t, 1) - ${note.at + 0.04}) * 10, 1)` }}>
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
      style={{
        scale: "calc(1 + (1 - clamp(0, (var(--t, 1) - 0.3) * 12, 1)) * 0.6)",
        opacity: "clamp(0, (var(--t, 1) - 0.3) * 12, 1)",
      }}
    >
      <Stamp rotate={-8} className="border-[0.9cqw] px-[2.4cqw] py-[0.6cqw] text-[13cqw]">
        {firstMonth.stamp}
      </Stamp>
    </div>
  );
}

type Pinned = Exclude<WeekKind, "stamp">;
const PINNED_KINDS: Pinned[] = ["form", "sign", "ticket", "review"];

const OBJECTS: Record<Pinned, () => ReactNode> = {
  form: FormObject,
  sign: SignObject,
  ticket: TicketObject,
  review: ReviewObject,
};

/**
 * Where each week's thing is pinned on a wide frame: which side of the
 * calendar, how far down, and its width in rem (to fit it to that side).
 * The readout takes the left of the wall, so most things go to the right.
 */
const PINNED: Record<Pinned, { side: "left" | "right"; y: number; rem: number }> = {
  form: { side: "right", y: 0.24, rem: 22 },
  sign: { side: "right", y: 0.5, rem: 24 },
  ticket: { side: "left", y: 0.85, rem: 23 },
  review: { side: "right", y: 0.78, rem: 26 },
};

/** The calendar ruled onto the page: days, weeks, and everything the month writes on it. */
function Calendar({
  gridRef,
  stampRef,
  ringRef,
}: {
  gridRef?: (n: HTMLDivElement | null) => void;
  stampRef?: (n: HTMLDivElement | null) => void;
  ringRef?: (n: HTMLSpanElement | null) => void;
}) {
  return (
    <div ref={gridRef} className="absolute bottom-[7cqw] left-[7cqw] right-[6cqw] top-[40cqw]" style={{ opacity: "var(--grid, 1)" }}>
      <div className="grid h-full grid-cols-[7cqw_repeat(7,minmax(0,1fr))] grid-rows-[4.5cqw_repeat(5,minmax(0,1fr))] border-b border-r border-[var(--c-ink)]/25">
        <span />
        {DAY_NAMES.map((d, i) => (
          <span key={i} className="meta flex items-center justify-center border-l border-t border-[var(--c-ink)]/25 text-[2.2cqw] text-[var(--c-ink)]/60">
            {d}
          </span>
        ))}
        {weeks.map((w, row) => (
          <div key={w.label} className="contents">
            <span className="display flex items-start justify-center border-t border-[var(--c-ink)]/25 pt-[1.2cqw] text-[3cqw] leading-none text-[var(--c-ink)]">
              {`W${row}`}
            </span>
            {DAY_NAMES.map((_, col) => {
              const n = row * 7 + col;
              return (
                <span key={col} className="relative border-l border-t border-[var(--c-ink)]/25" style={{ ["--x" as string]: `calc(var(--day, 0) - ${n})` } as CSSProperties}>
                  <span className="meta absolute left-[0.8cqw] top-[0.5cqw] text-[1.9cqw] leading-none text-[var(--c-ink)]/55">{n + 1}</span>
                  {/* Crossed off once the day has gone. */}
                  <svg aria-hidden="true" viewBox="0 0 10 10" preserveAspectRatio="none" className="absolute inset-[18%] h-[64%] w-[64%] overflow-visible">
                    <Marker d="M1 1 L9 9" from={0} to={0.5} width={0.55} variable="--x" scales />
                    <Marker d="M9 1 L1 9" from={0.5} to={1} width={0.55} variable="--x" scales />
                  </svg>
                </span>
              );
            })}
          </div>
        ))}
      </div>

      {/* Each week's name, written into its row in marker. */}
      {weeks.map((w, row) => (
        <p
          key={w.label}
          className="display pointer-events-none absolute left-[9cqw] -translate-y-1/2 text-[5.4cqw] leading-none text-[var(--c-blue)]"
          style={{
            top: `calc(4.5cqw + (100% - 4.5cqw) * ${(row + 0.62) / 5})`,
            rotate: "-2deg",
            opacity: `var(--wk${row}, 1)`,
          }}
        >
          {w.title}
        </p>
      ))}

      {/* Today, circled. */}
      <span
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          width: "calc((100% - 7cqw) / 7)",
          height: "calc((100% - 4.5cqw) / 5)",
          left: "calc(7cqw + (100% - 7cqw) / 7 * var(--col, 6))",
          top: "calc(4.5cqw + (100% - 4.5cqw) / 5 * var(--row, 4))",
          opacity: "var(--today, 0)",
        }}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute -inset-[8%] h-[116%] w-[116%] overflow-visible">
          <ellipse cx="50" cy="50" rx="46" ry="44" fill="none" stroke="var(--c-blue)" strokeWidth={2.2} vectorEffect="non-scaling-stroke" />
        </svg>
      </span>

      {/* Week four: the stamp, across the last row. */}
      <div
        ref={stampRef}
        className="pointer-events-none absolute left-[55%] -translate-x-1/2 -translate-y-1/2"
        style={{ top: `calc(4.5cqw + (100% - 4.5cqw) * ${4.5 / 5})` }}
      >
        <StampObject />
      </div>
    </div>
  );
}

/** The week being read, set large beside the calendar. */
function Readout({ i }: { i: number }) {
  const w = weeks[i];
  return (
    <>
      <p aria-hidden="true" className="display text-[clamp(6rem,11vw,11rem)] leading-[0.8] text-[var(--c-bone)] max-md:hidden">
        {i}
      </p>
      <p className="meta mt-4 text-[0.85rem] text-[var(--c-gray)] max-md:mt-0">{w.label}</p>
      <h3 className="display mt-2 text-[clamp(2rem,3.4vw,3.4rem)] leading-[0.88] text-[var(--c-bone)]">{w.title}</h3>
      <p className="mt-3 max-w-[36ch] text-[clamp(0.95rem,1.15vw,1.1rem)] leading-[1.6] text-[var(--c-bone)]/85">{w.body}</p>
    </>
  );
}

export function FirstMonth() {
  const reduced = useReducedMotion();
  if (reduced) return <StillFirstMonth />;
  return <MovingFirstMonth />;
}

function MovingFirstMonth() {
  const root = useRef<HTMLDivElement>(null);
  const page = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement | null>(null);
  const ring = useRef<HTMLSpanElement | null>(null);
  const stamp = useRef<HTMLDivElement | null>(null);
  const pinned = useRef<(HTMLDivElement | null)[]>([]);
  const reads = useRef<(HTMLDivElement | null)[]>([]);
  const readout = useRef<HTMLDivElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const coda = useRef<HTMLDivElement>(null);
  const frame = useRef({ W: 1, H: 1, narrow: false });
  const last = useRef(0);
  const shownDay = useRef(-1);
  const apply = useRef<(p: number) => void>(() => {});
  const [wire, setWire] = useState<LightPoint[]>([]);

  useEffect(() => {
    const measure = () => {
      const el = root.current;
      const pg = page.current;
      if (!el || !pg) return;
      const W = el.offsetWidth;
      const H = el.offsetHeight;
      const narrow = W < 768;
      frame.current = { W, H, narrow };
      const r = monthPageRect(W, H);
      pg.style.setProperty("left", `${r.cx - r.w / 2}px`);
      pg.style.setProperty("top", `${r.cy - r.h / 2}px`);
      pg.style.setProperty("width", `${r.w}px`);
      pg.style.setProperty("height", `${r.h}px`);
      // The wall either side of the calendar.
      const gutter = Math.min(64, Math.max(20, W * 0.04));
      const gap = W * 0.025;
      const leftZone = { from: gutter, to: r.cx - r.w / 2 - gap };
      const rightZone = { from: r.cx + r.w / 2 + gap, to: W - gutter };

      // The readout: the left of the wall on a wide frame, under the calendar on a phone.
      const ro = readout.current;
      if (ro) {
        ro.style.setProperty("left", `${narrow ? gutter : leftZone.from}px`);
        ro.style.setProperty("width", `${narrow ? W - gutter * 2 : leftZone.to - leftZone.from}px`);
        ro.style.setProperty("top", narrow ? `${r.cy + r.h / 2 + H * 0.03}px` : "18vh");
      }

      // The things each week pins up, fitted to their side of the wall; on a
      // phone, one at a time over the foot of the page.
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      PINNED_KINDS.forEach((k, i) => {
        const n = pinned.current[i];
        if (!n) return;
        const spec = PINNED[k];
        const zone = spec.side === "left" ? leftZone : rightZone;
        const x = narrow ? W * 0.7 : (zone.from + zone.to) / 2;
        const y = narrow ? r.cy + r.h * 0.34 : H * spec.y;
        const s = narrow ? 0.5 : Math.min(0.74, (zone.to - zone.from) / (spec.rem * rem));
        n.style.setProperty("left", `${x}px`);
        n.style.setProperty("top", `${y}px`);
        n.style.setProperty("scale", s.toFixed(3));
      });

      // The wire the calendar hangs from, across the wall to its pin.
      const pinY = (r.cy - r.h / 2 + r.w * 0.04) / H;
      setWire([
        [0, Math.max(0.05, pinY - 0.06)],
        [r.cx / W, pinY],
        [1, Math.max(0.05, pinY - 0.06)],
      ]);
      shownDay.current = -1;
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
    const g = grid.current;
    if (!el || !g) return;
    const { narrow } = frame.current;

    // The calendar rules itself onto the sheet, and the creases flatten.
    const ruled = span(p, 0.01, GRID_TO);
    el.style.setProperty("--grid", ruled.toFixed(3));
    el.style.setProperty("--creases", (1 - ruled * 0.7).toFixed(3));

    // The days: one number for every cross on the calendar.
    const days = daysAt(p);
    g.style.setProperty("--day", days.toFixed(3));
    const today = Math.min(DAYS - 1, Math.floor(days));
    if (today !== shownDay.current && ring.current) {
      shownDay.current = today;
      ring.current.style.setProperty("--row", String(Math.floor(today / 7)));
      ring.current.style.setProperty("--col", String(today % 7));
    }
    ring.current?.style.setProperty("--today", (span(p, WEEK_FROM - 0.01, WEEK_FROM + 0.01) * (1 - span(p, CODA_FROM, CODA_FROM + 0.02))).toFixed(3));

    weeks.forEach((w, i) => {
      const start = weekStart(i);
      // Its name, written in as the week begins.
      g.style.setProperty(`--wk${i}`, span(p, start + 0.005, start + 0.035).toFixed(3));
      // Its thing, going up, and on a phone giving way to the next week's.
      const t = span(p, start - 0.02, start + 0.14);
      if (w.kind === "stamp") {
        stamp.current?.style.setProperty("--t", t.toFixed(3));
        return;
      }
      const n = pinned.current[i];
      if (!n) return;
      n.style.setProperty("--t", t.toFixed(3));
      n.style.setProperty("visibility", t > 0 ? "visible" : "hidden");
      const gone = narrow && i < weeks.length - 1 ? span(p, weekStart(i + 1) - 0.01, weekStart(i + 1) + 0.02) : 0;
      n.style.setProperty("opacity", (1 - gone).toFixed(3));
    });

    // The readout: the week being read, then the coda.
    const k = (p - WEEK_FROM) / WEEK_LEN;
    reads.current.forEach((r, i) => {
      if (!r) return;
      const wgt = Math.max(0, Math.min(1, (0.6 - Math.abs(k - i - 0.5)) * 6)) * (1 - span(p, CODA_FROM - 0.01, CODA_FROM + 0.02));
      r.style.setProperty("opacity", wgt.toFixed(3));
      r.style.setProperty("translate", `0 ${((k - i - 0.5) * -14).toFixed(1)}px`);
      r.style.setProperty("visibility", wgt > 0 ? "visible" : "hidden");
    });
    intro.current?.style.setProperty("opacity", (span(p, 0.02, 0.05) * (1 - span(p, WEEK_FROM - 0.02, WEEK_FROM + 0.005))).toFixed(3));
    coda.current?.style.setProperty("opacity", span(p, CODA_FROM + 0.01, CODA_FROM + 0.05).toFixed(3));
  }, []);

  useEffect(() => {
    apply.current = onProgress;
  }, [onProgress]);

  const drawWire = useCallback((p: number) => [0, span(p, 0, GRID_TO + 0.02)] as const, []);

  return (
    <Scene id="first-month" vh={620} vhMobile={520} settled={weekStart(2) + 0.08} onProgress={onProgress} aria-labelledby="first-month-title">
      <div ref={root} className="absolute inset-0">
        {wire.length ? <Light points={wire} kind="cable" sag={0.02} draw={drawWire} /> : null}

        {/* What each week pins up, round the calendar. */}
        {PINNED_KINDS.map((k, i) => {
          const Obj = OBJECTS[k];
          return (
            <div
              key={k}
              ref={(n) => {
                pinned.current[i] = n;
              }}
              aria-hidden="true"
              className="absolute z-[2] -translate-x-1/2 -translate-y-1/2"
              style={{ visibility: "hidden" }}
            >
              <Obj />
            </div>
          );
        })}

        {/* The calendar, hung where the log's sheet came to rest. */}
        <div ref={page} className="absolute z-[1]" style={{ rotate: `${PAGE_TILT}deg` }}>
          <MonthCover creases="var(--creases, 1)">
            <h2 id="first-month-title" className="sr-only">
              {firstMonth.title}
            </h2>
            <Calendar
              gridRef={(n) => {
                grid.current = n;
              }}
              ringRef={(n) => {
                ring.current = n;
              }}
              stampRef={(n) => {
                stamp.current = n;
              }}
            />
          </MonthCover>
        </div>

        {/* The readout, beside the calendar on a wide frame and under it on a phone. */}
        <div ref={readout} className="absolute top-[18vh]">
          <div ref={intro} className="absolute inset-x-0 top-0" style={{ opacity: 0 }}>
            <p className="meta text-[0.85rem] text-[var(--c-gray)]">{firstMonth.line}</p>
          </div>
          {weeks.map((w, i) => (
            <div
              key={w.label}
              ref={(n) => {
                reads.current[i] = n;
              }}
              className="absolute inset-x-0 top-0"
              style={{ opacity: 0, visibility: "hidden" }}
            >
              <Readout i={i} />
            </div>
          ))}
          <div ref={coda} className="absolute inset-x-0 top-0" style={{ opacity: 0 }}>
            <p className="display text-[clamp(2.2rem,3.6vw,3.8rem)] leading-[0.9] text-[var(--c-bone)]">{firstMonth.coda}</p>
          </div>
        </div>
      </div>
    </Scene>
  );
}

/** Reduced motion: the calendar with the month already written on it, and every week read out. */
function StillFirstMonth() {
  return (
    <Scene id="first-month" aria-labelledby="first-month-title" stageClassName="px-[var(--gutter)] py-[12vh]">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
        <div className="relative mx-auto aspect-[1/1.32] w-full max-w-[34rem]" style={{ ["--day" as string]: DAYS } as CSSProperties}>
          <MonthCover creases={0.3}>
            <h2 id="first-month-title" className="sr-only">
              {firstMonth.title}
            </h2>
            <Calendar />
          </MonthCover>
        </div>
        <div className="space-y-12">
          {weeks.map((w, i) => (
            <div key={w.label}>
              <Readout i={i} />
            </div>
          ))}
          <p className="display text-[clamp(2rem,3.4vw,3.4rem)] leading-[0.9] text-[var(--c-bone)]">{firstMonth.coda}</p>
        </div>
      </div>
    </Scene>
  );
}
