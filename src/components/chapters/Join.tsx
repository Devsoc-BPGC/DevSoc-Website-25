"use client";

/**
 * The Door: join, and the inductees moment
 * While the list is live: the key, a line, and a search that filters the
 * inductees inline. Otherwise: one line and the email as the single call.
 */

import { useMemo, useState } from "react";
import Image from "next/image";
import { Magnetic } from "@/components/motion/Magnetic";
import { SplitLines } from "@/components/motion/SplitLines";
import { Reveal } from "@/components/motion/Reveal";
import { TextLink } from "@/components/ui/TextLink";
import { site } from "@/content/site";
import inductees from "@/content/inductees.json";

type Inductee = { name: string; id: string | null };

export function Join() {
  const [q, setQ] = useState("");
  const list = inductees as Inductee[];
  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return list.filter((p) => p.name.toLowerCase().includes(t) || (p.id ?? "").toLowerCase().includes(t)).slice(0, 8);
  }, [q, list]);

  return (
    <section id="door" aria-labelledby="door-title" className="relative py-[22vh]">
      <div className="gutter grid-12 items-center gap-y-12">
        <Reveal className="col-span-12 md:col-span-5 lg:col-span-4">
          <div className="relative aspect-[4/5] w-full max-w-[420px] overflow-hidden">
            <Image
              src="/images/join/key.jpg"
              alt="A brass key with a smoked-glass bow, glowing faintly teal"
              fill
              sizes="(min-width: 768px) 40vw, 90vw"
              className="object-cover"
            />
          </div>
        </Reveal>

        <div className="col-span-12 md:col-span-7 lg:col-span-6 lg:col-start-6">
          {site.inducteesLive ? (
            <>
              <SplitLines as="h2" id="door-title" className="voice text-[clamp(2rem,4.2vw,4.25rem)] text-primary">
                {`The ${site.inducteesYear} list is out.`}
              </SplitLines>
              <p className="body-copy mt-6">
                {list.length} names. Find yours, or come to DevFest and meet the rest of the room.
              </p>
              <label className="mt-10 block">
                <span className="mono text-muted">Search by name or BITS ID</span>
                <input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Type a name"
                  className="mono mt-3 w-full border-b border-rule/50 bg-transparent py-3 text-[1rem] text-primary placeholder:text-muted/70 focus:border-rule focus:outline-none"
                  autoComplete="off"
                />
              </label>
              {q.trim() ? (
                <ul className="mt-6 divide-y divide-raised">
                  {matches.length ? (
                    matches.map((m) => (
                      <li key={`${m.name}-${m.id}`} className="mono flex justify-between gap-6 py-3 text-primary">
                        <span>{m.name}</span>
                        <span className="text-muted">{m.id ?? "ID not given"}</span>
                      </li>
                    ))
                  ) : (
                    <li className="mono py-3 text-muted">Nothing matches that spelling.</li>
                  )}
                </ul>
              ) : null}
              <div className="mt-10">
                <TextLink href="/inductees" cursor="Go">
                  See all {list.length} names
                </TextLink>
              </div>
            </>
          ) : (
            <>
              <SplitLines as="h2" id="door-title" className="voice text-[clamp(2rem,4.2vw,4.25rem)] text-primary">
                Inductions open once a year. Until then, come to DevFest.
              </SplitLines>
              <p className="body-copy mt-6">Walk in for the interview when it opens. Missed it? Write to us; exceptional cases happen.</p>
              <div className="mt-10">
                <Magnetic>
                  <a href={`mailto:${site.email}`} className="text-link mono text-primary" data-cursor="Write">
                    {site.email}
                  </a>
                </Magnetic>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
