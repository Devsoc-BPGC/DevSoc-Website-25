"use client";

/**
 * 07 The roll
 * Everyone inducted this year, printed on one run of continuous paper and
 * counted as it goes past.
 *
 * The first month's calendar hangs on the wall above; the camera carries on
 * down the same wall to where the printout hangs. Its header is the number,
 * stamped: 186. Then the names, dot-matrix, in the order the list came in.
 *
 * A scanner bar is fixed across the frame. The paper goes up under it, every
 * name gets a tick as it crosses, and the count in the dark beside the sheet
 * runs from 000 to 186. The count and the ticks are one number: how far the
 * list has passed the scanner. Nothing is animated per name, so it costs the
 * same with 186 names as it would with ten.
 *
 * The paper is the page scrolling, not a sheet moved by hand: a sheet this
 * tall moved with a transform is more than some GPUs can keep painted while
 * it travels, and it flashes black. Only the scanner and the count are pinned.
 *
 * Looking yourself up brings the paper to you. Pick a result and the page
 * scrolls until that name is under the scanner, and it gets a highlighter
 * stroke.
 */

import { useId, useMemo, useRef, useState, type CSSProperties } from "react";
import { useLenis } from "lenis/react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Light, type LightPoint } from "@/components/world/Light";
import { Stamp } from "@/components/world/Label";
import { ActionLink } from "@/components/world/ActionLink";
import { useReducedMotion } from "@/lib/useMedia";
import { findInductees, list, roll } from "@/content/home";

/** Where the scanner sits on the frame. */
const SCAN_AT = 0.54;

const pad = (n: number) => String(n).padStart(3, "0");

