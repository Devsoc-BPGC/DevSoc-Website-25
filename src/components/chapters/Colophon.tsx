"use client";

/**
 * Colophon
 * The base of the page, and the last minute of the night.
 *
 * A footer has to feel like ground, not like one more section. This one gets
 * its own raised surface, a closing line big enough to be the reason you
 * scrolled this far, the links in real columns, and the wordmark set at full
 * page width and cropped by the bottom edge, so the page ends on the name
 * rather than trailing off. Under the wordmark the ground warms: the night is
 * over and the first light is coming up behind the letters.
 *
 * The one moving thing is a Perlin flow field drifting behind the type. It
 * is masked away at the top and bottom so it never crowds the links or the
 * wordmark, and it is the only animation in the footer.
 */

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP } from "@/lib/gsap";
import { useLenis } from "lenis/react";
import { useReducedMotion } from "@/lib/useMedia";
import { FlowField } from "@/components/motion/FlowField";
import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal } from "@/components/motion/Reveal";
import { FitText } from "@/components/ui/FitText";
import { routes, site } from "@/content/site";

export function Colophon() {
  const root = useRef<HTMLElement>(null);
  const mark = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const reduced = useReducedMotion();
  const year = new Date().getFullYear();

  // The wordmark rises the last of the way as the footer arrives.
  useGSAP(
    () => {
      if (reduced || !mark.current) return;
      gsap.fromTo(
        mark.current,
        { yPercent: 22 },
        {
          yPercent: 0,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: 1.2 },
        },
      );
    },
    { scope: root, dependencies: [reduced] },
  );

  const toTop = () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.8 });
    else window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <footer
      ref={root}
      aria-label="Colophon"
      className="relative overflow-hidden bg-raised"
      style={{ ["--footer-lift" as string]: "color-mix(in oklch, var(--accent-warm) 14%, transparent)" }}
    >
      {/* Air still moving over the page after the reader has stopped. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 2%, black 26%, black 68%, transparent 88%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 2%, black 26%, black 68%, transparent 88%)",
        }}
        aria-hidden="true"
      >
        <FlowField className="h-full w-full" />
      </div>

      {/* First light, low and wide behind the wordmark. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[46vh]"
        style={{ background: "radial-gradient(120% 100% at 50% 118%, var(--footer-lift), transparent 62%)" }}
        aria-hidden="true"
      />

      <div className="relative gutter pt-[16vh]">
        <div className="grid-12 items-start gap-y-14">
          <Reveal className="col-span-12 lg:col-span-6">
            <p className="voice text-[clamp(1.9rem,3.6vw,3.6rem)] leading-[1.08] text-primary">
              The night shift is always short one person.
            </p>
            <p className="body-copy mt-6 max-w-[42ch]">
              Inductions open once a year and the interview is a conversation, not a test. Any discipline, any year. If
              you missed the window, write to us anyway.
            </p>
            <div className="mt-9">
              <Magnetic>
                <a
                  href={`mailto:${site.email}`}
                  className="text-link font-display text-[clamp(1.1rem,2.1vw,2rem)] font-black uppercase tracking-[-0.01em] text-primary"
                  data-cursor="Write"
                >
                  {site.email}
                </a>
              </Magnetic>
            </div>
          </Reveal>

          <Reveal
            stagger={0.07}
            y={18}
            className="col-span-12 grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:col-span-5 lg:col-start-8"
          >
            <nav aria-label="Pages">
              <h2 className="meta mb-5 text-muted/70">Pages</h2>
              <ul className="flex flex-col gap-3">
                {routes.map((r) => (
                  <li key={r.href}>
                    <Link
                      href={r.href}
                      className="meta text-link text-primary/80 hover:text-primary"
                      data-cursor="Go"
                    >
                      {r.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Elsewhere">
              <h2 className="meta mb-5 text-muted/70">Elsewhere</h2>
              <ul className="flex flex-col gap-3">
                {site.socials.map((s) => (
                  <li key={s.href}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="meta text-link text-primary/80 hover:text-primary"
                      data-cursor="Open"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="col-span-2 sm:col-span-1">
              <h2 className="meta mb-5 text-muted/70">Where</h2>
              <address className="meta not-italic leading-[1.9] text-muted">
                Developers&rsquo; Society
                <br />
                BITS Pilani, Goa
                <br />
                Zuarinagar 403726
              </address>
            </div>
          </Reveal>
        </div>

        <div className="meta mt-[14vh] flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-rule/25 pt-6 text-muted">
          <span>
            Developers&rsquo; Society, {year}. Built by the web room.
          </span>
          <button type="button" onClick={toTop} className="text-link text-primary/80 hover:text-primary" data-cursor="Up">
            Back to the top
          </button>
        </div>
      </div>

      {/* The name, full width, cropped by the bottom of the page. Dawn comes
          up through the letters: bone at the top, warm where they are cut. */}
      <div
        ref={mark}
        className="relative mt-8 will-change-transform"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, var(--text-primary) 38%, color-mix(in oklch, var(--accent-warm) 78%, var(--text-primary)) 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        <FitText className="display" innerClassName="leading-[0.78] block">
          Devsoc
        </FitText>
      </div>
    </footer>
  );
}
