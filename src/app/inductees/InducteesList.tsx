"use client";

import { useMemo, useState } from "react";
import inductees from "@/content/inductees.json";

type Inductee = { name: string; id: string | null };

export function InducteesList() {
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const list = inductees as Inductee[];

  const groups = useMemo(() => {
    const t = q.trim().toLowerCase();
    const shown = t
      ? list.filter((p) => p.name.toLowerCase().includes(t) || (p.id ?? "").toLowerCase().includes(t))
      : list;
    const map = new Map<string, Inductee[]>();
    for (const p of shown) {
      const k = p.name.charAt(0).toUpperCase();
      map.set(k, [...(map.get(k) ?? []), p]);
    }
    return Array.from(map.entries());
  }, [q, list]);

  const copy = (id: string) => {
    navigator.clipboard?.writeText(id).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1400);
    });
  };

  return (
    <div className="gutter mt-12">
      <label className="block max-w-xl">
        <span className="mono text-muted">Search by name or BITS ID</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Type a name"
          autoComplete="off"
          className="mono mt-3 w-full border-b border-rule/50 bg-transparent py-3 text-[1rem] text-primary placeholder:text-muted/70 focus:border-rule focus:outline-none"
        />
      </label>
      <p className="mono mt-4 text-muted" aria-live="polite">
        {groups.reduce((n, [, g]) => n + g.length, 0)} of {list.length}
      </p>

      {groups.length === 0 ? (
        <p className="body-copy mt-16">Nothing matches that spelling.</p>
      ) : (
        <div className="mt-16 flex flex-col gap-16">
          {groups.map(([letter, people]) => (
            <section key={letter} className="grid-12 items-start">
              <h2 className="display col-span-12 text-[clamp(3rem,8vw,8rem)] leading-none text-primary/90 lg:col-span-2">
                {letter}
              </h2>
              <ol className="col-span-12 mt-6 lg:col-span-9 lg:col-start-4 lg:mt-3">
                {people.map((p) => (
                  <li key={`${p.name}-${p.id}`} className="border-t border-raised last:border-b">
                    <button
                      type="button"
                      onClick={() => p.id && copy(p.id)}
                      disabled={!p.id}
                      className="flex w-full flex-wrap items-baseline justify-between gap-x-8 gap-y-1 py-4 text-left disabled:cursor-default"
                      data-cursor={p.id ? "Copy" : undefined}
                    >
                      <span className="text-[1.05rem] text-primary">{p.name}</span>
                      <span className="mono text-muted">
                        {copied === p.id ? "Copied" : (p.id ?? "ID not given")}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
