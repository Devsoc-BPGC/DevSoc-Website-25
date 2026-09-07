"use client";

/**
 * The Society
 * A breath between two loud chapters, and the only place that says plainly
 * what this is. One statement, one paragraph that names the six rooms in
 * passing, and the facts as a plain list of rows.
 *
 * Left aligned on the grid like everything else. The earlier centred version
 * floated in the middle of the page with nothing holding it, and the line it
 * ended on was a pun about Goa being a port, which said nothing true about
 * the society. No artwork here on purpose: the quiet is the point.
 */

import { Ambient } from "@/components/motion/Ambient";
import { Reveal } from "@/components/motion/Reveal";
import { SplitLines } from "@/components/motion/SplitLines";
import { WaveDivider } from "@/components/motion/WaveDivider";
import { chapters } from "@/content/chapters";
import { site } from "@/content/site";

const facts = [
  { label: "Rooms", value: "Six" },
  { label: `Inducted in ${site.inducteesYear}`, value: "186" },
  { label: "Inductions", value: "Once a year" },
  { label: "Campus", value: site.campusShort },
];

export function Society() {
  const light = chapters[1].light;

  return (
    <section id="society" className="relative overflow-hidden pb-[24vh] pt-[22vh]" aria-labelledby="society-line">
      <Ambient x={light.x} y={light.y} intensity={0.3} />

      <div className="relative gutter">
        <h2 className="meta mb-10 text-muted">The Society</h2>

        <div className="grid-12 items-end gap-y-14">
          <div className="col-span-12 lg:col-span-7">
            <SplitLines
              as="p"
              id="society-line"
              className="voice max-w-[17ch] text-[clamp(2rem,4.4vw,4.4rem)] leading-[1.06] text-primary"
            >
              Every fest the campus turns up to runs on something built the night before.
            </SplitLines>

            <p className="body-copy mt-10 max-w-[52ch]">
              Six rooms, one society: web, app, game, AI and ML, UI and UX, and engine development. We build the fest
              sites the whole campus registers on, the apps that open on every phone during Waves and Quark, and the
              small tools that fix a Tuesday. Nobody here is paid and nothing here is a mock-up.
            </p>
          </div>

          <Reveal
            as="dl"
            stagger={0.07}
            y={18}
            className="col-span-12 sm:col-span-8 lg:col-span-4 lg:col-start-8"
          >
            {facts.map((f) => (
              <div key={f.label} className="flex items-baseline justify-between gap-6 border-t border-rule/25 py-4 last:border-b">
                <dt className="meta text-muted">{f.label}</dt>
                <dd className="meta text-right text-primary">{f.value}</dd>
              </div>
            ))}
          </Reveal>
        </div>
      </div>

      <WaveDivider fill="var(--surface-raised)" flip />
    </section>
  );
}
