"use client";

/**
 * The Society, 20:15
 * A breath between two loud chapters. One oversized paragraph, the port line
 * as a statement, three real numbers. No artwork: the quiet is the point.
 */

import { Ambient } from "@/components/motion/Ambient";
import { Reveal } from "@/components/motion/Reveal";
import { SplitLines } from "@/components/motion/SplitLines";
import { WaveDivider } from "@/components/motion/WaveDivider";
import { chapters } from "@/content/chapters";
import { site } from "@/content/site";

const facts = [
  { value: "Six", label: "rooms" },
  { value: "186", label: `inducted in ${site.inducteesYear}` },
  { value: "Once a year", label: "inductions open" },
];

export function Society() {
  const light = chapters[1].light;

  return (
    <section id="society" className="relative overflow-hidden pb-[22vh] pt-[24vh]" aria-labelledby="society-line">
      <Ambient x={light.x} y={light.y} intensity={0.3} />

      <div className="relative gutter">
        <SplitLines
          as="p"
          id="society-line"
          className="mx-auto max-w-[26ch] text-center text-[clamp(1.5rem,2.6vw,2.1rem)] leading-[1.35] text-primary"
        >
          We build the software the campus runs on. Fest websites, fest apps, and the tools students open every day.
        </SplitLines>

        <Reveal className="mt-20">
          <p className="voice mx-auto max-w-[20ch] text-center text-[clamp(1.9rem,3.6vw,3.4rem)] text-primary">
            {site.portLine}
          </p>
        </Reveal>

        <Reveal stagger={0.08} className="mono mt-24 flex flex-wrap items-baseline justify-center gap-x-16 gap-y-6 text-muted">
          {facts.map((f) => (
            <span key={f.label}>
              <span className="text-primary">{f.value}</span> {f.label}
            </span>
          ))}
        </Reveal>
      </div>

      <WaveDivider fill="var(--surface-raised)" flip />
    </section>
  );
}
