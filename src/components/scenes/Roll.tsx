"use client";

/**
 * 07 The roll
 * Everyone inducted this year, printed on the same run of paper as the
 * schedule, and counted as it goes past.
 *
 * The first month ended on a fold with fresh paper under it; this scene starts
 * on that exact frame. The paper feeds up, and its header is the number,
 * stamped: 186. Then the names, dot-matrix, in the order the list came in.
 *
 * A scanner bar is fixed across the frame. The paper moves under it, every
 * name gets a tick as it crosses, and the count in the dark beside the sheet
 * runs from 000 to 186. The count and the ticks are one number: how far the
 * paper has fed. Nothing is animated per name, so it costs the same with 186
 * names as it would with ten.
 *
 * Looking yourself up feeds the paper to you. Pick a result and the page
 * scrolls until that name is under the scanner, and it gets a highlighter
 * stroke.
 *
 * Progress:
 *   0.00 - 0.96   the paper feeds up past the scanner
 */

import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";
import { useLenis } from "lenis/react";
import { Scene } from "@/components/world/Scene";
import { Light, span, type LightPoint } from "@/components/world/Light";
import { Stamp } from "@/components/world/Label";
import { ActionLink } from "@/components/world/ActionLink";
import { FOLD_AT } from "@/components/scenes/FirstMonth";
import { useReducedMotion } from "@/lib/useMedia";
import { findInductees, list, roll } from "@/content/home";

const FEED_FROM = 0.0;
const FEED_TO = 0.96;
/** Where the scanner sits on the frame. */
const SCAN_AT = 0.54;

const pad = (n: number) => String(n).padStart(3, "0");

function beamOn(p: number) {
  return span(p, 0.02, 0.08) * (1 - span(p, 0.93, 0.99));
}

type Layout = { H: number; top: number; listTop: number; listH: number; rowH: number; cols: number; end: number };

function travelAt(p: number, L: Layout) {
  return span(p, FEED_FROM, FEED_TO) * L.end;
}

/** The progress at which the paper has fed far enough to put `row` under the scanner. */
function progressForRow(row: number, L: Layout) {
  const want = L.top + L.listTop + (row + 0.5) * L.rowH - L.H * SCAN_AT;
  return FEED_FROM + Math.min(1, Math.max(0, want / L.end)) * (FEED_TO - FEED_FROM);
}

