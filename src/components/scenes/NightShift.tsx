"use client";

/**
 * 04 The Night Shift
 * How a fest site actually gets built, as one desk through one countdown.
 *
 * The rooms ended with the camera inside a monitor's screen; this scene starts
 * on exactly that frame and pulls back out of a different monitor, the one on
 * the build desk. The countdown is the subject and stays the largest thing in
 * the room. Everything else happens around it.
 *
 * Production notes go up either side of the screen, one per beat, each on top
 * of the last. Every new note knocks the ones under it a little further out of
 * square, and the knocks get bigger as the deadline gets closer, so the desk
 * is visibly messier at T-3 hours than at T-21 days. Between notes the count
 * runs down, continuously, and lands on the next beat's figure just as that
 * beat's note goes up. At T-3 hours the tube overhead stutters and the count
 * turns to the alarm colour, the one place on the site that colour appears.
 *
 * At T-0 the notes square up into two neat stacks, the terminal prints on the
 * screen, and the camera goes up to it. Then the monitor is switched off: the
 * picture folds to a single line of light across the dark, the way a tube
 * screen goes, and that line is the light the log's wall comes up around.
 *
 * Everything is a pure function of progress, so scrolling back up runs the
 * night backwards: the notes come down, the count climbs, the room gets tidy.
 *
 * Progress:
 *   0.00 - 0.08   pull back out of the screen into the build room
 *   0.10          the cover sheet goes up
 *   0.16 - 0.63   a note per beat, alternating sides, the count running down
 *   0.63          T-3 hours: the stutter, and the alarm
 *   0.71          T-0
 *   0.72 - 0.79   the notes square up
 *   0.75 - 0.86   the terminal prints
 *   0.88 - 1.00   push into the screen
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Scene } from "@/components/world/Scene";
import { Light, span, type LightPoint } from "@/components/world/Light";
import { MonitorScreen, dolly, screenFit } from "@/components/world/MonitorScreen";
import { LedSign } from "@/components/world/LedSign";
import { Paper } from "@/components/world/Paper";
import { Tape } from "@/components/world/Tape";
import { useReducedMotion } from "@/lib/useMedia";
import { beats, nightShift, shipLines, type Beat } from "@/content/home";

const ease = (t: number) => t * t * (3 - 2 * t);
const settleOut = (t: number) => 1 - Math.pow(1 - t, 3);

const PULL_TO = 0.08;
const COVER_AT = 0.1;
const FIRST = 0.16;
const STEP = 0.078;
const arrive = (i: number) => FIRST + i * STEP;
const T0 = arrive(beats.length - 1);
const SQUARE_FROM = T0 + 0.01;
const SQUARE_TO = T0 + 0.08;
const TYPE_FROM = T0 + 0.04;
const TYPE_TO = T0 + 0.15;
const PUSH_FROM = 0.86;
/** The screen switching off: its picture collapses to a line of light. */
const OFF_FROM = 0.945;
const OFF_TO = 0.975;
/** The line it leaves, straight across the middle of the frame, where the log picks it up. */
export const SWITCHED_OFF: LightPoint[] = [
  [0, 0.5],
  [1, 0.5],
];
const LINE = SWITCHED_OFF;
const ALARM = beats.findIndex((b) => b.hours === 3);
/**
 * How close the camera has to be before the sharp copy of the screen takes
 * over from the one in the room. Only near the frame does the room's copy
 * soften, and below this nothing in the room overlaps the glass yet.
 */
const SHARP_FROM = 0.5;
/** How long a note takes to go up, in progress. */
const LAND = 0.045;

/** Every note that goes up: the cover sheet, then every beat but T-0, which is the screen's. */
const noteBeats = beats.slice(0, -1);
const NOTES = noteBeats.length + 1;
const landsAt = (k: number) => (k === 0 ? COVER_AT : arrive(k - 1));
/** The cover goes left; the beats alternate, starting on the right. */
const sideOf = (k: number) => (k % 2 === 0 ? -1 : 1);

