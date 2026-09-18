/**
 * DevFest. The flagship, printed as a poster.
 *
 * `devfest.when` and `devfest.sponsor` are null until the coordinators confirm
 * them, and the poster renders nothing for a null field. Do not fill them with
 * placeholder copy.
 */

export { devfest, events, type Event } from "@/content/events";

export const devfestCopy = {
  facts: ["Hackathons, talks, prizes"],
  scheduleTitle: "Through the year",
  /** Printed on the production tape that crosses the poster. */
  tape: ["Six rooms", "One society", "Every one of them ships", "The lights stay on"],
};
