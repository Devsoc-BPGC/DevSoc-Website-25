/**
 * FloorPlan
 * The building from the hero, drawn as its ground plan in blueprint ink.
 *
 * Fourteen bays either side of one corridor, the same fourteen bays as the
 * elevation, drawn the way an architect draws a plan: the walls that are cut
 * are solid (poché), heavier at the outside than between rooms, and broken for
 * every door, with the door's swing drawn in a hairline. The six rooms that
 * belong to the verticals are washed in blue; everything else is left as
 * paper. A north point and the entrance steps are the only marks outside the
 * walls. No grid bubbles and no numbers: the rooms carry their own.
 *
 * Drawn in its own units, 3200 by 1400, and scaled to whatever box it is put
 * in. Room centres are exported so scenes can place things on the plan
 * without re-deriving the geometry.
 */

export const PLAN_W = 3200;
export const PLAN_H = 1400;

const BAYS = 14;
const X0 = 200;
const BAY = 200;
const TOP = 350;
const CORR_T = 660;
const CORR_B = 740;
const BOT = 1050;
/** Wall thicknesses: outside, between rooms, along the corridor. */
const OUTER = 20;
const PART = 8;
const CORR = 9;
/** Where each door's opening is along its bay. */
const DOOR_FROM = 36;
const DOOR_TO = 100;

/** Which bay and which side of the corridor each room is in. */
export const planRooms: Record<string, { bay: number; side: "north" | "south" }> = {
  web: { bay: 1, side: "north" },
  app: { bay: 3, side: "south" },
  game: { bay: 5, side: "north" },
  "ai-ml": { bay: 7, side: "south" },
  "ui-ux": { bay: 9, side: "north" },
  engine: { bay: 11, side: "south" },
};

/** A room's centre, in shares of the plan. */
export function planRoomCentre(id: string) {
  const r = planRooms[id];
  const x = X0 + BAY * r.bay + BAY / 2;
  const y = r.side === "north" ? (TOP + CORR_T) / 2 : (CORR_B + BOT) / 2;
  return { x: x / PLAN_W, y: y / PLAN_H };
}

/** The corridor's centre line, in plan units, for routing the light. */
export const CORRIDOR_Y = (CORR_T + CORR_B) / 2;
export const PLAN_X0 = X0;
export const PLAN_X1 = X0 + BAYS * BAY;

const STAIR_BAY = 7;
const ENTRY = { from: 1540, to: 1660 };