/** Where each note sits when it first goes up: never quite square. */
const REST = [
  { r: -1.4, x: 0, y: 0 },
  { r: 1.8, x: 4, y: -6 },
  { r: -2.2, x: -6, y: 10 },
  { r: 1.2, x: 8, y: 4 },
  { r: -2.6, x: -4, y: -8 },
  { r: 2.4, x: -8, y: 12 },
  { r: -1.8, x: 10, y: -4 },
  { r: 2.9, x: -6, y: 6 },
];

/**
 * How far note `k` is knocked when note `m` lands on top of it. Later notes
 * land harder, because by then nobody is placing anything carefully.
 */
function knock(k: number, m: number) {
  const hurry = 1 + (m / NOTES) * 1.6;
  return {
    x: (((k * 7 + m * 3) % 5) - 2) * 6 * hurry,
    y: -(6 + ((k + m) % 3) * 5) * hurry,
    r: ((k + m) % 2 ? 1 : -1) * (0.9 + m * 0.18) * hurry,
  };
}

/** Hours on the clock at progress `p`: held at each beat, then run down to the next. */
function hoursAt(p: number) {
  if (p <= arrive(0)) return beats[0].hours;
  for (let i = 0; i < beats.length - 1; i++) {
    const b = arrive(i + 1);
    if (p < b) {
      const t = ease(span(p, arrive(i) + STEP * 0.45, b - 0.004));
      return beats[i].hours + (beats[i + 1].hours - beats[i].hours) * t;
    }
  }
  return 0;
}

function readout(h: number) {
  const { units } = nightShift;
  if (h >= 47.5) return { value: String(Math.round(h / 24)), unit: units.days };
  const n = Math.max(0, Math.round(h));
  return { value: String(n), unit: n === 1 ? units.hour : units.hours };
}

/** A fluorescent starter giving up for a moment. Seeded by progress, so it replays exactly. */
function stutter(p: number) {
  const a = arrive(ALARM);
  if (p < a - 0.012 || p > a + 0.028) return 1;
  const k = Math.floor((p - a) * 1400);
  const h = Math.sin(k * 12.9898 + 78.233) * 43758.5453;
  return h - Math.floor(h) > 0.42 ? 1 : 0.16;
}

/**
 * The parts of a screen the scroll handler writes to, found once per element
 * rather than on every frame.
 */
type ScreenParts = {
  readout: HTMLElement | null;
  count: Element | null;
  unit: Element | null;
  terminal: HTMLElement | null;
  lines: HTMLElement[];
};
const screenCache = new WeakMap<HTMLElement, ScreenParts>();
function screenParts(host: HTMLElement) {
  let parts = screenCache.get(host);
  if (!parts) {
    parts = {
      readout: host.querySelector<HTMLElement>("[data-readout]"),
      count: host.querySelector("[data-count]"),
      unit: host.querySelector("[data-unit]"),
      terminal: host.querySelector<HTMLElement>("[data-terminal]"),
      lines: Array.from(host.querySelectorAll<HTMLElement>("[data-line]")),
    };
    screenCache.set(host, parts);
  }
  return parts;
}
const shadeCache = new WeakMap<HTMLElement, HTMLElement | null>();
function shadeOf(note: HTMLElement) {
  if (!shadeCache.has(note)) shadeCache.set(note, note.querySelector<HTMLElement>("[data-shade]"));
  return shadeCache.get(note) ?? null;
}

type Layout = {
  W: number;
  H: number;
  wide: boolean;
  glass: { x: number; y: number; w: number; h: number };
  fit: { s: number; x: number; y: number };
  bezel: number;
  chin: number;
  deskY: number;
  tubeY: number;
  piles: { left: { x: number; y: number }; right: { x: number; y: number } };
};

