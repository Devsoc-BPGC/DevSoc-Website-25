/**
 * The Roll. Everyone inducted this year, printed on one continuous sheet.
 */

import inductees from "@/content/inductees.json";
import { site } from "@/content/site";

export type Inductee = { name: string; id: string | null };

export const list = inductees as Inductee[];

export const roll = {
  count: list.length,
  line: "Inducted this year.",
  counted: "counted",
  search: {
    label: "Find your name",
    hint: "Search by name or BITS ID",
    placeholder: "Type a name",
    empty: "Nothing matches that spelling.",
    noId: "ID not given",
  },
  link: { label: `See all ${list.length} names`, href: "/inductees" },
  note: `Names and IDs as they came from the ${site.inducteesYear} induction list. If yours is wrong, write to us.`,
};

/** Name or BITS ID, case-insensitive, first eight matches. */
export function findInductees(query: string, limit = 8) {
  const t = query.trim().toLowerCase();
  if (!t) return [];
  return list
    .map((p, index) => ({ ...p, index }))
    .filter((p) => p.name.toLowerCase().includes(t) || (p.id ?? "").toLowerCase().includes(t))
    .slice(0, limit);
}
