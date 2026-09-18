"use client";

/**
 * 06 Your first month
 * Your first five weeks, as a leaflet that unfolds.
 *
 * The log ended by taking its folded leaflet down and bringing it forward; this
 * scene starts on that frame, the leaflet hanging on a lit wire, and opens it.
 * On a wide frame it is a tri-fold: the cover swings open to the left and the
 * back panel swings out to the right, and the three panels inside read as one
 * spread, week by week. On a narrow frame it opens downwards and the camera
 * reads down it.
 *
 * Each week carries one small printed thing, and as the week is read it gets
 * its mark in blue: the box ticked on the form, a room circled, the due date,
 * the line struck out in review, and on the last, the stamp. Every mark is
 * drawn off one number per week, so scrolling back up takes them off again.
 *
 * Progress:
 *   0.00 - 0.06   the leaflet as the log left it
 *   0.06 - 0.36   it unfolds
 *   0.40 - 0.84   the weeks are read, and marked
 *   0.84 - 0.92   the stamp
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Scene } from "@/components/world/Scene";
import { Light, span, type LightPoint } from "@/components/world/Light";
import { Stamp } from "@/components/world/Label";
import { MonthCover, PAGE_TILT, Pin, monthPageRect } from "@/components/world/MonthPage";
import { useReducedMotion } from "@/lib/useMedia";
import { firstMonth, rooms, weeks, type WeekKind } from "@/content/home";

const ease = (t: number) => t * t * (3 - 2 * t);

const READ_FROM = 0.4;
const READ_STEP = 0.088;
const readAt = (i: number) => READ_FROM + i * READ_STEP;

/** A marker stroke, drawn off a CSS number: `from` and `to` are the stretch of it the stroke takes. */
function Marker({ d, from = 0, to = 1, width = 2.4, variable }: { d: string; from?: number; to?: number; width?: number; variable: string }) {
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
      style={{ strokeDasharray: 1, strokeDashoffset: `calc(1 - clamp(0, (var(${variable}, 1) - ${from}) * ${k.toFixed(3)}, 1))` }}
    />
  );
}

/** Each week's one printed thing, and its mark. */
function Accent({ kind, i }: { kind: WeekKind; i: number }) {
  const v = `--r${i}`;
  if (kind === "form") {
    return (
      <div className="mt-[3cqw] space-y-[1.6cqw]">
        {firstMonth.formFields.map((f, k) => (
          <div key={f} className="flex items-end gap-[2cqw]">
            <span aria-hidden="true" className="relative block h-[3cqw] w-[3cqw] shrink-0 border border-[var(--c-ink)]/60">
              {k === 2 ? (
                <svg viewBox="0 0 20 20" className="absolute -left-[0.6cqw] -top-[1.6cqw] h-[5cqw] w-[5cqw] overflow-visible">
                  <Marker d="M3 11 L8 16 L19 1" variable={v} />
                </svg>
              ) : null}
            </span>
            <span className="meta whitespace-nowrap text-[2.5cqw] leading-none text-[var(--c-ink)]/70">{f}</span>
            <span aria-hidden="true" className="mb-[0.3cqw] block h-px flex-1 bg-[var(--c-ink)]/30" />
          </div>
        ))}
      </div>
    );
  }
  if (kind === "sign") {
    return (
      <div className="mt-[3cqw] flex gap-[1.4cqw]">
        {rooms.map((r, k) => (
          <span key={r.id} className="display relative flex-1 bg-[var(--c-blue)] py-[1.2cqw] text-center text-[2.8cqw] leading-none text-[var(--c-bone)]">
            {r.number}
            {k === 0 ? (
              <svg aria-hidden="true" viewBox="0 0 100 60" preserveAspectRatio="none" className="absolute -inset-[1.6cqw] h-[calc(100%+3.2cqw)] w-[calc(100%+3.2cqw)] overflow-visible">
                <Marker d="M58 4 C 20 2, 2 16, 4 32 C 6 50, 40 58, 70 55 C 94 52, 99 34, 94 20 C 88 7, 66 2, 44 6" variable={v} />
              </svg>
            ) : null}
          </span>
        ))}
      </div>
    );
  }
  if (kind === "ticket") {
    return (
      <div className="mt-[3cqw] flex items-center gap-[3cqw]">
        <span
          className="display -rotate-2 border-[0.5cqw] border-dashed border-[var(--c-blue)] px-[2cqw] py-[1cqw] text-[4.4cqw] leading-none text-[var(--c-blue)]"
          style={{ opacity: `clamp(0.25, var(${v}, 1) * 3, 1)` }}
        >
          {firstMonth.ticket.due}
        </span>
        <span className="meta text-[2.5cqw] text-[var(--c-ink)]/70">
          {firstMonth.ticket.owner} <span className="font-semibold text-[var(--c-ink)]">{firstMonth.ticket.you}</span>
        </span>
      </div>
    );
  }
  if (kind === "review") {
    return (
      <div className="mt-[3cqw] flex items-center gap-[3cqw]">
        <span className="relative whitespace-pre text-[2.8cqw] text-[var(--c-ink)]/80">
          {firstMonth.reviewCode[3].trim()}
          <svg aria-hidden="true" viewBox="0 0 100 10" preserveAspectRatio="none" className="absolute inset-x-0 top-1/2 h-[1.4cqw] w-full -translate-y-1/2 overflow-visible">
            <Marker d="M0 6 L100 4" to={0.6} variable={v} />
          </svg>
        </span>
        <span className="display text-[3.4cqw] leading-none text-[var(--c-blue)]" style={{ opacity: `clamp(0, (var(${v}, 1) - 0.5) * 4, 1)` }}>
          {firstMonth.reviewNotes[0]}
        </span>
      </div>
    );
  }
  return null;
}