function layoutFor(W: number, H: number): Layout {
  const wide = W >= 1024 && W / H >= 1.1;
  let gw: number;
  let gh: number;
  let gy: number;
  if (wide) {
    // The glass takes the frame's own shape, so the push in lands edge to edge.
    const a = Math.min(1.8, Math.max(1.25, W / H));
    gw = Math.min(H * 0.6 * a, W * 0.62);
    gh = gw / a;
    gy = H * 0.15;
  } else {
    gw = W * 0.9;
    gh = Math.min(H * 0.5, gw * 1.2);
    gy = H * 0.11;
  }
  const gx = (W - gw) / 2;
  const bezel = Math.max(8, gw * 0.022);
  const chin = bezel * 1.7;
  const deskY = wide ? gy + gh + chin + H * 0.055 : gy + gh + chin;
  const noteY = wide ? gy + gh * 0.55 : deskY + (H * 0.965 - deskY) / 2 - H * 0.01;
  return {
    W,
    H,
    wide,
    glass: { x: gx, y: gy, w: gw, h: gh },
    fit: screenFit(gw, gh, W, H),
    bezel,
    chin,
    deskY,
    tubeY: wide ? H * 0.085 : H * 0.082,
    piles: wide
      ? { left: { x: 0, y: noteY }, right: { x: 0, y: noteY } }
      : { left: { x: W / 2, y: noteY }, right: { x: W / 2, y: noteY } },
  };
}

function Note({ beat, flag }: { beat: Beat; flag?: boolean }) {
  return (
    <>
      {/* The alarm flag is stuck behind the sheet and only shows where it
          sticks out past the edge, over the dark: orange never sits on paper. */}
      {flag ? <span aria-hidden="true" className="absolute -right-5 top-8 h-10 w-9 bg-[var(--c-orange)]" /> : null}
      <Paper tone="bone" className="relative px-5 pb-5 pt-6">
        <Tape className="-top-2.5 left-8" rotate={-5} />
        <p className="display text-[clamp(2rem,2.6vw,2.7rem)] leading-[0.85] text-[var(--c-ink)]">{beat.mark}</p>
        <h3 className="mt-3 text-[1rem] font-semibold leading-snug text-[var(--c-ink)]">{beat.title}</h3>
        <p className="mt-2 text-[0.875rem] leading-[1.5] text-[var(--c-ink)]/80">{beat.body}</p>
      </Paper>
    </>
  );
}

function Cover() {
  return (
    <Paper tone="grid" className="relative px-5 pb-6 pt-7">
      <Tape className="-top-2.5 right-10" rotate={4} />
      <p className="meta text-[0.75rem] text-[var(--c-ink)]/60">{nightShift.cover}</p>
      <h2 id="nightshift-title" className="display mt-3 text-[clamp(2.1rem,3vw,3.1rem)] leading-[0.88] text-[var(--c-ink)]">
        {nightShift.title}
      </h2>
      <p className="mt-4 text-[0.95rem] leading-[1.5] text-[var(--c-ink)]/80">{nightShift.line}</p>
    </Paper>
  );
}

/** The terminal that prints at T-0, laid over the screen. */
function Terminal() {
  return (
    <div data-terminal className="absolute inset-0 flex items-center justify-center" style={{ opacity: 0 }}>
      {/* Set for the frame, which on a phone is shown at about half size in
          the monitor, hence the larger type there. */}
      <div className="w-[88%] md:w-[min(78%,56rem)]">
        {shipLines.map((l, i) => (
          <p
            key={i}
            data-line={l.text.length}
            className={
              l.kind === "ok"
                ? "display mt-[0.35em] text-[2.8rem] leading-[0.9] text-[var(--c-acid)] md:text-[clamp(2.4rem,7vw,7.5rem)]"
                : `text-[1.3rem] leading-[1.55] md:text-[clamp(1rem,2.1vw,2rem)] ${l.kind === "comment" ? "text-[var(--c-acid)]/55" : "text-[var(--c-bone)]"} ${l.kind === "indent" ? "pl-[1.5em] md:pl-[2em]" : ""}`
            }
            style={{ clipPath: "inset(0 100% 0 0)" }}
          >
            {l.kind === "ok" ? <Sentences text={l.text} /> : l.text}
          </p>
        ))}
      </div>
    </div>
  );
}

