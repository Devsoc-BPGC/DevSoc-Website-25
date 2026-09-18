"use client";

/**
 * 01 Dusk
 * The opening shot. The building at night, six rooms lit, the name standing on
 * the roof like a sign.
 *
 * DEVSOC is a sign on the roof. Channel letters on a steel frame, mounted on
 * the building rather than laid over the picture: the frame shows between the
 * letters and through their counters, its legs run down behind the parapet,
 * and the parapet hides the feet of the letters. It leans back a few degrees,
 * the way a rooftop sign does when you look up at it, and you see the returns
 * under each letter for the same reason. Because it is mounted, it rides the
 * camera with the building: when the camera pushes in and the facade tips
 * back, the sign goes with it. One typographic treatment, carried by its
 * physical construction rather than by a second decorative copy of the word.
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

/**
 * The sign on the roof.
 *
 * Built the way a real one is: a steel frame first, then the letters on it.
 * The letters are two layers of the same word, exactly aligned. The back layer
 * is their depth, a stack of steel toned offsets that reads as the return of a
 * channel letter seen from below. The front layer is the face, bone with the
 * grain of painted metal in it. Two layers because a face filled through
 * `background-clip: text` sits underneath its own text shadow, so depth put on
 * the face would bury it.
 *
 * It is positioned at the roofline of the camera layer and drawn before the
 * facade, so the parapet in the drawing covers the feet of every letter and
 * the legs of the frame.
 */
function RoofSign({ word }: { word: string }) {
  const legs = [7, 24, 41, 58, 75, 92];
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-full left-1/2"
      style={{
        fontSize: "var(--wm)",
        // Centred, and dropped so the feet of the letters sit behind the parapet.
        translate: "-50% calc(var(--wm) * 0.8 * 0.14)",
      }}
    >
      <div
        className="relative"
        style={{
          transformOrigin: "50% 100%",
          transform: "perspective(1100px) rotateX(9deg)",
          filter: "drop-shadow(0 0.03em 0.05em rgb(0 0 0 / 0.45))",
        }}
      >
        {/* The frame: two rails behind the letters, legs down to the roof. */}
        <span className="absolute inset-x-[3%] top-[30%] h-[0.012em] bg-[#34352f]" />
        <span className="absolute inset-x-[3%] top-[66%] h-[0.012em] bg-[#34352f]" />
        {legs.map((l) => (
          <span key={l} className="absolute -bottom-[40%] top-[26%] w-[0.014em] bg-[#2c2d28]" style={{ left: `${l}%` }} />
        ))}

        {/* Depth: the returns of the letters, seen from below. */}
        <span
          className="display relative block whitespace-nowrap leading-[0.8] tracking-[0.005em] text-[#3d3c37]"
          style={{
            textShadow:
              "0 0.004em 0 #6b6962, 0 0.008em 0 #5f5d57, 0 0.012em 0 #53524c, 0 0.016em 0 #474641, 0 0.02em 0 #3d3c37",
          }}
        >
          {word}
        </span>

        {/* Face: bone, with the grain of painted metal.

            The glyphs are taller than the 0.8em line box and overflow it, and
            background-clip: text only paints inside the box, so the tops of
            the letters had no face and the steel depth layer showed through as
            a dark rim. The box is stretched past the glyphs and padded back by
            the same amount, so the paint covers every letter and nothing
            moves. */}
        <span
          className="display absolute inset-x-0 block whitespace-nowrap leading-[0.8] tracking-[0.005em] text-transparent"
          style={{
            top: "-0.2em",
            bottom: "-0.2em",
            paddingTop: "0.2em",
            backgroundColor: "var(--c-bone)",
            backgroundImage: "url('/textures/paper.jpg')",
            backgroundSize: "384px 384px",
            backgroundBlendMode: "multiply",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
          }}
        >
          {word}
        </span>
      </div>
    </div>
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
        className="dusk-root absolute inset-0 [perspective:1600px]"
        style={{
          // The sign is the smallest of three limits: the width of the frame
          // ("DEVSOC" is 2.77em wide in this face), 42% of its height, and
          // whatever height is left once the two lit floors and the copy under
          // them have their room. The third one matters on wide, short
          // windows, where the building is drawn taller than the screen and a
          // full size sign would push the copy off the bottom. The roofline is
          // derived from the result: 86% of each letter stands above the
          // parapet (0.8 line box times 0.86 is the 0.688 below), so the
          // building always starts just under the sign.
          ["--wm" as string]:
            "min(calc((100vw - var(--gutter)) / 2.77), 42vh, calc((100vh - var(--nav-h) - 15.5vh - var(--bh-l) * 0.462) / 0.688))",
          ["--roof" as string]: "calc(var(--nav-h) + 2.5vh + var(--wm) * 0.8 * 0.86)",
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

        {/* The building, on the camera. */}
        <div
          className="facade-cam absolute inset-x-0 z-20"
          style={{ top: "var(--roof)", translate: "calc(var(--mx) * -12px) calc(var(--my) * -7px)" }}
        >
          <RoofSign word={hero.wordmark} />
          <Facade plate={facadeWide} order={hero.lightingOrder} priority className="hidden md:block">
            <Light points={wide.points} draw={drawWide} flicker flickerDelay={strikeAt(facadeWide)} />
          </Facade>
          <Facade plate={facadeTall} order={hero.lightingOrder} priority className="md:hidden">
            <Light points={tall.points} draw={drawTall} flicker flickerDelay={strikeAt(facadeTall)} />
          </Facade>
        </div>

        {/* The copy stands on the lower floors, just under the lit rooms,
            in a fade from transparent to ink that starts below the windows.
            The building stays visible behind it and no room is dimmed. */}
        <div
          ref={band}
          className="absolute inset-x-0 bottom-0 z-40"
          style={{ top: "var(--below)", opacity: "var(--hold, 1)" }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{ background: "linear-gradient(to bottom, transparent 0%, rgb(13 14 12 / 0.72) 38%, var(--c-ink) 100%)" }}
          />
          <div className="relative flex flex-col gap-6 gutter pt-[2.5vh] md:flex-row md:items-end md:justify-between">
            <RevealWords
              as="p"
              id="dusk-line"
              immediate
              delay={1.7}
              className="voice max-w-[19ch] text-[clamp(1.45rem,2.1vw,2.1rem)] text-[var(--c-bone)] [text-wrap:balance]"
            >
              {hero.line}
            </RevealWords>
            <ActionLink href={hero.link.href} className="text-[1rem] text-[var(--c-bone)] md:pb-1.5">
              {hero.link.label}
            </ActionLink>
          </div>
        </div>
      </div>
    </Scene>
  );
}
