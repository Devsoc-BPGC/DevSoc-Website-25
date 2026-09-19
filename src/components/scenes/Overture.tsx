"use client";

/**
 * Overture
 * The page opening, while the building loads. Once per visit.
 *
 * Dark, and one fixture hung across the middle of the frame from a ceiling
 * rail: the same steel channel on two wires as the tubes over the build desk
 * and the posters. The tube warms from the middle outwards as the fonts and
 * the building come in, and the readout under it says how far. The name is
 * already there, below the tube, in the dark; the light coming up is what
 * shows it. When everything is in, the starter catches (the one stutter, and
 * the name stutters with it), the tube burns full, and the dark splits along
 * it: the upper half goes up with the fixture, the lower half goes down with
 * the name, and behind it is the building with the same name on its roof and
 * its windows coming on.
 *
 * Everything on the page that animates by itself waits for it: a style rule
 * pauses every other CSS animation while it is up, and the hero's tube waits
 * for its `overture:open` event before it strikes.
 *
 * Seen once per visit (session storage), and never for reduced motion. A
 * returning load hides it before it is ever painted, from a line of script in
 * the page itself. If scripts never run it fades itself out, so it can never
 * leave the page covered.
 */

import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { gsap } from "@/lib/gsap";
import { colophon, hero } from "@/content/home";
import { OVERTURE_KEY } from "./overtureEarly";

const KEY = OVERTURE_KEY;
/** The longest it will wait for anything, in seconds. */
const MAX_WAIT = 7;
/** The shortest it stays up, so the warm-up reads as a warm-up. */
const MIN_SHOW = 1.4;

function whenLoaded(img: HTMLImageElement) {
  return img.complete
    ? Promise.resolve()
    : new Promise<void>((r) => {
        img.addEventListener("load", () => r(), { once: true });
        img.addEventListener("error", () => r(), { once: true });
      });
}

const pad = (n: number) => String(Math.round(n)).padStart(3, "0");

