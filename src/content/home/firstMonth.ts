/**
 * First Month. The production schedule for your first four weeks.
 *
 * Each week is a different physical object fixed to the schedule, and `kind`
 * says which, so the scene can draw an induction form, a room sign, a build
 * ticket, review notes and a stamp without guessing from the index.
 */

import { weeks as sourceWeeks, inductionClose } from "@/content/induction";

export type WeekKind = "form" | "sign" | "ticket" | "review" | "stamp";

const kinds: WeekKind[] = ["form", "sign", "ticket", "review", "stamp"];

export const weeks = sourceWeeks.map((w, i) => ({ ...w, kind: kinds[i] ?? "form" }));

export const firstMonth = {
  title: "Your first month, honestly",
  line: "Second person, because it is about you",
  coda: inductionClose,
  /** Printed on the Week 4 stamp. */
  stamp: "Shipped",
  /** Printed on the induction form, as field labels. */
  formFields: ["Name", "What have you built", "What do you want to build"],
  /** Written in the margin of the review printout, in marker. */
  reviewNotes: ["why is this here", "name this better", "good. ship it"],
  /**
   * The printout the review marks up. An illustration of a first review, not
   * anybody's real code: a small handler with the two things a first review
   * always finds.
   */
  reviewCode: [
    "function register(form) {",
    "  const data = parse(form);",
    "  if (!data.email) return;",
    "  const t = Date.now();",
    "  const x = save(data);",
    "  notify(data.email);",
    "  return x;",
    "}",
  ],
  /** Printed on the Week 2 build ticket. */
  ticket: { heading: "Build ticket", due: "Due Friday", owner: "Owner", you: "You" },
  /** The schedule's column heads. */
  columns: ["Week", "What happens"],
};