function Week({ i }: { i: number }) {
  const w = weeks[i];
  return (
    <article className="relative">
      <div className="flex items-end gap-[3cqw]">
        <span aria-hidden="true" className="display text-[15cqw] leading-[0.76] text-[var(--c-blue)]">
          {i}
        </span>
        <div className="pb-[0.4cqw]">
          <p className="meta text-[2.7cqw] leading-none text-[var(--c-ink)]/60">{w.label}</p>
          <h3 className="display mt-[1cqw] text-[6.4cqw] leading-[0.9] text-[var(--c-ink)]">{w.title}</h3>
        </div>
      </div>
      <p className="mt-[2.4cqw] text-[3.3cqw] leading-[1.5] text-[var(--c-ink)]/85">{w.body}</p>
      <Accent kind={w.kind} i={i} />
      {w.kind === "stamp" ? (
        <div
          className="pointer-events-none absolute -right-[2cqw] top-[1cqw]"
          style={{ scale: `calc(1 + (1 - clamp(0, var(--r${i}, 1) * 5, 1)) * 0.6)`, opacity: `clamp(0, var(--r${i}, 1) * 5, 1)` }}
        >
          <Stamp rotate={-9} className="border-[0.8cqw] px-[2cqw] py-[0.5cqw] text-[10cqw]">
            {firstMonth.stamp}
          </Stamp>
        </div>
      ) : null}
    </article>
  );
}

/** One panel of the leaflet, sized in its own width. */
function Panel({ children }: { children?: ReactNode }) {
  return (
    <div className="paper paper--quiet relative h-full w-full overflow-hidden [container-type:inline-size]" style={{ boxShadow: "none" }}>
      <div className="flex h-full flex-col gap-[6cqw] px-[7cqw] pb-[7cqw] pt-[9cqw]">{children}</div>
    </div>
  );
}

/** What each of the three inside panels carries. */
function Inside({ n }: { n: 0 | 1 | 2 }) {
  if (n === 0) {
    return (
      <Panel>
        <h2
          id="first-month-title"
          className="display text-[9.5cqw] leading-[0.88] text-[var(--c-ink)]"
          style={{ fontOpticalSizing: "none", fontVariationSettings: '"opsz" 72' }}
        >
          {firstMonth.title}
        </h2>
        <Week i={0} />
      </Panel>
    );
  }
  if (n === 1) {
    return (
      <Panel>
        <Week i={1} />
        <Week i={2} />
      </Panel>
    );
  }
  return (
    <Panel>
      <Week i={3} />
      <Week i={4} />
      {/* The leaflet's sign-off, printed at the foot of its last panel. */}
      <p className="display mt-auto border-t border-[var(--c-ink)]/25 pt-[3cqw] text-[5.2cqw] leading-[0.95] text-[var(--c-ink)]">{firstMonth.coda}</p>
    </Panel>
  );
}

