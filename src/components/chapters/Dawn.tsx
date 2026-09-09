"use client";

/**
 * Dawn
 * The night ends and the door is open. The last chapter is the way in: the
 * list if it is out, and the questions people actually ask.
 */

import { useMemo, useRef, useState } from "react";
import { Magnetic } from "@/components/motion/Magnetic";
import { RevealWords } from "@/components/motion/text";
import { Reveal } from "@/components/motion/Reveal";
import { DoorLight } from "@/components/chapters/DoorLight";
import { useInkOver } from "@/lib/useInk";
import { TextLink } from "@/components/ui/TextLink";
import { QuestionDoors } from "@/components/ui/QuestionDoors";
import { faq } from "@/content/faq";
import { site } from "@/content/site";
import inductees from "@/content/inductees.json";

type Inductee = { name: string; id: string | null };

export function Dawn() {
  const [q, setQ] = useState("");
  /** The questions stand on the dawn light, so the chrome has to invert over them. */
  const litRef = useRef<HTMLDivElement>(null);
  useInkOver(litRef);
  const list = inductees as Inductee[];
  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return list.filter((p) => p.name.toLowerCase().includes(t) || (p.id ?? "").toLowerCase().includes(t)).slice(0, 8);
  }, [q, list]);

  return (
    <section id="dawn" aria-labelledby="dawn-title" className="relative">
      {/* One door. The plate, the chapter written on it, and the walk into it are
          the same shot, so they are the same component. */}
      <DoorLight>
        <div className="gutter w-full pb-[14vh]">
          <div className="grid-12 items-end gap-y-10">
            <div className="col-span-12 lg:col-span-6">
              {site.inducteesLive ? (
                <RevealWords as="h2" id="dawn-title" className="voice text-[clamp(2rem,4.2vw,4.25rem)] text-primary">
                  {`The ${site.inducteesYear} list is out.`}
                </RevealWords>
              ) : (
                <RevealWords as="h2" id="dawn-title" className="voice text-[clamp(2rem,4.2vw,4.25rem)] text-primary">
                  Inductions open once a year. Until then, come to DevFest.
                </RevealWords>
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
      </DoorLight>

      <div ref={litRef} className="lit gutter grid-12 py-[16vh]">
        {/* The heading stays with you while you work down the corridor. */}
        <div className="col-span-12 lg:col-span-4">
          <div className="lg:sticky lg:top-[22vh]">
            <Reveal>
              <h3 id="faq-title" className="display text-[clamp(2rem,4vw,4rem)] leading-[0.95] text-primary">
                Questions
              </h3>
              <p className="body-copy mt-6 max-w-[34ch]">
                Everything people actually ask, and the answers we give them in person.
              </p>
            </Reveal>
            <Reveal className="mt-10">
              <Magnetic>
                <a href={`mailto:${site.email}`} className="text-link meta text-primary" data-cursor="Write">
                  {site.email}
                </a>
              </Magnetic>
            </Reveal>
          </div>
        </div>

        <Reveal className="col-span-12 mt-12 lg:col-span-7 lg:col-start-6 lg:mt-2">
          <QuestionDoors items={faq} />
        </Reveal>
      </div>


    </section>
  );
}