/** The search on the roll's header. Results are a short printed list under the field. */
function Search({ onPick, found }: { onPick: (index: number) => void; found: number | null }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => findInductees(q), [q]);
  const id = useId();
  const { search } = roll;
  return (
    <div className="relative">
      <label htmlFor={`${id}-q`} className="display block text-[1.5rem] leading-none text-[var(--c-ink)]">
        {search.label}
      </label>
      <p id={`${id}-hint`} className="meta mt-1.5 text-[0.75rem] text-[var(--c-ink)]/65">
        {search.hint}
      </p>
      <input
        id={`${id}-q`}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && results[0]) onPick(results[0].index);
        }}
        placeholder={search.placeholder}
        aria-describedby={`${id}-hint`}
        autoComplete="off"
        spellCheck={false}
        className="mt-3 block w-full border-b-2 border-[var(--c-ink)] bg-transparent py-2 text-[1.15rem] text-[var(--c-ink)] outline-none placeholder:text-[var(--c-ink)]/45 focus-visible:border-[var(--c-blue)]"
      />
      <div aria-live="polite" className="mt-2 min-h-[1.5rem]">
        {q.trim() && results.length === 0 ? <p className="text-[0.95rem] text-[var(--c-ink)]/75">{search.empty}</p> : null}
        {results.length ? (
          <ul className="divide-y divide-[var(--c-ink)]/15 border-y border-[var(--c-ink)]/15">
            {results.map((r) => (
              <li key={r.index}>
                <button
                  type="button"
                  onClick={() => onPick(r.index)}
                  aria-current={found === r.index ? "true" : undefined}
                  className="flex w-full items-baseline justify-between gap-4 py-2 text-left text-[var(--c-ink)] hover:text-[var(--c-blue)] focus-visible:text-[var(--c-blue)]"
                >
                  <span className="font-medium">{r.name}</span>
                  <span className="meta text-[0.75rem] opacity-70">{r.id ?? search.noId}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

/** The printed roll: header, names, small print. The same markup, moving or still. */
function RollPaper({
  onPick,
  found,
  listRef,
  counterless = false,
}: {
  onPick: (index: number) => void;
  found: number | null;
  listRef?: (n: HTMLOListElement | null) => void;
  counterless?: boolean;
}) {
  return (
    <div className="fanfold border-t-2 border-dashed border-[var(--c-ink)]/40">
      {/* The run starts blank, the way the schedule's last frame left it; the
          header feeds up into view from below. The still version skips it. */}
      <div
        className={`grid gap-10 px-[max(7%,3.6rem)] pb-[8vh] lg:grid-cols-[auto_minmax(0,1fr)] lg:items-end lg:gap-[5vw] ${counterless ? "pt-[12vh]" : "pt-[98vh]"}`}
      >
        <div>
          <h2 id="roll-title" className="sr-only">{`${roll.count} ${roll.line}`}</h2>
          <Stamp rotate={-4} className="border-[6px] px-[0.12em] pb-[0.02em] pt-[0.08em] text-[clamp(7rem,19vw,22rem)] leading-[0.8]">
            {roll.count}
          </Stamp>
          <p aria-hidden="true" className="display mt-5 text-[clamp(1.8rem,2.8vw,2.8rem)] leading-none text-[var(--c-ink)]">
            {roll.line}
          </p>
        </div>
        <div className="lg:max-w-[24rem] lg:pb-2">
          <Search onPick={onPick} found={found} />
        </div>
      </div>

      <ol
        ref={listRef}
        className="dotmatrix grid px-[max(7%,3.6rem)] md:grid-cols-2 md:gap-x-[4vw]"
        style={counterless ? ({ ["--counted" as string]: list.length } as CSSProperties) : undefined}
      >
        {list.map((p, i) => (
          <li
            key={`${p.name}-${i}`}
            data-row={i}
            className="relative flex h-[2.3rem] items-center gap-3 border-b border-dotted border-[var(--c-ink)]/20 text-[0.95rem] uppercase text-[var(--c-ink)]"
            style={{ ["--i" as string]: i } as CSSProperties}
          >
            {/* The highlighter, for a name that has been looked up. */}
            <span
              aria-hidden="true"
              className="absolute inset-y-[0.35rem] -left-2 -right-2 origin-left bg-[var(--c-acid)] mix-blend-multiply transition-transform duration-[1.1s] ease-[var(--ease-out-expo)]"
              style={{ transform: `scaleX(${found === i ? 1 : 0})`, transitionDelay: found === i ? "0.9s" : "0s" }}
            />
            {/* The tick, once the name has been counted. */}
            <span
              aria-hidden="true"
              className="relative block h-[0.7rem] w-[0.4rem] shrink-0 -translate-y-[0.1rem] rotate-45 border-b-2 border-r-2 border-[var(--c-blue)]"
              style={{ opacity: "clamp(0, var(--counted, 0) - var(--i), 1)" }}
            />
            <span className="relative w-[2.6rem] shrink-0 tabular-nums text-[var(--c-ink)]/55">{pad(i + 1)}</span>
            <span className="relative min-w-0 flex-1 truncate font-semibold tracking-[0.02em]">{p.name}</span>
            <span className="relative shrink-0 text-[0.8rem] tabular-nums text-[var(--c-ink)]/65">{p.id ?? roll.search.noId}</span>
          </li>
        ))}
      </ol>

      <div className="grid gap-6 px-[max(7%,3.6rem)] pb-[14vh] pt-[8vh] md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <p className="max-w-[46ch] text-[0.9rem] leading-[1.55] text-[var(--c-ink)]/75">{roll.note}</p>
        <ActionLink href={roll.link.href} className="text-[1rem] text-[var(--c-ink)]">
          {roll.link.label}
        </ActionLink>
      </div>
    </div>
  );
}

export function Roll() {
  const reduced = useReducedMotion();
  const [found, setFound] = useState<number | null>(null);
  if (reduced) {
    return (
      <Scene id="roll" aria-labelledby="roll-title" stageClassName="px-[var(--gutter)] py-[10vh]">
        <div className="mx-auto max-w-[72rem]">
          <RollPaper
            counterless
            found={found}
            onPick={(i) => {
              setFound(i);
              document.querySelector(`#roll [data-row="${i}"]`)?.scrollIntoView({ block: "center" });
            }}
          />
        </div>
      </Scene>
    );
  }
  return <MovingRoll found={found} setFound={setFound} />;
}

function MovingRoll({ found, setFound }: { found: number | null; setFound: (i: number | null) => void }) {
  const sheet = useRef<HTMLDivElement>(null);
  const listEl = useRef<HTMLOListElement | null>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const small = useRef<HTMLSpanElement>(null);
  const layout = useRef<Layout>({ H: 1, top: 0, listTop: 0, listH: 1, rowH: 1, cols: 1, end: 1 });
  const last = useRef(0);
  const shown = useRef(-1);
  const apply = useRef<(p: number) => void>(() => {});
  const lenis = useLenis();
  const [beam, setBeam] = useState<LightPoint[]>([]);

  useEffect(() => {
    const measure = () => {
      const s = sheet.current;
      const l = listEl.current;
      if (!s || !l) return;
      const H = s.parentElement?.offsetHeight ?? window.innerHeight;
      const first = l.firstElementChild as HTMLElement | null;
      const rowH = first?.offsetHeight ?? 36;
      const cols = window.getComputedStyle(l).gridTemplateColumns.split(" ").length;
      const listTop = l.offsetTop;
      const listH = l.offsetHeight;
      // Feed until the last name is past the scanner and the small print is up.
      const end = listTop + listH - H * SCAN_AT + H * 0.42;
      layout.current = { H, top: s.offsetTop, listTop, listH, rowH, cols, end };
      setBeam([
        [0, SCAN_AT],
        [1, SCAN_AT],
      ]);
      shown.current = -1;
      requestAnimationFrame(() => apply.current(last.current));
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const onProgress = useCallback((p: number) => {
    last.current = p;
    const s = sheet.current;
    const l = listEl.current;
    if (!s || !l) return;
    const L = layout.current;
    const travel = travelAt(p, L);
    s.style.setProperty("transform", `translate3d(0, ${(-travel).toFixed(1)}px, 0)`);
    // The scanner and the count come on once the paper is moving, and go off
    // once the last of it has passed.
    s.parentElement?.style.setProperty("--lit", (beamOn(p)).toFixed(3));

    // Rows whose middle has crossed the scanner, times the names per row.
    const passed = (L.H * SCAN_AT + travel - L.top - L.listTop) / L.rowH;
    const counted = Math.max(0, Math.min(list.length, Math.floor(passed + 0.5) * L.cols));
    if (counted !== shown.current) {
      shown.current = counted;
      l.style.setProperty("--counted", String(counted));
      if (counter.current) counter.current.textContent = pad(counted);
      if (small.current) small.current.textContent = pad(counted);
    }
  }, []);

  useEffect(() => {
    apply.current = onProgress;
  }, [onProgress]);

  const pick = (i: number) => {
    setFound(i);
    const L = layout.current;
    const p = progressForRow(Math.floor(i / L.cols), L);
    const sec = document.getElementById("roll");
    if (!sec) return;
    const y = sec.getBoundingClientRect().top + window.scrollY + (sec.offsetHeight - window.innerHeight) * p;
    if (lenis) lenis.scrollTo(y, { duration: 1.6 });
    else window.scrollTo({ top: y });
  };

  const beamIntensity = useCallback((p: number) => beamOn(p), []);

  return (
    <Scene id="roll" vh={560} vhMobile={900} settled={0.3} onProgress={onProgress} aria-labelledby="roll-title">
      {/* The count, in the dark beside the sheet. */}
      <p
        aria-hidden="true"
        className="display pointer-events-none absolute left-[var(--gutter)] top-1/2 hidden -translate-y-1/2 text-[clamp(7rem,13vw,13rem)] leading-[0.8] tabular-nums text-[var(--c-bone)] md:block"
        style={{ opacity: "var(--lit, 0)" }}
      >
        <span ref={counter}>000</span>
        <span className="meta mt-4 block text-[0.8rem] normal-case tracking-[0.04em] text-[var(--c-gray)]">{`/ ${roll.count} ${roll.counted}`}</span>
      </p>

      <div
        ref={sheet}
        className="absolute left-[4vw] right-[4vw] will-change-transform md:left-[30vw] md:right-[6vw]"
        style={{ top: `${FOLD_AT * 100}%` }}
      >
        <RollPaper
          found={found}
          onPick={pick}
          listRef={(n) => {
            listEl.current = n;
          }}
        />
      </div>

      {/* The scanner: a bar of light fixed across the frame, and the band it
          throws on the paper under it. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0" style={{ top: `${SCAN_AT * 100}%`, opacity: "var(--lit, 0)" }}>
        <div className="absolute left-[4vw] right-[4vw] top-0 h-[2.6rem] -translate-y-1/2 bg-[linear-gradient(transparent,color-mix(in_srgb,var(--c-blue)_12%,transparent)_45%,color-mix(in_srgb,var(--c-blue)_12%,transparent)_55%,transparent)] md:left-[30vw] md:right-[6vw]" />
      </div>
      {beam.length ? <Light points={beam} kind="scan" intensity={beamIntensity} /> : null}

      {/* On a phone the count rides at the foot of the frame. */}
      <p
        aria-hidden="true"
        className="meta pointer-events-none absolute bottom-[3vh] right-[var(--gutter)] bg-[var(--c-ink)] px-3 py-1.5 text-[0.85rem] text-[var(--c-bone)] md:hidden"
        style={{ opacity: "var(--lit, 0)" }}
      >
        <span ref={small}>000</span>
        {` / ${roll.count}`}
      </p>
    </Scene>
  );
}
