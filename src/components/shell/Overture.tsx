"use client";

/**
 * Overture
 * Once per session, under 1.6 seconds: a frame counter ticks to 24 while the
 * two braces of the mark slide in from the edges and frame empty space, then
 * the veil wipes upward into the hero. Click or any key skips it.
 * Fires `devsoc:overture` on window when done so the hero can start.
 * Not shown on reduced motion, and never again in the same session.
 */

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { motionAllowed } from "@/lib/useMedia";

export const OVERTURE_KEY = "devsoc:overture-seen";

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
  const left = useRef<HTMLSpanElement>(null);
  const right = useRef<HTMLSpanElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

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
    const finish = () => {
      if (done) return;
      done = true;
      try {
        sessionStorage.setItem(OVERTURE_KEY, "1");
      } catch {}
      window.dispatchEvent(new Event("devsoc:overture"));
      setShow(false);
    };

    const tl = gsap.timeline({ onComplete: finish });
    const frames = { n: 0 };
    tl.to(frames, {
      n: 24,
      duration: 1.0,
      ease: "none",
      onUpdate() {
        if (counter.current) counter.current.textContent = `00:00:00:${String(Math.round(frames.n)).padStart(2, "0")}`;
      },
    });
    tl.fromTo(left.current, { xPercent: -160, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 1.0, ease: "expo.out" }, 0.05);
    tl.fromTo(right.current, { xPercent: 160, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 1.0, ease: "expo.out" }, 0.05);
    // Drive the wipe numerically; GSAP string-tweening clip-path is unreliable
    // against a React-set inline value.
    const wipe = { v: 0 };
    tl.to(
      wipe,
      {
        v: 100,
        duration: 0.7,
        ease: "expo.inOut",
        onUpdate() {
          if (root.current) root.current.style.clipPath = `inset(0 0 ${wipe.v}% 0)`;
        },
      },
      1.05,
    );
    // Safety: the veil must never trap the page.
    const guard = setTimeout(finish, 2600);

    const skip = () => {
      tl.progress(1);
    };
    window.addEventListener("pointerdown", skip, { once: true });
    window.addEventListener("keydown", skip, { once: true });
    return () => {
      clearTimeout(guard);
      tl.kill();
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 grid place-items-center bg-obsidian"
      style={{ zIndex: "var(--z-overture)", clipPath: "inset(0 0 0% 0)" }}
      aria-hidden="true"
    >
      <span ref={counter} className="hud absolute right-10 top-[1.35rem] text-verdigris">
        00:00:00:00
      </span>
      <div className="display flex items-center gap-[12vw] text-[clamp(6rem,22vw,20rem)] text-bone">
        <span ref={left} className="inline-block">
          {"{"}
        </span>
        <span ref={right} className="inline-block">
          {"}"}
        </span>
      </div>
    </div>
  );
}