/** The scanner line, straight across the frame. */
const BEAM: LightPoint[] = [
  [0, SCAN_AT],
  [1, SCAN_AT],
];

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
}: {
  onPick: (index: number) => void;
  found: number | null;
  listRef?: (n: HTMLOListElement | null) => void;
}) {
  return (
    <div className="fanfold border-t-2 border-dashed border-[var(--c-ink)]/40">
      <div className="grid gap-10 px-[max(7%,2.4rem)] pb-[8vh] pt-[12vh] md:px-[max(7%,3.6rem)] lg:grid-cols-[auto_minmax(0,1fr)] lg:items-end lg:gap-[5vw]">
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
        className="dotmatrix grid grid-cols-2 gap-x-[1.1rem] px-[max(7%,2.4rem)] md:gap-x-[4vw] md:px-[max(7%,3.6rem)]"
      >
        {list.map((p, i) => (
          <li
            key={`${p.name}-${i}`}
            data-row={i}
            className="relative flex h-[2.7rem] items-center gap-1.5 border-b border-dotted border-[var(--c-ink)]/20 text-[0.68rem] uppercase text-[var(--c-ink)] md:h-[2.3rem] md:gap-3 md:text-[0.95rem]"
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
              className="relative hidden h-[0.7rem] w-[0.4rem] shrink-0 -translate-y-[0.1rem] rotate-45 border-b-2 border-r-2 border-[var(--c-blue)] md:block"
              style={{ opacity: "clamp(0, var(--counted, 0) - var(--i), 1)" }}
            />
            <span className="relative w-[1.4rem] shrink-0 text-[0.6rem] tabular-nums text-[var(--c-ink)]/60 md:w-[2.6rem] md:text-[0.95rem] md:text-[var(--c-ink)]/55">{pad(i + 1)}</span>
            {/* Names matter more than IDs: on a phone the name gets the row, and
                may take two lines; the ID is one search away. */}
            <span className="relative line-clamp-2 min-w-0 flex-1 font-semibold leading-[1.15] tracking-[0.01em] md:line-clamp-none md:truncate md:tracking-[0.02em]">{p.name}</span>
            <span className="relative hidden shrink-0 text-[0.8rem] tabular-nums text-[var(--c-ink)]/65 md:block">{p.id ?? roll.search.noId}</span>
          </li>
        ))}
      </ol>

      <div className="grid gap-6 px-[max(7%,2.4rem)] pb-[14vh] pt-[8vh] md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:px-[max(7%,3.6rem)]">
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
  const listEl = useRef<HTMLOListElement | null>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const small = useRef<HTMLSpanElement>(null);
  const cols = useRef(1);
  const lenis = useLenis();

  // One trigger over the list: its progress past the scanner line is the count.
  useGSAP(
    () => {
      const l = listEl.current;
      if (!l) return;
      if (reduced) {
        l.style.setProperty("--counted", String(list.length));
        return;
      }
      let shown = -1;
      const write = (progress: number) => {
        const c = cols.current;
        const rows = Math.ceil(list.length / c);
        const counted = Math.max(0, Math.min(list.length, Math.round(progress * rows) * c));
        if (counted === shown) return;
        shown = counted;
        l.style.setProperty("--counted", String(counted));
        if (counter.current) counter.current.textContent = pad(counted);
        if (small.current) small.current.textContent = pad(counted);
      };
      const st = ScrollTrigger.create({
        trigger: l,
        start: `top ${SCAN_AT * 100}%`,
        end: `bottom ${SCAN_AT * 100}%`,
        onRefresh: (self) => {
          cols.current = window.getComputedStyle(l).gridTemplateColumns.split(" ").length || 1;
          shown = -1;
          write(self.progress);
        },
        onUpdate: (self) => write(self.progress),
      });
      return () => st.kill();
    },
    { dependencies: [reduced] },
  );

  /** Scroll until the name is under the scanner, then mark it. */
  const pick = (i: number) => {
    setFound(i);
    const row = listEl.current?.querySelector<HTMLElement>(`[data-row="${i}"]`);
    if (!row) return;
    const r = row.getBoundingClientRect();
    const y = window.scrollY + r.top + r.height / 2 - window.innerHeight * (reduced ? 0.5 : SCAN_AT);
    if (lenis && !reduced) lenis.scrollTo(y, { duration: 1.6 });
    else window.scrollTo({ top: y });
  };

  return (
    <section id="roll" aria-labelledby="roll-title" className="relative">
      {/* The scanner and the count ride over the paper. They are pinned, and
          the paper is not: it is the page itself scrolling past, which the
          browser paints far more reliably than a tall sheet moved by hand. */}
      {!reduced ? (
        <div aria-hidden="true" className="pointer-events-none sticky top-0 z-10 h-[100dvh]">
          <p className="display absolute left-[var(--gutter)] top-1/2 hidden -translate-y-1/2 text-[clamp(7rem,13vw,13rem)] leading-[0.8] tabular-nums text-[var(--c-bone)] md:block">
            <span ref={counter}>000</span>
            <span className="meta mt-4 block text-[0.8rem] normal-case tracking-[0.04em] text-[var(--c-gray)]">{`/ ${roll.count} ${roll.counted}`}</span>
          </p>
          <div className="absolute inset-x-0" style={{ top: `${SCAN_AT * 100}%` }}>
            <div className="absolute left-[4vw] right-[4vw] top-0 h-[2.6rem] -translate-y-1/2 bg-[linear-gradient(transparent,color-mix(in_srgb,var(--c-blue)_12%,transparent)_45%,color-mix(in_srgb,var(--c-blue)_12%,transparent)_55%,transparent)] md:left-[30vw] md:right-[6vw]" />
          </div>
          <Light points={BEAM} kind="scan" />
          <p className="meta absolute bottom-[3vh] right-[var(--gutter)] bg-[var(--c-ink)] px-3 py-1.5 text-[0.85rem] text-[var(--c-bone)] md:hidden">
            <span ref={small}>000</span>
            {` / ${roll.count}`}
          </p>
        </div>
      ) : null}

      <div className={`relative mx-[4vw] pb-[12vh] md:ml-[30vw] md:mr-[6vw] ${reduced ? "" : "-mt-[100dvh]"}`}>
        <RollPaper
          found={found}
          onPick={pick}
          listRef={(n) => {
            listEl.current = n;
          }}
        />
      </div>
    </section>
  );
}
