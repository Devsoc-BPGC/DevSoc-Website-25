/**
 * The six rooms, numbered the way the building numbers them.
 *
 * Room numbers are the one label that appears in every scene: on the lit
 * windows in the hero, on the floor plan, on the rotary cards, on the call
 * sheet. A reader who meets "R-03" three times has learned the building without
 * being told it has a floor plan. They are derived here, once, from the order
 * of `verticals`, so no scene can number a room differently from another.
 */

import { verticals, type Vertical } from "@/content/verticals";

export type Room = Vertical & {
  /** "R-01" to "R-06". */
  number: string;
};

export const rooms: Room[] = verticals.map((v, i) => ({
  ...v,
  number: `R-${String(i + 1).padStart(2, "0")}`,
}));

export function roomById(id: string) {
  return rooms.find((r) => r.id === id);
}

export const roomsCopy = {
  title: "The flywheel",
  line: "Six verticals on one wheel. Every one of them ships.",
  /** Read by the rotary for its accessible name. */
  label: "The six rooms",
};
