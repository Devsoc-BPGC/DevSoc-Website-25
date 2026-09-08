"use client";

/**
 * ScrubFilm
 * The fest app, shown by scrubbing rather than by playing. The section sticks
 * and the film's own time is the animated property: scroll forward and the
 * footage runs forward, scroll back and it runs back, at exactly your pace.
 *
 * This is the one place on the site where a video is seeked rather than left to
 * play, and it is deliberate. Everywhere else, video is ambient texture that
 * plays while it is on screen and pauses when it is not, because seeking forces
 * the browser to hold the whole file.
 *
 * It lives on the projects route rather than the home page. Seeking wants the
 * file resident, and asking a phone on mobile data to hold a video before the
 * hero has even painted is the wrong trade for a page most people only scroll
 * past. Here, the reader has chosen to come and look at the work.
 *
 * It preloads, which is the one place on the site that does. Seeking needs the
 * data resident: with preload="none" the currentTime moves and nothing decodes,
 * so you scrub a poster frame. That was an unaffordable trade when this file
 * was 16MB. Re-encoded it is 1.3MB, on a route the reader chose to open, and
 * the poster covers the wait.
 *
 * Reduced motion plays it as an ordinary looping clip instead.
 */

import { useRef } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { SCRUB } from "@/lib/easings";
import { useReducedMotion } from "@/lib/useMedia";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function ScrubFilm() {
  const track = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const code = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const v = video.current;
      const t = track.current;
      if (!v || !t) return;
      if (reduced) {
        v.play().catch(() => {});
        return;
      }
      v.pause();
      const st = ScrollTrigger.create({
        trigger: t,
        start: "top top",
        end: "bottom bottom",
        scrub: SCRUB.normal,
        onUpdate(self) {
          const d = v.duration || 21;
          const time = self.progress * d;
          if (Math.abs(v.currentTime - time) > 0.03) v.currentTime = time;
          if (code.current) {
            const s = Math.floor(time);
            const f = Math.floor((time - s) * 24);
            code.current.textContent = `00:00:${pad(s)}:${pad(f)}`;
          }
        },
      });
      return () => st.kill();
    },
    { scope: track, dependencies: [reduced] },
  );

  return (
    <div ref={track} className="relative h-[220vh]">
      <div className="sticky top-0 flex h-[100dvh] items-center gutter">
        <div className="relative mx-auto w-full max-w-[min(88vw,150vh)]">
          <div className="resolve relative aspect-video" style={{ ["--resolve" as string]: 0.35 }}>
            <video
              ref={video}
              src="/video/csa-times.mp4"
              muted
              playsInline
              preload="auto"
              poster="/video/csa-times-poster.jpg"
              loop={reduced}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="pointer-events-none absolute -left-3 -top-3 h-4 w-4 border-l border-t border-rule/70" />
          <span className="pointer-events-none absolute -right-3 -top-3 h-4 w-4 border-r border-t border-rule/70" />
          <span className="pointer-events-none absolute -bottom-3 -left-3 h-4 w-4 border-b border-l border-rule/70" />
          <span className="pointer-events-none absolute -bottom-3 -right-3 h-4 w-4 border-b border-r border-rule/70" />
          <div className="meta mt-5 flex justify-between text-muted">
            <span>
              <span className="text-primary">Fest app</span>. Waves and Quark, 2025
            </span>
            <span ref={code} className="hud text-light">
              00:00:00:00
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
