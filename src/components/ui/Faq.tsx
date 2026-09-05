import { faq } from "@/content/faq";

/**
 * Faq
 * Native disclosures in a hairline list. No JavaScript, no cards.
 */
export function Faq() {
  return (
    <section aria-labelledby="faq-title" className="gutter grid-12 py-[10vh]">
      <h2 id="faq-title" className="display col-span-12 text-[clamp(2rem,4vw,4rem)] text-bone lg:col-span-4">
        Questions
      </h2>
      <div className="col-span-12 mt-8 lg:col-span-7 lg:col-start-6 lg:mt-0">
        {faq.map((f) => (
          <details key={f.q} className="group border-t border-brass/25 last:border-b">
            <summary
              className="flex cursor-pointer list-none items-baseline justify-between gap-8 py-5 text-[1.05rem] text-bone marker:content-none [&::-webkit-details-marker]:hidden"
              data-cursor="Open"
            >
              <span>{f.q}</span>
              <span className="mono text-ash transition-transform duration-500 group-open:rotate-45" aria-hidden="true">
                +
              </span>
            </summary>
            <p className="body-copy pb-6 text-[1rem]">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