/** One sentence to a line, so the last line breaks where it is read, not where it runs out. */
function Sentences({ text }: { text: string }) {
  return (
    <>
      {text.split(/(?<=\.)\s+/).map((t) => (
        <span key={t} className="block">
          {t}
        </span>
      ))}
    </>
  );
}

export function NightShift() {
  const reduced = useReducedMotion();
  if (reduced) return <StillNightShift />;
  return <MovingNightShift />;
}

function MovingNightShift() {
  const root = useRef<HTMLDivElement>(null);
  const glassBox = useRef<HTMLDivElement>(null);
  const glass = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const monitor = useRef<HTMLDivElement>(null);
  const desk = useRef<HTMLDivElement>(null);
  const led = useRef<HTMLDivElement>(null);
  const pool = useRef<HTMLDivElement>(null);
  const notes = useRef<(HTMLDivElement | null)[]>([]);
  const [tube, setTube] = useState<LightPoint[]>([]);

  const layout = useRef<Layout | null>(null);
  const sizes = useRef<{ w: number; h: number }[]>([]);
  const last = useRef(0);
  const apply = useRef<(p: number) => void>(() => {});
  /** What the screens currently say, so text is only written when it changes. */
  const shown = useRef({ value: "", unit: "", lines: [] as number[] });


  useEffect(() => {
    const measure = () => {
      const el = root.current;
      if (!el) return;
      const L = layoutFor(el.offsetWidth, el.offsetHeight);
      layout.current = L;
      const { glass: g, bezel, chin, deskY, W, H } = L;

      if (monitor.current) {
        const m = monitor.current.style;
        m.left = `${g.x - bezel}px`;
        m.top = `${g.y - bezel}px`;
        m.width = `${g.w + bezel * 2}px`;
        m.height = `${g.h + bezel + chin}px`;
        m.padding = `${bezel}px ${bezel}px ${chin}px`;
        m.setProperty("--stand", `${Math.max(0, deskY - (g.y + g.h + chin))}px`);
      }
      if (glassBox.current) {
        glassBox.current.style.height = `${g.h}px`;
      }
      if (glass.current) {
        const f = L.fit;
        glass.current.style.width = `${W}px`;
        glass.current.style.height = `${H}px`;
        glass.current.style.transform = `translate(${f.x.toFixed(2)}px, ${f.y.toFixed(2)}px) scale(${f.s.toFixed(5)})`;
      }
      if (desk.current) desk.current.style.top = `${deskY}px`;
      if (led.current) {
        led.current.style.display = L.wide ? "" : "none";
        led.current.style.top = `${deskY + H * 0.036}px`;
        led.current.style.height = `${Math.round(H * 0.082)}px`;
        led.current.style.fontSize = `${Math.round(H * 0.058)}px`;
      }
      if (pool.current) pool.current.style.top = `${L.tubeY}px`;

      sizes.current = notes.current.map((n) => ({ w: n?.offsetWidth ?? 0, h: n?.offsetHeight ?? 0 }));

      if (L.wide) {
        const nw = sizes.current[0]?.w ?? 0;
        const gutter = Math.min(64, Math.max(20, W * 0.04));
        L.piles.left.x = gutter + nw / 2;
        L.piles.right.x = W - gutter - nw / 2;
      }

      const x0 = L.wide ? 0.18 : 0.1;
      setTube([
        [x0, L.tubeY / H],
        [1 - x0, L.tubeY / H],
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
    const el = root.current;
    const L = layout.current;
    if (!el || !L) return;
    const { W, H } = L;

    // The camera: out of the screen at the start, back into it at the end.
    const pull = 1 - ease(span(p, 0, PULL_TO));
    const push = ease(span(p, PUSH_FROM, 0.93));
    const d = Math.max(pull, push);
    const move = dolly(d, L.glass, L.fit, W, H);
    el.style.transform = d > 0 ? move.layer : "";
    if (screen.current) {
      screen.current.style.transform = move.picture;
      screen.current.style.visibility = d > SHARP_FROM ? "visible" : "hidden";
      // Shipped, and the monitor is switched off the way a tube screen goes:
      // the picture folds to a line through its middle, burning brighter as
      // it goes, and the line is all that is left of the night.
      const off = ease(span(p, OFF_FROM, OFF_TO));
      const tube = screen.current.querySelector<HTMLElement>("[data-tube]");
      const flash = screen.current.querySelector<HTMLElement>("[data-flash]");
      tube?.style.setProperty("transform", off > 0 ? `scaleY(${(1 - off * 0.994).toFixed(4)})` : "");
      flash?.style.setProperty("opacity", (off * 0.92).toFixed(3));
      screen.current.style.setProperty("opacity", (1 - span(p, OFF_TO, OFF_TO + 0.015)).toFixed(3));
      // The room behind is the same picture at the same size; it goes with the
      // switch, or it would stay lit behind the folding copy.
      el.style.setProperty("opacity", off > 0 ? "0" : "");
    }

    // What the screens say. Both copies, the one in the room and the sharp
    // one drawn over it while the camera is close.
    const r = readout(hoursAt(p));
    const alarm = p > arrive(ALARM) - 0.004 && p < T0 - 0.004;
    const type = span(p, TYPE_FROM, TYPE_TO);
    // Code types a character at a time; the last line lands whole, as output does.
    const lines = shipLines.map((l, i) => {
      const n = l.text.length;
      const t = span(type, i / shipLines.length, (i + 1) / shipLines.length);
      return l.kind === "ok" ? (t > 0.5 ? n : 0) : Math.floor(t * n);
    });
    const s = shown.current;
    const valueChanged = s.value !== r.value || s.unit !== r.unit;
    const linesChanged = lines.some((c, i) => c !== s.lines[i]);
    const readoutOpacity = (1 - span(p, TYPE_FROM - 0.03, TYPE_FROM)).toFixed(3);
    const terminalOpacity = span(p, TYPE_FROM - 0.01, TYPE_FROM + 0.005).toFixed(3);
    for (const host of [glass.current, screen.current]) {
      if (!host) continue;
      const sc = screenParts(host);
      host.style.setProperty("--count", alarm ? "var(--c-orange)" : "var(--c-acid)");
      if (sc.readout) sc.readout.style.opacity = readoutOpacity;
      if (valueChanged) {
        if (sc.count) sc.count.textContent = r.value;
        if (sc.unit) sc.unit.textContent = r.unit;
      }
      if (sc.terminal) sc.terminal.style.opacity = terminalOpacity;
      if (linesChanged) {
        sc.lines.forEach((ln, i) => {
          const n = shipLines[i].text.length;
          ln.style.clipPath = `inset(0 ${(((n - lines[i]) / n) * 100).toFixed(2)}% 0 0)`;
        });
      }
    }
    s.value = r.value;
    s.unit = r.unit;
    s.lines = lines;

    // The tube and the light it throws on the wall.
    const glow = stutter(p) * (1 - span(p, PUSH_FROM, 0.95));
    if (pool.current) pool.current.style.opacity = glow.toFixed(3);

    // The notes.
    const lands = Array.from({ length: NOTES }, (_, k) => settleOut(span(p, landsAt(k) - LAND, landsAt(k))));
    const square = ease(span(p, SQUARE_FROM, SQUARE_TO));
    // The notes clear before the sharp screen is drawn over the glass they overlap.
    const clear = 1 - span(p, PUSH_FROM, PUSH_FROM + 0.04);
    let newest = -1;
    lands.forEach((l, k) => {
      if (l > 0.5) newest = k;
    });
    const depthIn: Record<number, number> = { [-1]: 0, [1]: 0 };
    notes.current.forEach((n, k) => {
      if (!n) return;
      const land = lands[k];
      n.style.visibility = land > 0 && clear > 0 ? "visible" : "hidden";
      if (land <= 0) return;
      const side = L.wide ? sideOf(k) : 1;
      const pile = side < 0 ? L.piles.left : L.piles.right;
      const { w, h } = sizes.current[k] ?? { w: 0, h: 0 };

      // Knocked by every note that has landed on top of it since.
      let kx = 0;
      let ky = 0;
      let kr = 0;
      let covered = 0;
      for (let m = k + 1; m < NOTES; m++) {
        if (L.wide && sideOf(m) !== sideOf(k)) continue;
        const lm = lands[m];
        if (lm <= 0) continue;
        const kn = knock(k, m);
        kx += kn.x * lm;
        ky += kn.y * lm;
        kr += kn.r * lm;
        covered += lm;
      }
      const rest = REST[k % REST.length];
      const messy = {
        x: pile.x + rest.x + kx,
        y: pile.y + rest.y + ky,
        r: rest.r * (L.wide ? 1 : side) + kr,
      };
      // Squared up at T-0: a neat stack, each sheet a hair above the last.
      const order = depthIn[side]++;
      const neat = { x: pile.x, y: pile.y - order * 3, r: 0 };
      const x = messy.x + (neat.x - messy.x) * square;
      const y = messy.y + (neat.y - messy.y) * square;
      const rot = messy.r + (neat.r - messy.r) * square;

      // Going up: from a little nearer the camera, settling onto the pile.
      const lift = 1 - land;
      const sc = 1 + 0.1 * lift;
      n.style.transform = `translate3d(${(x - w / 2).toFixed(1)}px, ${(y - h / 2 - 26 * lift).toFixed(1)}px, 0) rotate(${(rot + side * 4 * lift).toFixed(2)}deg) scale(${sc.toFixed(4)})`;
      n.style.opacity = (Math.min(1, land * 2.5) * clear).toFixed(3);

      // Sheets underneath fall into the shadow of the ones on top, and the
      // other pile dims a little, so the eye goes to the note just put up.
      const other = newest >= 0 && L.wide && sideOf(newest) !== sideOf(k) ? 0.22 : 0;
      const shade = Math.min(0.62, covered * 0.3 + other) * (1 - square * 0.5);
      const sh = shadeOf(n);
      if (sh) sh.style.opacity = shade.toFixed(3);
    });
  }, []);

  useEffect(() => {
    apply.current = onProgress;
  }, [onProgress]);

  const lineOn = useCallback((p: number) => span(p, OFF_TO - 0.012, OFF_TO + 0.006), []);
  const tubeIntensity = useCallback((p: number) => stutter(p) * (1 - span(p, PUSH_FROM, 0.95)), []);
  const first = readout(beats[0].hours);

  return (
    <Scene continues id="nightshift" vh={560} vhMobile={420} settled={arrive(0)} onProgress={onProgress} aria-labelledby="nightshift-title">
      <div ref={root} className="absolute inset-0 origin-top-left">
        {/* The light the tube throws on the wall. */}
        <div
          ref={pool}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 h-[70vh]"
          style={{ background: "radial-gradient(48% 62% at 50% 0%, color-mix(in srgb, var(--c-bone) 9%, transparent), transparent 72%)" }}
        />
        {tube.length ? <Light kind="fixture" points={tube} intensity={tubeIntensity} /> : null}

        {/* The desk: a top edge catching the tube, then the front. */}
        <div ref={desk} aria-hidden="true" className="absolute inset-x-0 bottom-0 bg-[#111310]">
          <div className="h-[2.4vh] border-t border-[var(--c-steel)]/40 bg-[linear-gradient(#22252a,#15171a)]" />
        </div>

        <div ref={led} className="absolute left-[12%] right-[12%]">
          <LedSign words={nightShift.sign} className="h-full w-full" travel={0.42} />
        </div>

        {/* The monitor. The glass holds the frame-sized screen, scaled down. */}
        <div
          ref={monitor}
          aria-hidden="true"
          className="absolute bg-[var(--bezel)] shadow-[var(--shadow-lifted)]"
          style={{ outline: "1px solid color-mix(in srgb, var(--c-steel) 55%, transparent)" }}
        >
          <div ref={glassBox} className="relative overflow-hidden bg-[var(--screen)]">
            <div ref={glass} className="absolute left-0 top-0 origin-top-left">
              <MonitorScreen value={first.value} unit={first.unit}>
                <Terminal />
              </MonitorScreen>
            </div>
          </div>
          <div className="absolute left-1/2 top-full h-[var(--stand)] w-[7%] -translate-x-1/2 bg-[var(--bezel)]" />
          <div className="absolute left-1/2 top-[calc(100%+var(--stand)-0.5vh)] h-[1vh] w-[28%] -translate-x-1/2 bg-[var(--bezel)]" />
        </div>

        {/* The notes. */}
        {Array.from({ length: NOTES }, (_, k) => (
          <div
            key={k}
            ref={(n) => {
              notes.current[k] = n;
            }}
            className="absolute left-0 top-0 w-[min(88vw,23rem)] lg:w-[clamp(17rem,23vw,22rem)]"
            style={{ visibility: "hidden", zIndex: 10 + k }}
          >
            {k === 0 ? <Cover /> : <Note beat={noteBeats[k - 1]} flag={k - 1 === ALARM} />}
            <span data-shade aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[var(--c-ink)]" style={{ opacity: 0 }} />
          </div>
        ))}
      </div>

      {/* The screen again, sharp, riding the camera while it is close. */}
      <div ref={screen} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-full w-full origin-top-left" style={{ visibility: "hidden", zIndex: 40 }}>
        <div data-tube className="absolute inset-0">
          <MonitorScreen value={first.value} unit={first.unit}>
            <Terminal />
          </MonitorScreen>
          {/* The flash of a tube screen going off: the picture burns white as it folds. */}
          <div data-flash className="absolute inset-0 bg-[var(--light-core)]" style={{ opacity: 0 }} />
        </div>
      </div>

      {/* What the screen folds into when it is switched off. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ zIndex: 41 }}>
        <Light points={LINE} intensity={lineOn} />
      </div>

      <p className="sr-only">{shipLines[shipLines.length - 1].text}</p>
    </Scene>
  );
}

/** Reduced motion: the same notes, laid out to be read, and the terminal. */
function StillNightShift() {
  return (
    <Scene id="nightshift" aria-labelledby="nightshift-title" stageClassName="px-[var(--gutter)] py-[14vh]">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <Cover />
        {noteBeats.map((b, i) => (
          <div key={b.mark} className="relative">
            <Note beat={b} flag={i === ALARM} />
          </div>
        ))}
      </div>
      <div className="mt-12 bg-[var(--screen)] px-6 py-8">
        {shipLines.map((l, i) => (
          <p
            key={i}
            className={
              l.kind === "ok"
                ? "display mt-3 text-[clamp(2.2rem,5vw,4.5rem)] leading-[0.9] text-[var(--c-acid)]"
                : `text-[1.05rem] leading-[1.6] ${l.kind === "comment" ? "text-[var(--c-acid)]/60" : "text-[var(--c-bone)]"} ${l.kind === "indent" ? "pl-[2em]" : ""}`
            }
          >
            {l.kind === "ok" ? <Sentences text={l.text} /> : l.text}
          </p>
        ))}
      </div>
    </Scene>
  );
}
