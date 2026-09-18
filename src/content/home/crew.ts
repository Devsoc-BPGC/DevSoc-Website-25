/**
 * The Crew. This year's call sheet.
 *
 * Two coordinators and five room heads. Game Engine Development sits under the
 * game room, so its head carries two room numbers.
 */

import { people, type Person } from "@/content/people";
import { rooms } from "./rooms";

/** Which rooms each head runs, by room id. */
const headOf: Record<string, string[]> = {
  tanay: ["web"],
  "satvik-srinivas": ["app"],
  anvesh: ["game", "engine"],
  umang: ["ai-ml"],
  rishika: ["ui-ux"],
};

export type CrewMember = Person & {
  coordinator: boolean;
  /** Room numbers this person heads, for example ["R-03", "R-06"]. */
  rooms: string[];
};

export const crew: CrewMember[] = people.map((p) => ({
  ...p,
  coordinator: !headOf[p.id],
  rooms: (headOf[p.id] ?? []).map((id) => rooms.find((r) => r.id === id)?.number ?? "").filter(Boolean),
}));

export const crewCopy = {
  title: "The crew",
  line: "The coordinators for this year. Every room has a head; the heads answer to two.",
  sheet: "Call sheet",
};
