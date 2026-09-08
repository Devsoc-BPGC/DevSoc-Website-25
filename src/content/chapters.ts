export type Chapter = {
  id: string;
  label: string;
  /** Where the ambient light sits during this chapter, in percent. */
  light: { x: number; y: number };
};

/**
 * One night on campus, dusk to dawn. The order is the story; the rail, the
 * nav label and the ambient light all read from here, so a chapter cannot
 * drift out of sequence with itself.
 */
export const chapters: Chapter[] = [
  { id: "dusk", label: "Dusk", light: { x: 72, y: 30 } },
  { id: "society", label: "The Society", light: { x: 34, y: 40 } },
  { id: "rooms", label: "The Flywheel", light: { x: 66, y: 46 } },
  { id: "nightshift", label: "The Night Shift", light: { x: 22, y: 72 } },
  { id: "log", label: "The Log", light: { x: 40, y: 55 } },
  { id: "first-month", label: "First Month", light: { x: 74, y: 38 } },
  { id: "roll", label: "One Eighty Six", light: { x: 50, y: 30 } },
  { id: "devfest", label: "DevFest", light: { x: 50, y: 34 } },
  { id: "crew", label: "The Crew", light: { x: 28, y: 50 } },
  { id: "dawn", label: "Dawn", light: { x: 62, y: 24 } },
];
