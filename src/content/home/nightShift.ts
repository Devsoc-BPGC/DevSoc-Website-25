/**
 * The Night Shift. How a fest site actually gets built, as production notes
 * piling up on a desk.
 */

export { beats, shipLines, type Beat } from "@/content/process";

export const nightShift = {
  title: "How a fest site actually gets built",
  line: "How it goes, not a case study",
  /** Units the monitor's countdown prints next to the number. */
  units: { days: "days", hours: "hours", hour: "hour" },
  /** The sheet the notes pile onto. */
  cover: "Production notes",
  shipped: "Shipped. Every window lit.",
  /** The LED sign on the wall. The site's only true marquee. */
  sign: ["Build with intent", "Break, learn, repeat", "Stay dangerously curious", "It starts with what if"],
};
