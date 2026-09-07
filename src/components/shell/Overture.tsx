"use client";

/**
 * Overture
 * The way in. Once per session, about two seconds.
 *
 * DEVSOC has six letters and the society has six rooms, so the wordmark opens
 * dark and the letters light one at a time, each with a short warm flash, the
 * way a window does when somebody switches a lamp on. By the time all six are
 * lit the veil wipes up into the hero, where the same six are lit on the face
 * of the building. The whole site is in that one gesture, and nothing has to
 * explain it.
 *
 * The wordmark drifts down a little as the veil lifts, so it reads as handing
 * off to the hero wordmark rather than being replaced by it.
 *
 * Click or any key skips. Fires `devsoc:overture` on window when done so the
 * hero can start. Never on reduced motion, never twice in a session, and a
 * guard timer makes sure the veil can never trap the page.
 */

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { motionAllowed } from "@/lib/useMedia";
import { FitText } from "@/components/ui/FitText";
import { site } from "@/content/site";

export const OVERTURE_KEY = "devsoc:overture-seen";

const LETTERS = ["D", "E", "V", "S", "O", "C"];

/** Amber, written out so GSAP can interpolate the shadow numerically. */
const GLOW_OFF = "0 0 0px rgba(255, 138, 61, 0)";
const GLOW_ON = "0 0 40px rgba(255, 138, 61, 0.5)";

export function overturePending() {
  if (typeof window === "undefined") return false;
  try {
    return motionAllowed() && sessionStorage.getItem(OVERTURE_KEY) !== "1";
  } catch {
    return false;
  }
}

export function Overture() {
  const [show, setShow] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLDivElement>(null);
  const sub = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!overturePending()) {
      window.dispatchEvent(new Event("devsoc:overture"));
      return;
    }
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!show || !root.current) return;
    let done = false;
    let alive = true;
    let tl: gsap.core.Timeline | null = null;

    const finish = () => {
      if (done) return;
      done = true;
      try {
        sessionStorage.setItem(OVERTURE_KEY, "1");
      } catch {}
      window.dispatchEvent(new Event("devsoc:overture"));
      setShow(false);
    };

    const skip = () => tl?.progress(1);

    const start = () => {
      if (!alive || !root.current) return;
      const letters = gsap.utils.toArray<HTMLElement>("[data-letter]", root.current);

      tl = gsap.timeline({ onComplete: finish });
      tl.set(letters, { opacity: 0.12, textShadow: GLOW_OFF });

      // One room at a time.
      letters.forEach((el, i) => {
        const at = 0.18 + i * 0.15;
        tl!.to(el, { opacity: 1, duration: 0.5, ease: "expo.out" }, at);
        tl!.to(el, { textShadow: GLOW_ON, duration: 0.16, ease: "power2.out" }, at);
        tl!.to(el, { textShadow: GLOW_OFF, duration: 1.0, ease: "power2.out" }, at + 0.16);
      });

      tl.fromTo(sub.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7, ease: "expo.out" }, 0.95);

      // The veil lifts and the wordmark goes with it, downward, toward where
      // the hero holds its own.
      tl.to(mark.current, { y: 26, duration: 0.75, ease: "expo.inOut" }, 1.34);
      tl.to(sub.current, { opacity: 0, duration: 0.35, ease: "power2.in" }, 1.34);

      // Driven numerically: GSAP string-tweening clip-path is unreliable
      // against a React-set inline value.
      const wipe = { v: 0 };
      tl.to(
        wipe,
        {
          v: 100,
          duration: 0.75,
          ease: "expo.inOut",
          onUpdate() {
            if (root.current) root.current.style.clipPath = `inset(0 0 ${wipe.v}% 0)`;
          },
        },
        1.34,
      );

      if (process.env.NODE_ENV !== "production") {
        // So the reveal can be held still and stepped through while working
        // on it. Two seconds is not long enough to judge by eye.
        (window as unknown as { __overture?: gsap.core.Timeline }).__overture = tl;
      }

      window.addEventListener("pointerdown", skip, { once: true });
      window.addEventListener("keydown", skip, { once: true });
    };

    // Wait for the display face so FitText cannot resize the wordmark
    // mid-reveal, but never wait long enough to be noticed.
    const fonts = document.fonts?.ready ?? Promise.resolve();
    Promise.race([fonts, new Promise((r) => setTimeout(r, 500))]).then(start);

    const guard = setTimeout(finish, 3400);
    return () => {
      alive = false;
      clearTimeout(guard);
      tl?.kill();
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 flex flex-col items-center justify-center bg-base"
      style={{ zIndex: "var(--z-overture)", clipPath: "inset(0 0 0% 0)" }}
      aria-hidden="true"
    >
      <div ref={mark} className="w-full gutter will-change-transform">
        <FitText className="display text-primary" innerClassName="leading-[0.86] block">
          {LETTERS.map((c, i) => (
            <span key={i} data-letter className="inline-block will-change-[opacity]">
              {c}
            </span>
          ))}
        </FitText>
        <p ref={sub} className="meta mt-6 text-center text-muted">
          {site.fullName}
        </p>
      </div>
    </div>
  );
}
