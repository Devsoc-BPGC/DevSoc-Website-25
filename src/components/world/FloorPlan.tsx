/**
 * FloorPlan
 * The building from the hero, drawn as its ground plan in blueprint ink.
 *
 * Fourteen bays either side of one corridor, the same fourteen bays as the
 * elevation, with the marks a real plan carries and nothing it would not.
 * The grid is numbered along the south edge, which leaves the site to the
 * north empty for the copy, the way a drawing keeps its titling clear of the
 * building:
 * structural grid lines with their bubbles, double outer walls, partitions,
 * door swings on the corridor side, a stair, the entrance. The six rooms that
 * belong to the verticals are washed in blue; everything else is line.
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

export function FloorPlan({ className }: { className?: string }) {
  const bayX = Array.from({ length: BAYS + 1 }, (_, i) => X0 + i * BAY);

  return (
    <svg viewBox={`0 0 ${PLAN_W} ${PLAN_H}`} className={className} aria-hidden="true" fill="none">
      {/* Structural grid: numbered along the top, lettered down the side. */}
      <g stroke="var(--c-blue)" strokeOpacity={0.28} strokeDasharray="22 12" strokeWidth={1} vectorEffect="non-scaling-stroke">
        {bayX.map((x) => (
          <line key={`gx${x}`} x1={x} x2={x} y1={300} y2={1190} vectorEffect="non-scaling-stroke" />
        ))}
        {[TOP, (CORR_T + CORR_B) / 2, BOT].map((y) => (
          <line key={`gy${y}`} x1={110} x2={3090} y1={y} y2={y} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
      <g stroke="var(--c-blue)" strokeWidth={1.25} vectorEffect="non-scaling-stroke" fill="var(--c-ink)">
        {bayX.map((x) => (
          <circle key={`bx${x}`} cx={x} cy={1240} r={36} vectorEffect="non-scaling-stroke" />
        ))}
        {["A", "B", "C"].map((l, i) => (
          <circle key={`by${l}`} cx={70} cy={[TOP, (CORR_T + CORR_B) / 2, BOT][i]} r={36} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
      <g fill="var(--c-blue)" fontFamily="var(--font-body)" fontSize={30} fontWeight={600} textAnchor="middle" dominantBaseline="central">
        {bayX.map((x, i) => (
          <text key={`tx${x}`} x={x} y={1241}>
            {i + 1}
          </text>
        ))}
        {["A", "B", "C"].map((l, i) => (
          <text key={`ty${l}`} x={70} y={[TOP, (CORR_T + CORR_B) / 2, BOT][i] + 1}>
            {l}
          </text>
        ))}
      </g>

      {/* The six rooms, washed. */}
      <g fill="var(--c-blue)" fillOpacity={0.14}>
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

      <g stroke="var(--c-blue)" vectorEffect="non-scaling-stroke">
        {/* Outer walls, drawn double. */}
        <rect x={X0} y={TOP} width={BAYS * BAY} height={BOT - TOP} strokeWidth={2.25} vectorEffect="non-scaling-stroke" />
        <rect x={X0 + 16} y={TOP + 16} width={BAYS * BAY - 32} height={BOT - TOP - 32} strokeWidth={1} strokeOpacity={0.6} vectorEffect="non-scaling-stroke" />

        {/* Partitions. */}
        {bayX.slice(1, -1).map((x) => (
          <g key={`p${x}`} strokeWidth={1.25} strokeOpacity={0.85}>
            <line x1={x} x2={x} y1={TOP + 16} y2={CORR_T} vectorEffect="non-scaling-stroke" />
            <line x1={x} x2={x} y1={CORR_B} y2={BOT - 16} vectorEffect="non-scaling-stroke" />
          </g>
        ))}

        {/* Corridor walls, broken for every door, and the door swings. */}
        {Array.from({ length: BAYS }, (_, i) => {
          const l = X0 + i * BAY;
          const stair = i === 7;
          return (
            <g key={`d${i}`} strokeWidth={1.25}>
              <line x1={l} x2={l + 36} y1={CORR_T} y2={CORR_T} vectorEffect="non-scaling-stroke" />
              <line x1={l + 100} x2={l + BAY} y1={CORR_T} y2={CORR_T} vectorEffect="non-scaling-stroke" />
              <line x1={l} x2={l + 36} y1={CORR_B} y2={CORR_B} vectorEffect="non-scaling-stroke" />
              <line x1={l + 100} x2={l + BAY} y1={CORR_B} y2={CORR_B} vectorEffect="non-scaling-stroke" />
              {!stair ? (
                <>
                  <line x1={l + 36} x2={l + 36} y1={CORR_T} y2={CORR_T - 64} strokeOpacity={0.7} vectorEffect="non-scaling-stroke" />
                  <path d={`M ${l + 100} ${CORR_T} A 64 64 0 0 0 ${l + 36} ${CORR_T - 64}`} strokeOpacity={0.45} vectorEffect="non-scaling-stroke" />
                </>
              ) : null}
              <line x1={l + 36} x2={l + 36} y1={CORR_B} y2={CORR_B + 64} strokeOpacity={0.7} vectorEffect="non-scaling-stroke" />
              <path d={`M ${l + 100} ${CORR_B} A 64 64 0 0 1 ${l + 36} ${CORR_B + 64}`} strokeOpacity={0.45} vectorEffect="non-scaling-stroke" />
            </g>
          );
        })}

        {/* The stair. */}
        <g strokeWidth={1} strokeOpacity={0.7}>
          {Array.from({ length: 11 }, (_, k) => (
            <line
              key={`s${k}`}
              x1={X0 + 7 * BAY + 24}
              x2={X0 + 8 * BAY - 24}
              y1={TOP + 40 + k * 24}
              y2={TOP + 40 + k * 24}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <line x1={X0 + 7.5 * BAY} x2={X0 + 7.5 * BAY} y1={TOP + 40} y2={TOP + 280} vectorEffect="non-scaling-stroke" />
        </g>

        {/* The entrance, and the steps down to the path. */}
        <g strokeWidth={1.25}>
          <line x1={1540} x2={1660} y1={BOT} y2={BOT} stroke="var(--c-ink)" strokeWidth={6} vectorEffect="non-scaling-stroke" />
          {[1, 2, 3].map((k) => (
            <line key={`st${k}`} x1={1500 - k * 16} x2={1700 + k * 16} y1={BOT + k * 26} y2={BOT + k * 26} strokeOpacity={0.7} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
      </g>
    </svg>
  );
}