export function Overture() {
  const [gone, setGone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const core = useRef<HTMLDivElement>(null);
  const spill = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLParagraphElement>(null);
  const meter = useRef<HTMLSpanElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    if (gone) return;
    const el = root.current;
    if (!el) return;
    const html = document.documentElement;

    const open = () => {
      el.dataset.open = "";
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {}
      window.dispatchEvent(new Event("overture:open"));
    };
    const finish = () => {
      html.style.overflow = "";
      lenis?.start();
      setGone(true);
    };

    if (html.classList.contains("overture-seen")) {
      open();
      finish();
      return;
    }
    // Scripts are running: the self-dismissing fallback is not needed.
    el.style.animation = "none";
    html.style.overflow = "hidden";
    lenis?.stop();

    // What the first frame needs: the fonts and the building.
    const jobs: Promise<unknown>[] = [document.fonts?.ready ?? Promise.resolve()];
    document.querySelectorAll<HTMLImageElement>("#dusk img").forEach((img) => {
      if (img.offsetParent !== null) jobs.push(whenLoaded(img));
    });
    const total = jobs.length;
    let done = 0;

    // Two numbers drive everything: how warm the tube is, and the starter's flicker.
    const warmth = { v: 0 };
    const flick = { v: 1 };
    const paint = () => {
      const w = warmth.v;
      const f = flick.v;
      core.current?.style.setProperty("transform", `scaleX(${w.toFixed(4)})`);
      core.current?.style.setProperty("opacity", f.toFixed(3));
      spill.current?.style.setProperty("opacity", (w * 0.55 * f).toFixed(3));
      word.current?.style.setProperty("opacity", ((0.05 + w * 0.6) * f).toFixed(3));
      if (meter.current) meter.current.textContent = pad(w * 100);
    };
    const warm = (to: number) => gsap.to(warmth, { v: to, duration: 0.8, ease: "power2.out", overwrite: true, onUpdate: paint });
    warm(0.06);
    jobs.forEach((j) => j.then(() => warm(0.06 + (++done / total) * 0.84)));

    let killed = false;
    const started = performance.now();
    const all = Promise.race([Promise.all(jobs), new Promise((r) => setTimeout(r, MAX_WAIT * 1000))]);
    const tl = gsap.timeline({ paused: true });
    all.then(() => {
      if (killed) return;
      const wait = Math.max(0, MIN_SHOW - (performance.now() - started) / 1000);
      tl.delay(wait);
      tl.to(warmth, { v: 1, duration: 0.55, ease: "power2.inOut", onUpdate: paint })
        // The starter catches: the one stutter, then full.
        .to(flick, { v: 0.2, duration: 0.05, ease: "none", onUpdate: paint }, "+=0.15")
        .to(flick, { v: 1, duration: 0.05, ease: "none", onUpdate: paint }, "+=0.08")
        .to(flick, { v: 0.35, duration: 0.04, ease: "none", onUpdate: paint }, "+=0.1")
        .to(flick, { v: 1, duration: 0.14, ease: "none", onUpdate: paint }, "+=0.06")
        .add(open, "+=0.35")
        // The dark splits along the light.
        .to(top.current, { yPercent: -100, duration: 1.4, ease: "power3.inOut" }, "<")
        .to(bottom.current, { yPercent: 100, duration: 1.4, ease: "power3.inOut" }, "<")
        .add(finish);
      tl.play();
    });

    return () => {
      killed = true;
      tl.kill();
      gsap.killTweensOf([warmth, flick]);
      html.style.overflow = "";
    };
  }, [gone, lenis]);

  if (gone) return null;

  return (
    <>
      <div ref={root} className="overture fixed inset-0" style={{ zIndex: 100 }} aria-hidden="true">
        {/* The upper half, carrying the fixture on its lower edge. */}
        <div ref={top} className="absolute inset-x-0 top-0 h-1/2 bg-[var(--c-ink)]">
          {/* The ceiling rail the wires hang from. */}
          <span className="absolute inset-x-0 top-0 block h-[3px] bg-[#1d1f21] shadow-[0_1px_0_color-mix(in_srgb,var(--c-steel)_35%,transparent)]" />
          <div className="absolute bottom-0 left-1/2 w-[min(46vw,560px)] -translate-x-1/2 max-md:w-[72vw]">
            {/* Two wires up to the rail, each with its fixing. */}
            {["left-[18%]", "right-[18%]"].map((pos) => (
              <span key={pos} className={`absolute bottom-[14px] ${pos} block h-[50vh] w-px bg-[#3a3c3a]`}>
                <span className="absolute -left-[3px] top-0 block h-[5px] w-[7px] bg-[#2a2c2e]" />
              </span>
            ))}
            {/* The steel channel. */}
            <span
              className="absolute -inset-x-3 bottom-[4px] block h-[11px] bg-[#1d1f21]"
              style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--c-steel) 60%, transparent)", clipPath: "polygon(0 0, 100% 0, 99% 100%, 1% 100%)" }}
            />
            {/* The tube: dark glass, and the lit core warming out from the middle. */}
            <span className="absolute inset-x-0 -bottom-[2px] block h-[5px] bg-[#34363a]" />
            <div
              ref={core}
              className="absolute inset-x-0 -bottom-[2px] h-[5px] origin-center bg-[var(--light-core)]"
              style={{
                transform: "scaleX(0)",
                boxShadow:
                  "0 0 10px color-mix(in srgb, var(--light-halo) 90%, transparent), 0 0 34px color-mix(in srgb, var(--light-halo) 60%, transparent), 0 0 90px color-mix(in srgb, var(--light-halo) 30%, transparent)",
              }}
            />
            <span className="absolute -bottom-[5px] -left-[6px] block h-[11px] w-[7px] bg-[var(--c-steel)]" />
            <span className="absolute -bottom-[5px] -right-[6px] block h-[11px] w-[7px] bg-[var(--c-steel)]" />
          </div>
        </div>

        {/* The lower half, lit from above: the name in the dark, and the readout. */}
        <div ref={bottom} className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden bg-[var(--c-ink)]">
          <div
            ref={spill}
            className="absolute left-1/2 top-0 h-[80%] w-[min(96vw,1300px)] -translate-x-1/2"
            style={{ opacity: 0, background: "radial-gradient(50% 100% at 50% 0%, color-mix(in srgb, var(--c-bone) 14%, transparent), transparent 100%)" }}
          />
          {/* Lit from above: brightest where it is nearest the tube. */}
          <p
            ref={word}
            className="display absolute inset-x-0 top-[5vh] text-center text-[min(21vw,24vh)] leading-[0.8] text-[var(--c-bone)]"
            style={{
              opacity: 0.05,
              maskImage: "linear-gradient(to bottom, #000 0%, rgb(0 0 0 / 0.35) 70%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, #000 0%, rgb(0 0 0 / 0.35) 70%, transparent 100%)",
            }}
          >
            {hero.wordmark}
          </p>
          <div className="absolute inset-x-[var(--gutter)] bottom-[5vh] flex items-end justify-between gap-6">
            <p className="meta text-[0.78rem] text-[var(--c-gray)]">{colophon.where.slice(0, 2).join(", ")}</p>
            <p className="meta text-[0.78rem] tabular-nums text-[var(--c-gray)]">
              <span ref={meter} className="text-[var(--c-bone)]">
                000
              </span>
              {" / 100"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
