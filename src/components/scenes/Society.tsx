"use client";

/**
 * 02 The Society
 * Inside the building, seen as its own drawing.
 *
 * The hero ends with the facade tipped flat as a line drawing; this scene
 * begins there and finishes the move, levelling the camera over the ground
 * plan. The light that came down the facade enters the plan from above at the
 * west end, drops into the corridor and runs its length, and each of the six
 * rooms lights as the light reaches its door: the plan registers, room by
 * room, what the elevation showed all at once.
 *
 * The copy sits where a drawing keeps its words. The thesis is set large in
 * the empty site to the north; the longer paragraph is a note taped to the
 * sheet; the facts are the drawing's title block in the corner, where a
 * drawing states its project, its site and its sheet number.
 *
 * At the end the six room modules lift off the plan, the drawing falls away
 * under them, and they settle in a ring in the middle of the frame. The next
 * scene starts from that ring, placed by the same function, so nothing jumps.
 *
 * Progress:
 *   0.00 - 0.14   the camera levels out over the plan
 *   0.02 - 0.72   the light runs the corridor; the camera follows it east
 *   0.06 - 0.70   the copy is up
 *   0.76 - 0.97   the rooms lift and gather into the ring
 */

import { useCallback, useRef } from "react";
import { Scene } from "@/components/world/Scene";
import { Light, span, type LightPoint } from "@/components/world/Light";
import { FloorPlan, PLAN_H, PLAN_W, CORRIDOR_Y, planRoomCentre } from "@/components/world/FloorPlan";
import { RoomModule } from "@/components/world/RoomModule";
import { Paper } from "@/components/world/Paper";
import { Tape } from "@/components/world/Tape";
import { ringSlot } from "@/components/world/ring";
import { rooms, society } from "@/content/home";

const ease = (t: number) => t * t * (3 - 2 * t);

/** Where the light enters the plan and where the corridor ends, in plan units. */
const ENTRY_X = 400;
const EAST_X = 2950;
const route: LightPoint[] = [
  [ENTRY_X / PLAN_W, -150 / PLAN_H],
  [ENTRY_X / PLAN_W, CORRIDOR_Y / PLAN_H],
  [EAST_X / PLAN_W, CORRIDOR_Y / PLAN_H],
];
const DROP = CORRIDOR_Y + 150;
const RUN = EAST_X - ENTRY_X;

/** How far along the corridor the light's head is, in plan units of x. */
function headX(b: number) {
  const along = b * (DROP + RUN);
  return along <= DROP ? ENTRY_X : ENTRY_X + (along - DROP);
}

/** Every room's centre on the plan, fixed, so the scroll handler never changes identity. */
const centres = rooms.map((r) => planRoomCentre(r.id));

const RUN_FROM = 0.02;
const RUN_TO = 0.72;
const GATHER_FROM = 0.76;
const GATHER_TO = 0.97;

function drawCorridor(p: number) {
  const b = span(p, RUN_FROM, RUN_TO);
  const a = b * span(p, GATHER_FROM, 0.92);
  return [a, b] as const;
}

function lightIntensity(p: number) {
  return 1 - span(p, 0.86, 0.97);
}

