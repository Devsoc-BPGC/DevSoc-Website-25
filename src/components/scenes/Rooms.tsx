"use client";

/**
 * 03 Rooms, the flywheel
 * The six rooms as one mechanism: a rotary card index on a drafting table.
 *
 * It starts from the ring the plan left behind, placed by the same function,
 * so the first frame is the last frame of Society. The ring tips back into a
 * turntable and spins half a turn to bring R-01 to the front, the way a
 * mechanism takes up its slack before it starts to work. Then scroll turns it
 * one room at a time, with a dwell at each so the room at the front can be
 * read, and the readout on the left prints that room in full.
 *
 * The cards are placed by projecting the tilted ring by hand rather than by
 * nesting CSS 3D: position, perspective scale and stacking order all come from
 * one number per card, which is exact, cheap, and sorts front to back without
 * relying on the browser's preserve-3d ordering. At zero tilt the projection
 * is the ring itself, which is what makes the handoff from Society seamless.
 *
 * A lit tube runs round the rim as the wheel turns. At the end the camera
 * pushes into the small monitor on the hub and its screen fills the frame;
 * the night shift begins inside that screen.
 *
 * Progress:
 *   0.00 - 0.14   tilt into a turntable, half a turn to R-01
 *   0.14 - 0.84   one room per sixth, with a dwell at each
 *   0.86 - 1.00   push into the hub monitor
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { Scene } from "@/components/world/Scene";
import { RoomModule } from "@/components/world/RoomModule";
import { Light, span, type LightPoint } from "@/components/world/Light";
import { MonitorScreen, dolly, screenFit } from "@/components/world/MonitorScreen";
import { ringFrame, RING_N } from "@/components/world/ring";
import { rooms, roomsCopy, beats } from "@/content/home";

const ease = (t: number) => t * t * (3 - 2 * t);
const DEG = Math.PI / 180;

const TILT_TO = 0.14;
const TURN_FROM = 0.14;
const TURN_TO = 0.84;
const PUSH_FROM = 0.86;
const PERSPECTIVE = 1500;

/** Which room is at the front, continuously, with a dwell at each one. */
function turnOf(p: number) {
  const raw = span(p, TURN_FROM, TURN_TO) * (RING_N - 1);
  const i = Math.floor(raw);
  if (i >= RING_N - 1) return RING_N - 1;
  return i + ease(Math.min(1, Math.max(0, (raw - i - 0.3) / 0.4)));
}

/** Progress at which room `i` is squarely at the front. */
function progressFor(i: number) {
  return TURN_FROM + (i / (RING_N - 1)) * (TURN_TO - TURN_FROM);
}

/** Where the turntable ends up: to the right on a wide screen, between the heading and the readout on a phone. */
function table(w: number, h: number) {
  const narrow = w < 768;
  const start = ringFrame(w, h);
  return {
    start,
    cx: narrow ? w * 0.5 : w * 0.66,
    cy: narrow ? h * 0.45 : h * 0.58,
    r: start.r,
    /** How far the table is tipped. Less on a phone, where the ring is
     *  small enough that a steep tip stacks the six cards on each other. */
    tilt: narrow ? 42 : 62,
  };
}

const first = beats[0];
const days = String(Math.floor(first.hours / 24));

