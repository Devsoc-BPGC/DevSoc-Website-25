import { ScrollExpand } from "@/components/motion/ScrollExpand";
import { SplitLines } from "@/components/motion/SplitLines";
import { site } from "@/content/site";

/**
 * Manifesto: what this is
 * Three declarative statements placed on the twelve-column grid, then the
 * atelier photograph growing from a framed window to full bleed.
 */

const statements = [
  {
    text: "We build the software the campus runs on.",
    note: "Web, app, game, AI and ML, UI and UX, engine",
    cols: "lg:col-span-8",
  },
  {
    text: "Fest websites, fest apps, and the tools students open every day.",
    note: "Waves, Quark, Class Sync",
    cols: "lg:col-span-8 lg:col-start-5",
  },
  {
    text: "Inductions once a year. Seniors teach, then hand over.",
    note: "Crew first, then core",
    cols: "lg:col-span-7 lg:col-start-2",
  },
];

export function Manifesto() {
  const since = site.foundedYear ? ` since ${site.foundedYear}` : "";
  return (
    <section aria-label="What DevSoc is" className="relative">
      <div className="gutter grid-12 gap-y-[14vh] py-[18vh]">
        {statements.map((s) => (
          <div key={s.text} className={`col-span-12 ${s.cols}`}>
            <div className="mb-6 h-px w-full bg-brass/40" />
            <SplitLines
              as="p"
              className="display text-[clamp(1.9rem,3.8vw,4rem)] normal-case text-bone [font-variation-settings:'wdth'_100]"
            >
              {s.text}
            </SplitLines>
            <p className="mono mt-5 text-ash">{s.note}</p>
          </div>
        ))}
      </div>

      <ScrollExpand
        media={
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/images/atelier/workbench-wide.jpg"
            alt="The atelier at night: instruments under glass along two workbenches, one lamp"
          />
        }
        expanded={
          <div className="gutter flex h-full flex-col justify-end pb-[10vh]">
            <p className="voice max-w-[24ch] text-[clamp(1.75rem,3.2vw,3.25rem)] text-bone">
              Shipping from the Goa campus{since}.
            </p>
            <p className="mono mt-5 text-ash">Fest websites and apps. DevFest. Workshops. Whatever a member brings in.</p>
          </div>
        }
      >
        <p className="display text-[clamp(2.4rem,7vw,7rem)] text-bone/90">The atelier</p>
      </ScrollExpand>
    </section>
  );
}