export function Society() {
  const root = useRef<HTMLDivElement>(null);
  const plan = useRef<HTMLDivElement>(null);
  const mods = useRef<(HTMLDivElement | null)[]>([]);

  const onProgress = useCallback(
    (p: number) => {
      const el = root.current;
      const pl = plan.current;
      if (!el || !pl) return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const narrow = vw < 768;
      const ph = (narrow ? 0.64 : 1.08) * vh;
      const pw = (ph * PLAN_W) / PLAN_H;
      const s = pw / PLAN_W;
      const top = (narrow ? 0.5 : 0.52) * vh - ph / 2;

      // The camera levels out, then follows the light east.
      const tilt = 58 * (1 - ease(span(p, 0, 0.14)));
      const t = ease(span(p, 0.1, RUN_TO));
      // The light left the hero at the middle of the frame, so it enters the
      // plan there too.
      const x0 = 0.5 * vw - ENTRY_X * s;
      const x1 = vw - 3080 * s;
      const px = x0 + (x1 - x0) * t;
      const g = ease(span(p, GATHER_FROM, GATHER_TO));

      pl.style.transform = `translate3d(${px.toFixed(1)}px, 0, 0) rotateX(${tilt.toFixed(2)}deg)`;
      el.style.setProperty("--plan", (1 - g * 0.86).toFixed(3));
      el.style.setProperty("--copy", (span(p, 0.05, 0.12) * (1 - span(p, 0.64, 0.72))).toFixed(3));
      el.style.setProperty("--note", (span(p, 0.18, 0.26) * (1 - span(p, 0.64, 0.72))).toFixed(3));
      el.style.setProperty("--block", span(p, 0.08, 0.16).toFixed(3));

      // Each room lights as the light reaches its door.
      const head = headX(span(p, RUN_FROM, RUN_TO));
      mods.current.forEach((m, i) => {
        if (!m) return;
        const c = centres[i];
        const mx = c.x * PLAN_W;
        const on = Math.min(1, Math.max(0, (head - mx + 60) / 120));
        m.style.setProperty("--on", on.toFixed(3));

        // Lift off the plan and settle in the ring.
        const sx = px + c.x * pw;
        const sy = top + c.y * ph;
        const slot = ringSlot(i, vw, vh);
        const dx = (slot.x - sx) * g;
        const dy = (slot.y - sy) * g;
        const lift = Math.sin(g * Math.PI) * 0.06;
        m.style.transform = `translate(calc(-50% + ${dx.toFixed(1)}px), calc(-50% + ${dy.toFixed(1)}px)) scale(${(1 + lift).toFixed(3)})`;
        m.style.setProperty("--lifted", g.toFixed(3));
      });
    },
    [],
  );

  return (
    <Scene id="society" vh={300} vhMobile={240} settled={0.42} onProgress={onProgress} aria-labelledby="society-line">
      <div ref={root} className="absolute inset-0 [perspective:1600px]">
        {/* The drawing, on the camera. */}
        <div
          ref={plan}
          className="absolute left-0 top-1/2 h-[64vh] origin-center md:top-[52%] md:h-[108vh]"
          style={{ aspectRatio: `${PLAN_W} / ${PLAN_H}`, translate: "0 -50%" }}
        >
          <div className="absolute inset-0" style={{ opacity: "var(--plan, 1)" }}>
            <FloorPlan className="absolute inset-0 h-full w-full" />
            <Light points={route} draw={drawCorridor} intensity={lightIntensity} />
          </div>

          {rooms.map((r, i) => (
            <div
              key={r.id}
              ref={(n) => {
                mods.current[i] = n;
              }}
              className="absolute will-change-transform"
              style={{
                left: `${centres[i].x * 100}%`,
                top: `${centres[i].y * 100}%`,
                transform: "translate(-50%, -50%)",
                zIndex: 2,
              }}
            >
              <RoomModule room={r} />
            </div>
          ))}
        </div>

        {/* The thesis, across the empty site north of the building. It is
            fixed while the plan pans, so it has to live where no room ever
            passes under it: the site north of the outer wall. */}
        <h2
          id="society-line"
          className="display pointer-events-none absolute left-[var(--gutter)] top-[11vh] max-w-[14ch] text-[clamp(1.9rem,3.3vw,3.5rem)] leading-[0.92] text-[var(--c-bone)] md:max-w-[40ch]"
          style={{ opacity: "var(--copy, 0)", translate: "0 calc((1 - var(--copy, 0)) * 16px)" }}
        >
          {society.line}
        </h2>

        {/* Under the building: the long version as a note taped to the
            sheet, and the facts as the drawing's title block. Both sit south
            of the outer wall so neither ever covers a room. */}
        <div
          className="absolute bottom-[4vh] left-[var(--gutter)] w-[min(34rem,84vw)]"
          style={{ opacity: "var(--note, 0)", translate: "0 calc((1 - var(--note, 0)) * 20px)" }}
        >
          <Paper tone="warm" rotate={-1} className="relative px-5 py-4">
            <Tape className="-top-2.5 left-10" rotate={-4} />
            <p className="text-[0.8rem] leading-[1.45] text-[var(--c-ink)] md:text-[0.88rem] md:leading-[1.5]">{society.body}</p>
          </Paper>
        </div>

        <dl
          className="absolute bottom-[4vh] right-[var(--gutter)] hidden w-[27rem] grid-cols-3 border border-[var(--c-blue)] bg-[var(--c-ink)] text-[var(--c-bone)] lg:grid"
          style={{ opacity: "calc(var(--plan, 1) * var(--block, 0))" }}
        >
          <div className="col-span-3 flex items-baseline justify-between border-b border-[var(--c-blue)] px-3 py-1.5">
            <dt className="sr-only">Sheet title</dt>
            <dd className="display text-[1.35rem] leading-none">{society.title}</dd>
          </div>
          {society.titleBlock.map((f, i) => (
            <div
              key={f.label}
              className={`px-3 py-1.5 ${i % 3 !== 2 ? "border-r" : ""} ${i < 3 ? "border-b" : ""} border-[var(--c-blue)]`}
            >
              <dt className="meta text-[0.62rem] text-[var(--c-gray)]">{f.label}</dt>
              <dd className="meta text-[0.8rem] leading-snug">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Scene>
  );
}
