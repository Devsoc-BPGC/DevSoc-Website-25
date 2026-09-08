"use client";

/**
 * Dawn
 * The night ends and the door is open. The last chapter is the way in: the
 * list if it is out, and the questions people actually ask.
 */

import { useMemo, useState } from "react";
import Image from "next/image";
import { Magnetic } from "@/components/motion/Magnetic";
import { SplitLines } from "@/components/motion/SplitLines";
import { Reveal } from "@/components/motion/Reveal";
import { WaveDivider } from "@/components/motion/WaveDivider";
import { TextLink } from "@/components/ui/TextLink";
import { faq } from "@/content/faq";
import { site } from "@/content/site";
import inductees from "@/content/inductees.json";

type Inductee = { name: string; id: string | null };

export function Dawn() {
  const [q, setQ] = useState("");
  const list = inductees as Inductee[];
  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return list.filter((p) => p.name.toLowerCase().includes(t) || (p.id ?? "").toLowerCase().includes(t)).slice(0, 8);
  }, [q, list]);

  return (
    <section id="dawn" aria-labelledby="dawn-title" className="relative">
      <div className="relative min-h-[100dvh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/dawn/door-wide.jpg"
            alt="The same building at dawn, one door open with light falling out of it onto the path"
            fill
            sizes="100vw"
            className="hidden object-cover md:block"
          />
          <Image src="/images/dawn/door-tall.jpg" alt="" fill sizes="100vw" className="object-cover md:hidden" />
        </div>
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, var(--scrim) 4%, transparent 34%, var(--scrim) 88%)" }}
          aria-hidden="true"
        />

        <div className="relative flex min-h-[100dvh] flex-col justify-end gutter pb-[12vh] pt-[26vh]">
          <div className="grid-12 items-end gap-y-10">
            <div className="col-span-12 lg:col-span-6">
              {site.inducteesLive ? (
                <SplitLines as="h2" id="dawn-title" className="voice text-[clamp(2rem,4.2vw,4.25rem)] text-primary">
                  {`The ${site.inducteesYear} list is out.`}
                </SplitLines>
              ) : (
                <SplitLines as="h2" id="dawn-title" className="voice text-[clamp(2rem,4.2vw,4.25rem)] text-primary">
                  Inductions open once a year. Until then, come to DevFest.
                </SplitLines>
              )}
            </div>

            <div className="col-span-12 lg:col-span-4 lg:col-start-8">
              {site.inducteesLive ? (
                <>
                  <p className="body-copy">
                    {list.length} names. Find yours, or come to DevFest and meet the rest of the room.
                  </p>
                  <label className="mt-8 block">
                    <span className="meta text-muted">Search by name or BITS ID</span>
                    <input
                      type="search"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Type a name"
                      className="meta mt-3 w-full border-b border-rule/50 bg-transparent py-3 text-[1rem] text-primary placeholder:text-muted/70 focus:border-rule focus:outline-none"
                      autoComplete="off"
                    />
                  </label>
                  {q.trim() ? (
                    <ul className="mt-6 divide-y divide-raised">
                      {matches.length ? (
                        matches.map((m) => (
                          <li key={`${m.name}-${m.id}`} className="meta flex justify-between gap-6 py-3 text-primary">
                            <span>{m.name}</span>
                            <span className="text-muted">{m.id ?? "ID not given"}</span>
                          </li>
                        ))
                      ) : (
                        <li className="meta py-3 text-muted">Nothing matches that spelling.</li>
                      )}
                    </ul>
                  ) : null}
                  <div className="mt-8">
                    <TextLink href="/inductees" cursor="Go">
                      See all {list.length} names
                    </TextLink>
                  </div>
                </>
              ) : (
                <>
                  <p className="body-copy">
                    Walk in for the interview when it opens. Missed it? Write to us; exceptional cases happen.
                  </p>
                  <div className="mt-8">
                    <Magnetic>
                      <a href={`mailto:${site.email}`} className="text-link meta text-primary" data-cursor="Write">
                        {site.email}
                      </a>
                    </Magnetic>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="gutter grid-12 py-[10vh]">
        <Reveal className="col-span-12 lg:col-span-4">
          <h3 id="faq-title" className="display text-[clamp(2rem,4vw,4rem)] text-primary">
            Questions
          </h3>
        </Reveal>
        <Reveal as="dl" stagger={0.05} className="col-span-12 mt-10 lg:col-span-7 lg:col-start-6 lg:mt-2">
          {faq.map((f) => (
            <div key={f.q} className="border-t border-rule/25 py-6 last:border-b">
              <dt className="text-[1.05rem] text-primary">{f.q}</dt>
              <dd className="body-copy mt-2 text-[1rem]">{f.a}</dd>
            </div>
          ))}
        </Reveal>
        <Reveal className="col-span-12 mt-14 lg:col-span-7 lg:col-start-6">
          <Magnetic>
            <a href={`mailto:${site.email}`} className="text-link meta text-primary" data-cursor="Write">
              {site.email}
            </a>
          </Magnetic>
        </Reveal>
      </div>

      <WaveDivider fill="var(--surface-raised)" flip />
    </section>
  );
}
