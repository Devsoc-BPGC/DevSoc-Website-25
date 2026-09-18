"use client";

/**
 * 01 Dusk
 * The opening shot. The building at night, six rooms lit, the name standing on
 * the roof like a sign.
 *
 * DEVSOC sits behind the roofline, so the building occludes the bottom of every
 * letter and the name reads as something mounted on top of it rather than
 * printed over it. Where the letters cross the facade a second copy is drawn in
 * outline only, the move from the reference where a word passes behind its
 * subject and survives as a stroke. It is the one place the page uses outline
 * type, and it earns it by being about depth.
 *
 * The rooms come on one at a time as the page opens, each with a starter's
 * stutter, and the tube around one of them strikes with its window. That tube
 * is the Light: the object every later scene hands on.
 *
 * On scroll the camera does three things, all a pure function of progress:
 *   0.00 - 0.22   the copy and the room plates clear out
 *   0.12 - 0.62   the camera pushes in on the tube's window
 *   0.60 - 1.00   the facade tips back about that window until it lies down,
 *                 and the picture gives way to its own line drawing
 * The light meanwhile lets go of the window and runs down the building toward
 * the viewer, which is where the plan picks it up.
 */

import { useCallback, useEffect, useRef } from "react";
import { Scene } from "@/components/world/Scene";
import { Facade } from "@/components/world/Facade";
import { Light, span, type LightPoint } from "@/components/world/Light";
import { ActionLink } from "@/components/world/ActionLink";
import { facadeTall, facadeWide, windowBox, type Plate } from "@/components/world/building";
import { RevealWords } from "@/components/motion/text";
import { useReducedMotion } from "@/lib/useMedia";
import { hero } from "@/content/home";

/** smoothstep: a camera that starts and stops gently. */
const ease = (t: number) => t * t * (3 - 2 * t);

/**
 * The tube's route, in shares of the facade: out of the bottom middle of the
 * window, once round its frame, and then straight down the building.
 */
function tubeRoute(plate: Plate) {
  const [c, r] = plate.rooms[plate.tube];
  const b = windowBox(plate, c, r);
  const px = 7 / plate.w;
  const py = 7 / plate.h;
  const x0 = b.x - px;
  const x1 = b.x + b.w + px;
  const y0 = b.y - py;
  const y1 = b.y + b.h + py;
  const xc = (x0 + x1) / 2;
  const points: LightPoint[] = [
    [xc, y1],
    [x1, y1],
    [x1, y0],
    [x0, y0],
    [x0, y1],
    [xc, y1],
    [xc, 1],
  ];
  /** How much of the route is the frame, at the current width. */
  const frame = () => {
    const W = typeof window === "undefined" ? 1440 : window.innerWidth;
    const H = (W * plate.h) / plate.w;
    const ring = 2 * ((x1 - x0) * W + (y1 - y0) * H);
    return ring / (ring + (1 - y1) * H);
  };
  return { points, frame, center: [xc, (y0 + y1) / 2] as const };
}

const wide = tubeRoute(facadeWide);
const tall = tubeRoute(facadeTall);

/** The tube lights with its own window, which strikes this long after load. */
const strikeAt = (plate: Plate) => 0.35 + Math.max(0, hero.lightingOrder.indexOf(plate.tube)) * 0.24;

function useTubeDraw(route: ReturnType<typeof tubeRoute>) {
  return useCallback(
    (p: number) => {
      const ring = route.frame();
      const drop = span(p, 0.28, 0.62);
      const release = span(p, 0.62, 0.98);
      return [ring * release, ring + (1 - ring) * drop] as const;
    },
    [route],
  );
}

