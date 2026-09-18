"use client";

/**
 * Facade
 * The building. One plate, every window lit or dark in code.
 *
 * The drawing's own lit windows are ignored: every room window is covered by a
 * lamp the scene controls, and every window the drawing lit that is not a room
 * is covered dark. That is what lets the same plate open the site with six
 * rooms coming on and close it with five going out.
 *
 * Room windows are real links. Hover or focus prints the room's plate beside
 * it; it is a way in, not a menu, and it leaves once the camera starts to move.
 *
 * Also carries the blueprint: a line drawing of the same elevation, window for
 * window, that the scene fades up as the facade tips back and becomes a plan.
 *
 * A scene drives it through CSS variables set on any ancestor:
 *   --tip   0..1  how far the drawing has taken over from the picture
 *   --hold  0..1  whether room plates may show (they hide once the camera moves)
 * and per window through `data-room` and `--on`.
 */

import Image from "next/image";
import type { ReactNode } from "react";
import { RoomPlate } from "./Label";
import { windowBox, type Plate } from "./building";
import { roomById } from "@/content/home/rooms";

export function Facade({
  plate,
  order,
  href = "#rooms",
  priority = false,
  strike = true,
  className,
  children,
}: {
  plate: Plate;
  /** Room ids in the order they light when the page opens. */
  order: readonly string[];
  href?: string;
  priority?: boolean;
  /** Stutter the rooms on at load. Off for a facade that is already lit. */
  strike?: boolean;
  className?: string;
  /** Rendered inside the facade's box, above the windows (the Light). */
  children?: ReactNode;
}) {
  return (
    <div className={`relative w-full ${className ?? ""}`} style={{ aspectRatio: `${plate.w} / ${plate.h}` }}>
      <Image
        src={plate.src}
        alt=""
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover"
        style={{ opacity: "calc(1 - var(--tip, 0) * 0.82)" }}
      />

      {/* The elevation as a drawing. Every window, every floor line. */}
      <svg
        viewBox={`0 0 ${plate.w} ${plate.h}`}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ opacity: "var(--tip, 0)" }}
        aria-hidden="true"
      >
        <g fill="none" stroke="var(--c-blue)" strokeWidth={1.5} vectorEffect="non-scaling-stroke">
          <rect x={1} y={1} width={plate.w - 2} height={plate.h - 2} vectorEffect="non-scaling-stroke" />
          {plate.rows.map(([y0], r) => (
            <line key={`f${r}`} x1={0} x2={plate.w} y1={y0 - 24} y2={y0 - 24} vectorEffect="non-scaling-stroke" />
          ))}
          {plate.rows.flatMap(([y0, y1], r) =>
            plate.cols.map(([x0, x1], c) => (
              <rect
                key={`${c}-${r}`}
                x={x0}
                y={y0}
                width={x1 - x0}
                height={y1 - y0}
                vectorEffect="non-scaling-stroke"
                strokeOpacity={0.7}
              />
            )),
          )}
        </g>
      </svg>

      {/* Windows the drawing lit that are not rooms: dark. */}
      {plate.baked.map(([c, r]) => {
        const b = windowBox(plate, c, r);
        return (
          <span
            key={`baked-${c}-${r}`}
            aria-hidden="true"
            className="win"
            style={{ left: `${b.x * 100}%`, top: `${b.y * 100}%`, width: `${b.w * 100}%`, height: `${b.h * 100}%` }}
          />
        );
      })}

      {/* The rooms. */}
      {Object.entries(plate.rooms).map(([id, [c, r]]) => {
        const room = roomById(id);
        if (!room) return null;
        const b = windowBox(plate, c, r);
        const step = order.indexOf(id);
        const nearRight = b.x > 0.72;
        return (
          <a
            key={id}
            href={href}
            data-room={id}
            aria-label={`${room.number}, ${room.name}`}
            className="win block"
            style={{
              left: `${b.x * 100}%`,
              top: `${b.y * 100}%`,
              width: `${b.w * 100}%`,
              height: `${b.h * 100}%`,
            }}
            data-cursor={room.number}
          >
            <span className="win-lamp">
              <span
                className={`win-glass ${strike ? "win-glass--strike" : ""}`}
                style={{ ["--bar" as string]: plate.mullion, ["--strike" as string]: `${0.35 + Math.max(0, step) * 0.24}s` }}
              />
            </span>
            <RoomPlate
              number={room.number}
              name={room.name}
              className={`win-plate whitespace-nowrap ${nearRight ? "win-plate--left" : ""}`}
            />
          </a>
        );
      })}

      {children}
    </div>
  );
}