export function Rooms() {
  const root = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const reads = useRef<(HTMLDivElement | null)[]>([]);
  const monitor = useRef<HTMLDivElement>(null);
  const glass = useRef<HTMLDivElement>(null);
  const glassBox = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const [rim, setRim] = useState<LightPoint[]>([]);
  /**
   * Sizes that only change on resize. Reading a card's size inside the scroll
   * handler would force a layout on every frame, so they are measured here and
   * the handler only ever writes transforms.
   */
  const size = useRef({ cw: 0, ch: 0, mw: 0, mh: 0, W: 1, H: 1, fit: { s: 1, x: 0, y: 0 } });
  /** The last progress, re-applied once sizes are known: the stage reports
   *  its first progress before this component's effects have measured. */
  const last = useRef(0);
  const apply = useRef<(p: number) => void>(() => {});

  // The rim of the turntable as a route for the light, rebuilt on resize.
  useEffect(() => {
    const build = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const t = table(w, h);
      const ry = t.r * Math.cos(t.tilt * DEG);
      const pts: LightPoint[] = [];
      for (let k = 0; k <= 72; k++) {
        const a = Math.PI / 2 + (k / 72) * Math.PI * 2;
        pts.push([(t.cx + t.r * 1.12 * Math.cos(a)) / w, (t.cy + ry * 1.12 * Math.sin(a)) / h]);
      }
      setRim(pts);
    };
    const measure = () => {
      const w = window.innerWidth;
      const c = cards.current[0];
      const W = root.current?.offsetWidth || w;
      const H = root.current?.offsetHeight || window.innerHeight;
      const mw = w < 768 ? w * 0.26 : Math.max(118, w * 0.12);
      // The bezel is 5% of the width on every side. The glass takes the
      // frame's own shape where that is a plausible monitor, so the push lands
      // edge to edge; on a phone it stays landscape and the picture sits in it.
      const sw = mw * 0.9;
      const sh = sw / Math.min(1.8, Math.max(1.25, W / H));
      const fit = screenFit(sw, sh, W, H);
      size.current = { cw: c?.offsetWidth ?? 0, ch: c?.offsetHeight ?? 0, mw, mh: sh + mw * 0.1, W, H, fit };
      if (monitor.current) {
        monitor.current.style.width = `${mw.toFixed(0)}px`;
        monitor.current.style.fontSize = `${(sh * 0.22).toFixed(1)}px`;
      }
      if (glassBox.current) glassBox.current.style.aspectRatio = `${sw.toFixed(2)} / ${sh.toFixed(2)}`;
      // The frame-sized screen, shrunk into the glass.
      if (glass.current) {
        glass.current.style.width = `${W}px`;
        glass.current.style.height = `${H}px`;
        glass.current.style.transform = `translate(${fit.x.toFixed(2)}px, ${fit.y.toFixed(2)}px) scale(${fit.s.toFixed(5)})`;
      }
      // A frame later, when the handler below has been registered.
      requestAnimationFrame(() => apply.current(last.current));
    };
    const both = () => {
      build();
      measure();
    };
    both();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", both);
    return () => window.removeEventListener("resize", both);
  }, []);

  const onProgress = useCallback((p: number) => {
    last.current = p;
    const el = root.current;
    if (!el) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const t = table(w, h);

    const settle = ease(span(p, 0, TILT_TO));
    const tilt = t.tilt * settle * DEG;
    const cx = t.start.cx + (t.cx - t.start.cx) * settle;
    const cy = t.start.cy + (t.cy - t.start.cy) * settle;
    const k = turnOf(p);
    const spin = p < TURN_FROM ? 180 * settle : 180 - 60 * k;
    const push = ease(span(p, PUSH_FROM, 1));
    // The cards clear out early in the push: on a narrow frame the front card
    // stands right under the monitor and would be carried across the screen.
    const clear = 1 - span(p, PUSH_FROM, PUSH_FROM + 0.06);

    el.style.setProperty("--settle", settle.toFixed(3));
    el.style.setProperty("--copy", (span(p, 0.06, 0.14) * (1 - span(p, PUSH_FROM, 0.92))).toFixed(3));
    el.style.setProperty("--push", push.toFixed(3));

    // The cards, projected off the tilted ring.
    cards.current.forEach((c, i) => {
      if (!c) return;
      const a = (-90 + 60 * i + spin) * DEG;
      const z = t.r * Math.sin(a) * Math.sin(tilt);
      const s = PERSPECTIVE / (PERSPECTIVE - z);
      const x = cx + t.r * Math.cos(a) * s;
      const y = cy + t.r * Math.sin(a) * Math.cos(tilt) * s;
      const { cw, ch } = size.current;
      // Centred on its slot while flat; standing on the rim once tipped.
      const ay = ch * (0.5 + 0.5 * settle);
      c.style.transform = `translate3d(${(x - cw / 2).toFixed(1)}px, ${(y - ay * s).toFixed(1)}px, 0) scale(${s.toFixed(3)})`;
      c.style.zIndex = String(Math.round(z) + 1000);
      const depth = (Math.sin(a) + 1) / 2;
      c.style.opacity = ((0.55 + 0.45 * (settle < 1 ? 1 - settle * (1 - depth) : depth)) * clear).toFixed(3);
      c.style.visibility = clear > 0 ? "visible" : "hidden";
    });

    // The readout follows whichever room is at the front, continuously, so
    // reversing runs it backwards.
    reads.current.forEach((r, i) => {
      if (!r) return;
      const wgt = Math.max(0, 1 - Math.abs(k - i) * 2.4) * (p < TURN_FROM ? (i === 0 ? settle : 0) : 1);
      r.style.opacity = wgt.toFixed(3);
      r.style.transform = `translateY(${((k - i) * -18).toFixed(1)}px)`;
    });

    // The monitor on the hub, and the push into its screen.
    const { mw, mh, W, H, fit } = size.current;
    const stand = mh * 0.18;
    if (monitor.current) {
      const m = monitor.current;
      m.style.transform = `translate3d(${(cx - mw / 2).toFixed(1)}px, ${(cy - mh - stand).toFixed(1)}px, 0) scale(${(0.4 + 0.6 * settle).toFixed(3)})`;
      m.style.opacity = settle.toFixed(3);
    }
    // The push is a camera move: the whole table is scaled about the glass
    // until the glass is the frame, so the bezel, the stand and the cards all
    // travel out past the edges together.
    const move = dolly(push, { x: cx - mw / 2 + mw * 0.05, y: cy - mh - stand + mw * 0.05 }, fit, W, H);
    el.style.transform = push > 0 ? move.layer : "";
    if (screen.current) {
      // The glass itself is drawn again on top at its own size, riding the
      // same move, so the screen stays sharp however far the camera goes in.
      screen.current.style.transform = move.picture;
      screen.current.style.visibility = push > 0 ? "visible" : "hidden";
    }
  }, []);

  useEffect(() => {
    apply.current = onProgress;
  }, [onProgress]);

  const drawRim = useCallback((p: number) => [0, span(p, TURN_FROM, TURN_TO)] as const, []);
  const rimIntensity = useCallback((p: number) => span(p, 0.1, TURN_FROM) * (1 - span(p, PUSH_FROM, 0.93)), []);

  const turnTo = (i: number) => {
    const sec = document.getElementById("rooms");
    if (!sec) return;
    const top = sec.getBoundingClientRect().top + window.scrollY;
    const y = top + (sec.offsetHeight - window.innerHeight) * progressFor(i);
    if (lenis) lenis.scrollTo(y, { duration: 1.4 });
    else window.scrollTo({ top: y });
  };

  return (
    <Scene id="rooms" vh={480} vhMobile={380} settled={progressFor(0)} onProgress={onProgress} aria-labelledby="rooms-title">
      <div ref={root} className="absolute inset-0 origin-top-left">
        {/* The tube round the rim. */}
        {rim.length ? <Light points={rim} draw={drawRim} intensity={rimIntensity} /> : null}

        {/* The hub, with its monitor. */}
        <div ref={monitor} className="pointer-events-none absolute left-0 top-0 origin-bottom" style={{ opacity: 0, zIndex: 1003 }} aria-hidden="true">
          <div className="border border-[var(--c-steel)]/60 bg-[var(--bezel)] p-[5%] shadow-[var(--shadow-paper)]">
            <div ref={glassBox} className="relative overflow-hidden bg-[var(--screen)]" style={{ aspectRatio: "1 / 0.64" }}>
              <div ref={glass} className="absolute left-0 top-0 origin-top-left">
                <MonitorScreen value={days} unit="days" />
              </div>
            </div>
          </div>
          <div className="mx-auto h-[0.8em] w-[14%] bg-[var(--bezel)]" />
          <div className="mx-auto h-[0.14em] w-[42%] bg-[var(--bezel)]" />
        </div>

        {/* The cards. */}
        {rooms.map((r, i) => (
          <button
            key={r.id}
            type="button"
            ref={(n) => {
              cards.current[i] = n;
            }}
            onClick={() => turnTo(i)}
            aria-label={`Turn to ${r.number}, ${r.name}`}
            data-cursor={r.number}
            className="group absolute left-0 top-0 origin-bottom text-left"
          >
            <span className="block transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-translate-y-2 group-hover:-rotate-2 group-focus-visible:-translate-y-2">
              <RoomModule room={r} style={{ ["--on" as string]: 1 }} />
            </span>
          </button>
        ))}

        {/* The heading, and the readout of the room at the front. */}
        <div
          className="pointer-events-none absolute left-[var(--gutter)] right-[var(--gutter)] top-[11vh] md:right-auto md:max-w-[40vw]"
          style={{ opacity: "var(--copy, 0)" }}
        >
          <h2 id="rooms-title" className="display text-[clamp(2.2rem,4vw,4rem)] leading-[0.9] text-[var(--c-bone)]">
            {roomsCopy.title}
          </h2>
          <p className="body-copy mt-3 max-w-[34ch]">{roomsCopy.line}</p>
        </div>

        <div
          className="pointer-events-none absolute bottom-[8vh] left-[var(--gutter)] right-[var(--gutter)] md:right-auto md:w-[40vw]"
          style={{ opacity: "var(--copy, 0)" }}
        >
          <div className="relative h-[34vh] md:h-[46vh]">
            {rooms.map((r, i) => (
              <div
                key={`read-${r.id}`}
                ref={(n) => {
                  reads.current[i] = n;
                }}
                className="absolute inset-x-0 bottom-0"
                style={{ opacity: i === 0 ? 1 : 0 }}
              >
                <p className="display leading-[0.8] text-[var(--c-blue)]" style={{ fontSize: "clamp(4.5rem, 12vw, 10.5rem)" }}>
                  {r.number}
                </p>
                <h3 className="display mt-3 text-[clamp(1.6rem,2.6vw,2.6rem)] leading-[0.95] text-[var(--c-bone)]">{r.name}</h3>
                <p className="mt-3 max-w-[34ch] text-[clamp(1rem,1.2vw,1.15rem)] leading-[1.5] text-[var(--c-bone)]/85">{r.doing}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Inside the monitor: the screen that fills the frame. Outside the
          table's layer, so the camera move does not scale it twice. */}
      <div
        ref={screen}
        className="pointer-events-none absolute left-0 top-0 h-full w-full origin-top-left"
        style={{ visibility: "hidden" }}
        aria-hidden="true"
      >
        <MonitorScreen value={days} unit="days" />
      </div>
    </Scene>
  );
}