export function Dusk() {
  const root = useRef<HTMLDivElement>(null);
  const band = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const drawWide = useTubeDraw(wide);
  const drawTall = useTubeDraw(tall);

  const onProgress = useCallback((p: number) => {
    const el = root.current;
    if (!el) return;
    const hold = 1 - span(p, 0.06, 0.22);
    el.style.setProperty("--hold", hold.toFixed(3));
    el.style.setProperty("--push", ease(span(p, 0.12, 0.62)).toFixed(4));
    el.style.setProperty("--tip", ease(span(p, 0.6, 1)).toFixed(4));
    if (band.current) band.current.style.pointerEvents = hold > 0.5 ? "" : "none";
  }, []);

  // The rooms nearest the pointer brighten a little, the way a lit window
  // catches your eye as you look toward it. Only while the frame is still.
  useEffect(() => {
    const el = root.current;
    if (!el || reduced || !window.matchMedia("(pointer: fine)").matches) return;
    let frame = 0;
    const at = { x: 0, y: 0 };
    const measure = () => {
      frame = 0;
      const hold = parseFloat(el.style.getPropertyValue("--hold") || "1");
      el.querySelectorAll<HTMLElement>("a.win").forEach((w) => {
        if (!w.offsetParent) return;
        const r = w.getBoundingClientRect();
        const d = Math.hypot(r.left + r.width / 2 - at.x, r.top + r.height / 2 - at.y);
        w.style.setProperty("--prox", (Math.max(0, 1 - d / 320) * hold).toFixed(3));
      });
    };
    const move = (e: PointerEvent) => {
      at.x = e.clientX;
      at.y = e.clientY;
      if (!frame) frame = requestAnimationFrame(measure);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return (
    <Scene id="dusk" vh={220} vhMobile={170} settled={0} depth onProgress={onProgress} aria-labelledby="dusk-line">
      <div
        ref={root}
        className="absolute inset-0 [perspective:1600px]"
        style={{
          // The name is sized by whichever runs out first, the width of the
          // frame or 44% of its height ("DEVSOC" is 2.77em wide in this face),
          // and the roofline is derived from it: 78% of the name stands above
          // the roof, so the building always starts just under the letters on
          // any screen shape, and what passes behind it is only the cornice.
          ["--wm" as string]: "min(calc((100vw - 2 * var(--gutter)) / 2.77), 44vh)",
          ["--roof" as string]: "calc(var(--nav-h) + 2.5vh + var(--wm) * 0.8 * 0.78)",
          ["--wx-s" as string]: tall.center[0],
          ["--wy-s" as string]: tall.center[1],
          ["--bh-s" as string]: `${((facadeTall.h / facadeTall.w) * 100).toFixed(3)}vw`,
          ["--wx-l" as string]: wide.center[0],
          ["--wy-l" as string]: wide.center[1],
          ["--bh-l" as string]: `${((facadeWide.h / facadeWide.w) * 100).toFixed(3)}vw`,
        }}
      >
        <h1 className="sr-only">DevSoc, the Developers&apos; Society of BITS Pilani Goa</h1>

        {/* The sky. Darker overhead, a little light held low where the town
            is, the way a night sky actually sits behind a roofline. */}
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(to bottom, var(--c-ink) 0%, #0f1117 calc(var(--roof) - 14vh), #1a2030 calc(var(--roof) + 1vh), var(--c-ink) calc(var(--roof) + 26vh))",
          }}
        />

        {/* The name, standing behind the roof. */}
        <div
          className="display pointer-events-none absolute inset-x-0 z-10 text-center leading-[0.8] tracking-[0.005em] text-[var(--c-bone)]"
          style={{
            top: "var(--roof)",
            fontSize: "var(--wm)",
            transform: "translateY(calc(-78% - var(--push, 0) * 34vh))",
            translate: "calc(var(--mx) * -5px) calc(var(--my) * -3px)",
            opacity: "calc(1 - var(--push, 0) * 2.4)",
          }}
          aria-hidden="true"
        >
          {hero.wordmark}
        </div>

        {/* The building, on the camera. */}
        <div
          className="facade-cam absolute inset-x-0 z-20"
          style={{ top: "var(--roof)", translate: "calc(var(--mx) * -12px) calc(var(--my) * -7px)" }}
        >
          <Facade plate={facadeWide} order={hero.lightingOrder} priority className="hidden md:block">
            <Light points={wide.points} draw={drawWide} flicker flickerDelay={strikeAt(facadeWide)} />
          </Facade>
          <Facade plate={facadeTall} order={hero.lightingOrder} priority className="md:hidden">
            <Light points={tall.points} draw={drawTall} flicker flickerDelay={strikeAt(facadeTall)} />
          </Facade>
        </div>

        {/* Where the name crosses the building it survives as a stroke. */}
        <div
          className="display pointer-events-none absolute inset-x-0 z-30 text-center leading-[0.8] tracking-[0.005em] text-transparent [-webkit-text-stroke:1.25px_var(--c-bone)]"
          style={{
            top: "var(--roof)",
            fontSize: "var(--wm)",
            transform: "translateY(calc(-78% - var(--push, 0) * 34vh))",
            translate: "calc(var(--mx) * -5px) calc(var(--my) * -3px)",
            opacity: "calc(1 - var(--push, 0) * 2.4)",
            clipPath: "inset(78% 0 0 0)",
          }}
          aria-hidden="true"
        >
          {hero.wordmark}
        </div>

        {/* The ground line, and the title strip under it.

            An elevation drawing ends on a ground line with a thin strip of
            titling beneath it, and that is what this is: the building stands on
            a hairline, and the copy sits quietly under it instead of competing
            with the name in a block of its own. No scrim reaches up into the
            building, so nothing dims the rooms. */}
        <div
          ref={band}
          className="absolute inset-x-0 bottom-0 z-40 h-[var(--strip)] bg-[var(--c-ink)] [--strip:24vh] md:[--strip:11vh]"
          style={{ opacity: "var(--hold, 1)" }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-[var(--c-steel)]" aria-hidden="true" />
          <div className="flex h-full flex-col justify-center gap-5 gutter md:flex-row md:items-center md:justify-between md:gap-10">
            <RevealWords
              as="p"
              id="dusk-line"
              immediate
              delay={1.7}
              className="voice text-[clamp(1.2rem,1.55vw,1.55rem)] text-[var(--c-bone)] [text-wrap:balance]"
            >
              {hero.line}
            </RevealWords>
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-10">
              <p className="meta text-[var(--c-gray)]">{hero.plaque.join(", ")}</p>
              <ActionLink href={hero.link.href} className="text-[0.95rem] text-[var(--c-bone)]">
                {hero.link.label}
              </ActionLink>
            </div>
          </div>
        </div>
      </div>
    </Scene>
  );
}
