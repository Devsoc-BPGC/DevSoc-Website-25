import { ParticleText } from "@/components/motion/ParticleText";
import { Reveal } from "@/components/motion/Reveal";
import { site } from "@/content/site";

/**
 * Colophon
 * The wordmark as a field of dots that parts around the pointer, then the
 * plain facts in mono.
 */
export function Colophon() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative gutter pb-10 pt-[10vh]" aria-label="Colophon">
      <ParticleText text="DEVSOC" className="display h-[24vw] w-full" density={5} size={2} />
      <Reveal
        stagger={0.06}
        y={16}
        className="mono mt-10 grid grid-cols-2 gap-y-6 border-t border-brass/25 pt-8 text-ash md:grid-cols-4"
      >
        <ul className="flex flex-col gap-2">
          {site.socials.map((s) => (
            <li key={s.href}>
              <a href={s.href} target="_blank" rel="noreferrer" className="text-link hover:text-bone" data-cursor="Open">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2">
          <a href={`mailto:${site.email}`} className="text-link self-start hover:text-bone" data-cursor="Write">
            {site.email}
          </a>
          <span>{site.campus}</span>
        </div>
        <div className="flex flex-col gap-2 md:col-start-4 md:text-right">
          <span>Developers&rsquo; Society, {year}</span>
          <span>Built by the web room</span>
        </div>
      </Reveal>
    </footer>
  );
}