export function FirstMonth() {
  const reduced = useReducedMotion();
  if (reduced) return <StillFirstMonth />;
  return <MovingFirstMonth />;
}

type Layout = { wide: boolean; w: number; h: number; cx: number; cy: number };

function MovingFirstMonth() {
  const root = useRef<HTMLDivElement>(null);
  const spread = useRef<HTMLDivElement>(null);
  const flaps = useRef<(HTMLDivElement | null)[]>([]);
  const shades = useRef<(HTMLDivElement | null)[]>([]);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [wire, setWire] = useState<LightPoint[]>([]);
  const geo = useRef({ wide: true, w: 1, h: 1, H: 1 });
  const last = useRef(0);
  const apply = useRef<(p: number) => void>(() => {});

  useEffect(() => {
    const measure = () => {
      const el = root.current;
      if (!el) return;
      const W = el.offsetWidth;
      const H = el.offsetHeight;
      const r = monthPageRect(W, H);
      geo.current = { wide: r.wide, w: r.w, h: r.h, H };
      setLayout({ wide: r.wide, w: r.w, h: r.h, cx: r.cx, cy: r.cy });
      // The wire the leaflet hangs from, across the wall to its pin.
      const pinY = (r.cy - r.h / 2 + r.w * 0.045) / H;
      setWire([
        [0, Math.max(0.05, pinY - 0.06)],
        [r.cx / W, pinY],
        [1, Math.max(0.05, pinY - 0.06)],
      ]);
      requestAnimationFrame(() => apply.current(last.current));
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const onProgress = useCallback((p: number) => {
    last.current = p;
    const s = spread.current;
    if (!s) return;
    const { wide, h, H } = geo.current;

    // Unfolding: the cover first, then the back panel, each from flat against
    // the middle to open. The tilt it hung at comes out as it opens.
    const a = ease(span(p, 0.06, 0.22));
    const b = ease(span(p, 0.18, 0.34));
    const [cover, back] = flaps.current;
    const turn = (t: number, sign: number) => (wide ? `rotateY(${(sign * 180 * (1 - t)).toFixed(2)}deg)` : `rotateX(${(-sign * 180 * (1 - t)).toFixed(2)}deg)`);
    cover?.style.setProperty("transform", `translateZ(3px) ${turn(a, 1)}`);
    back?.style.setProperty("transform", `translateZ(-3px) ${turn(b, -1)}`);
    // Light across a panel as it turns: darkest edge-on.
    shades.current[0]?.style.setProperty("opacity", (Math.sin(a * Math.PI) * 0.35).toFixed(3));
    shades.current[1]?.style.setProperty("opacity", (Math.sin(b * Math.PI) * 0.35).toFixed(3));

    // On a narrow frame the spread is three panels tall: the camera reads down it.
    let y = 0;
    if (!wide) {
      const toTop = ease(span(p, 0.3, 0.4));
      const down = ease(span(p, 0.4, 0.9));
      const room = Math.max(0, (3 * h - H) / 2 + H * 0.06);
      y = Math.max(-room, Math.min(room, h * toTop - 2 * h * down));
    }
    const tilt = PAGE_TILT * (1 - a);
    s.style.setProperty("transform", `translate3d(0, ${y.toFixed(1)}px, 0) rotate(${tilt.toFixed(3)}deg)`);

    // Each week marked as it is read.
    weeks.forEach((_, i) => {
      const t = i === weeks.length - 1 ? span(p, 0.84, 0.92) : span(p, readAt(i), readAt(i) + READ_STEP * 0.8);
      s.style.setProperty(`--r${i}`, t.toFixed(3));
    });
  }, []);

  useEffect(() => {
    apply.current = onProgress;
  }, [onProgress]);

  const drawWire = useCallback((p: number) => [0, span(p, 0, 0.08)] as const, []);

  const wide = layout?.wide ?? true;
  const w = layout?.w ?? 0;
  const h = layout?.h ?? 0;

  return (
    <Scene continues id="first-month" vh={320} vhMobile={360} settled={0.62} onProgress={onProgress} aria-labelledby="first-month-title">
      <div ref={root} className="absolute inset-0 [perspective:2400px]">
        {wire.length ? <Light points={wire} kind="cable" sag={0.02} draw={drawWire} /> : null}

        {layout ? (
          <div
            ref={spread}
            className="absolute [transform-style:preserve-3d]"
            style={{
              left: layout.cx - w / 2,
              top: layout.cy - h / 2,
              width: w,
              height: h,
              transform: `rotate(${PAGE_TILT}deg)`,
            }}
          >
            {/* The middle panel, which holds the pin. */}
            <div className="absolute inset-0" style={{ boxShadow: "var(--shadow-lifted)" }}>
              <Inside n={1} />
              <Pin style={{ left: "50%", top: w * 0.045, width: w * 0.04, height: w * 0.04 }} />
            </div>

            {/* The cover, folded over the middle; inside it, the first panel. */}
            <div
              ref={(n) => {
                flaps.current[0] = n;
              }}
              className="absolute [transform-style:preserve-3d]"
              style={
                wide
                  ? { left: -w, top: 0, width: w, height: h, transformOrigin: "100% 50%", transform: "translateZ(3px) rotateY(180deg)" }
                  : { left: 0, top: -h, width: w, height: h, transformOrigin: "50% 100%", transform: "translateZ(3px) rotateX(-180deg)" }
              }
            >
              <div className="absolute inset-0 [backface-visibility:hidden]" style={{ boxShadow: "var(--shadow-lifted)" }}>
                <Inside n={0} />
                <div
                  ref={(n) => {
                    shades.current[0] = n;
                  }}
                  className="pointer-events-none absolute inset-0 bg-[var(--c-ink)]"
                  style={{ opacity: 0 }}
                />
              </div>
              <div className="absolute inset-0 [backface-visibility:hidden]" style={{ transform: wide ? "rotateY(180deg)" : "rotateX(180deg)" }}>
                <MonthCover opens={wide ? "side" : "foot"} />
              </div>
            </div>

            {/* The back panel, folded behind the middle; inside it, the last panel. */}
            <div
              ref={(n) => {
                flaps.current[1] = n;
              }}
              className="absolute [transform-style:preserve-3d]"
              style={
                wide
                  ? { left: w, top: 0, width: w, height: h, transformOrigin: "0% 50%", transform: "translateZ(-3px) rotateY(-180deg)" }
                  : { left: 0, top: h, width: w, height: h, transformOrigin: "50% 0%", transform: "translateZ(-3px) rotateX(180deg)" }
              }
            >
              <div className="absolute inset-0 [backface-visibility:hidden]" style={{ boxShadow: "var(--shadow-lifted)" }}>
                <Inside n={2} />
                <div
                  ref={(n) => {
                    shades.current[1] = n;
                  }}
                  className="pointer-events-none absolute inset-0 bg-[var(--c-ink)]"
                  style={{ opacity: 0 }}
                />
              </div>
              <div
                className="paper paper--quiet absolute inset-0 [backface-visibility:hidden]"
                style={{ transform: wide ? "rotateY(180deg)" : "rotateX(180deg)", boxShadow: "none" }}
              />
            </div>
          </div>
        ) : null}

      </div>
    </Scene>
  );
}

/** Reduced motion: the leaflet open flat, every week marked. */
function StillFirstMonth() {
  return (
    <Scene id="first-month" aria-labelledby="first-month-title" stageClassName="px-[var(--gutter)] py-[12vh]">
      <div className="mx-auto grid max-w-[84rem] gap-[2px] md:grid-cols-3">
        {([0, 1, 2] as const).map((n) => (
          <div key={n} className="aspect-[1/1.4]">
            <Inside n={n} />
          </div>
        ))}
      </div>
    </Scene>
  );
}
