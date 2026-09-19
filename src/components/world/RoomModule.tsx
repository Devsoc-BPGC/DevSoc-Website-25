/**
 * RoomModule
 * One of the six rooms as a physical module: a plate cut from the plan, with
 * its room number, its name, and a small lamp that says whether anyone is in.
 *
 * It is the object that travels. It sits on the floor plan in Society, lifts
 * off it and settles in the ring at the end of that scene, and the rotary in
 * Rooms begins from the same six in the same places. Sized in CSS so every
 * scene that draws one draws it the same.
 *
 * `--on` (0 to 1) is how lit the room is: it drives the lamp and the edge.
 */

import type { CSSProperties } from "react";
import type { Room } from "@/content/home/rooms";

export function RoomModule({ room, className, style }: { room: Room; className?: string; style?: CSSProperties }) {
  return (
    <div
      className={`room-module flex flex-col justify-between p-3 max-md:p-2 ${className ?? ""}`}
      style={style}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="display text-[1.55rem] leading-none tracking-[0.02em] text-[var(--c-bone)] max-md:text-[1.1rem]">{room.number}</span>
        <span aria-hidden="true" className="room-lamp mt-1 block h-2 w-2 rounded-full max-md:h-1.5 max-md:w-1.5" />
      </div>
      <span className="meta text-[0.72rem] leading-tight text-[var(--c-bone)]/85 max-md:text-[0.6rem]">{room.name}</span>
    </div>
  );
}
