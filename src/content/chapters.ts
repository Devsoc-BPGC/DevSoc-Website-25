export type Chapter = {
  id: string;
  label: string;
  /** Wall clock time this chapter sits at, for display. */
  time: string;
  /** Minutes past 18:00, so the sequence stays monotonic across midnight. */
  minutes: number;
  /** Where the ambient light sits during this chapter, in percent. */
  light: { x: number; y: number };
};

/** One night on campus, dusk to dawn. The clock in the nav runs through these. */
export const chapters: Chapter[] = [
  { id: "dusk", label: "Dusk", time: "18:42", minutes: 42, light: { x: 72, y: 30 } },
  { id: "society", label: "The Society", time: "20:15", minutes: 135, light: { x: 34, y: 40 } },
  { id: "rooms", label: "The Flywheel", time: "22:30", minutes: 270, light: { x: 66, y: 46 } },
  { id: "log", label: "The Log", time: "00:40", minutes: 400, light: { x: 40, y: 55 } },
  { id: "devfest", label: "DevFest", time: "02:00", minutes: 480, light: { x: 50, y: 34 } },
  { id: "crew", label: "The Crew", time: "04:10", minutes: 610, light: { x: 28, y: 50 } },
  { id: "dawn", label: "Dawn", time: "05:58", minutes: 718, light: { x: 62, y: 24 } },
];

/**
 * Formats minutes past 18:00 back to a 24 hour clock string.
 * 0 is 18:00, 400 is 00:40 the next morning, 718 is 05:58.
 */
export function formatNightTime(minutes: number): string {
  const total = Math.round(minutes);
  const hours = (((18 + Math.floor(total / 60)) % 24) + 24) % 24;
  const mins = ((total % 60) + 60) % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}