export function FloorPlan({ className }: { className?: string }) {
  const right = X0 + BAYS * BAY;
  const bayX = Array.from({ length: BAYS + 1 }, (_, i) => X0 + i * BAY);

  // The corridor walls, as solid runs broken at every door opening.
  const corridorRuns = (y: number, skip: (i: number) => boolean) =>
    Array.from({ length: BAYS }, (_, i) => {
      const l = X0 + i * BAY;
      if (skip(i)) return [[l, l + BAY]];
      return [
        [l, l + DOOR_FROM],
        [l + DOOR_TO, l + BAY],
      ];
    })
      .flat()
      .map(([a, b]) => <rect key={`c${y}-${a}`} x={a} y={y - CORR / 2} width={b - a} height={CORR} />);

  return (
    <svg viewBox={`0 0 ${PLAN_W} ${PLAN_H}`} className={className} aria-hidden="true" fill="none">
      {/* The six rooms, washed. */}
      <g fill="var(--c-blue)" fillOpacity={0.16}>
        {Object.values(planRooms).map((r) => (
          <rect
            key={`wash${r.bay}${r.side}`}
            x={X0 + BAY * r.bay}
            y={r.side === "north" ? TOP : CORR_B}
            width={BAY}
            height={r.side === "north" ? CORR_T - TOP : BOT - CORR_B}
          />
        ))}
      </g>

      {/* Door swings and the stair, in hairline. */}
      <g stroke="var(--c-blue)" strokeWidth={1.25} vectorEffect="non-scaling-stroke">
        {Array.from({ length: BAYS }, (_, i) => {
          const l = X0 + i * BAY;
          const north = i !== STAIR_BAY;
          return (
            <g key={`d${i}`} strokeOpacity={0.55}>
              {north ? (
                <>
                  <line x1={l + DOOR_FROM} x2={l + DOOR_FROM} y1={CORR_T} y2={CORR_T - 64} vectorEffect="non-scaling-stroke" />
                  <path d={`M ${l + DOOR_TO} ${CORR_T} A 64 64 0 0 0 ${l + DOOR_FROM} ${CORR_T - 64}`} strokeDasharray="6 5" vectorEffect="non-scaling-stroke" />
                </>
              ) : null}
              <line x1={l + DOOR_FROM} x2={l + DOOR_FROM} y1={CORR_B} y2={CORR_B + 64} vectorEffect="non-scaling-stroke" />
              <path d={`M ${l + DOOR_TO} ${CORR_B} A 64 64 0 0 1 ${l + DOOR_FROM} ${CORR_B + 64}`} strokeDasharray="6 5" vectorEffect="non-scaling-stroke" />
            </g>
          );
        })}
        <g strokeOpacity={0.7}>
          {Array.from({ length: 11 }, (_, k) => (
            <line
              key={`s${k}`}
              x1={X0 + STAIR_BAY * BAY + 24}
              x2={X0 + (STAIR_BAY + 1) * BAY - 24}
              y1={TOP + 40 + k * 24}
              y2={TOP + 40 + k * 24}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <line x1={X0 + (STAIR_BAY + 0.5) * BAY} x2={X0 + (STAIR_BAY + 0.5) * BAY} y1={TOP + 40} y2={TOP + 280} vectorEffect="non-scaling-stroke" />
        </g>
        {/* The steps down to the path, outside the entrance. */}
        <g strokeOpacity={0.6}>
          {[1, 2, 3].map((k) => (
            <line key={`st${k}`} x1={ENTRY.from - 40 - k * 16} x2={ENTRY.to + 40 + k * 16} y1={BOT + 16 + k * 26} y2={BOT + 16 + k * 26} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
      </g>

      {/* The walls that are cut, solid. */}
      <g fill="var(--c-blue)">
        {/* Outside: north, west, east, and south broken for the entrance. */}
        <rect x={X0 - OUTER} y={TOP - OUTER} width={right - X0 + OUTER * 2} height={OUTER} />
        <rect x={X0 - OUTER} y={TOP} width={OUTER} height={BOT - TOP} />
        <rect x={right} y={TOP} width={OUTER} height={BOT - TOP} />
        <rect x={X0 - OUTER} y={BOT} width={ENTRY.from - X0 + OUTER} height={OUTER} />
        <rect x={ENTRY.to} y={BOT} width={right - ENTRY.to + OUTER} height={OUTER} />
        {/* Between rooms. */}
        {bayX.slice(1, -1).map((x) => (
          <g key={`p${x}`}>
            <rect x={x - PART / 2} y={TOP} width={PART} height={CORR_T - TOP} />
            <rect x={x - PART / 2} y={CORR_B} width={PART} height={BOT - CORR_B} />
          </g>
        ))}
        {/* Along the corridor, open at every door; the stair bay has no door. */}
        {corridorRuns(CORR_T, (i) => i === STAIR_BAY)}
        {corridorRuns(CORR_B, () => false)}
      </g>

      {/* The north point, in the empty site to the east. */}
      <g transform={`translate(${right + 110} ${TOP + 70})`} stroke="var(--c-blue)" vectorEffect="non-scaling-stroke">
        <circle r={46} strokeWidth={1.25} vectorEffect="non-scaling-stroke" />
        <path d="M 0 -40 L 16 22 L 0 10 L -16 22 Z" fill="var(--c-blue)" stroke="none" />
        <text y={-60} textAnchor="middle" fill="var(--c-blue)" stroke="none" fontFamily="var(--font-display)" fontWeight={800} fontSize={40}>
          N
        </text>
      </g>
    </svg>
  );
}
