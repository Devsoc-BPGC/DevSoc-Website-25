import { Reveal } from "@/components/motion/Reveal";
import { faq } from "@/content/faq";

/**
 * Faq
 * Questions and answers both on the page, hairline between them, rising as
 * you scroll. Nothing to open: if it is worth answering it is worth reading.
 */
export function Faq() {
  return (
    <section aria-labelledby="faq-title" className="gutter grid-12 py-[10vh]">
      <Reveal className="col-span-12 lg:col-span-4">
        <h2 id="faq-title" className="display text-[clamp(2rem,4vw,4rem)] text-primary">
          Questions
        </h2>
      </Reveal>
      <Reveal as="dl" stagger={0.05} className="col-span-12 mt-10 lg:col-span-7 lg:col-start-6 lg:mt-2">
        {faq.map((f) => (
          <div key={f.q} className="border-t border-rule/25 py-6 last:border-b">
            <dt className="text-[1.05rem] text-primary">{f.q}</dt>
            <dd className="body-copy mt-2 text-[1rem]">{f.a}</dd>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
