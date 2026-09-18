/**
 * Dusk. The opening shot: the building at night, six rooms lit, the name on
 * the roof.
 */

import { site } from "@/content/site";

export const hero = {
  wordmark: "DEVSOC",
  line: site.line,
  link: { label: "Walk through the rooms", href: "#society" },
  /** Set as the building's address plaque, not as a caption. */
  plaque: ["Developers' Society", "BITS Pilani Goa"],
  /**
   * The order the six windows come on when the page opens, as room ids. The
   * colophon switches them off in the reverse order and leaves the last one
   * lit, so this list is also the order the night ends in.
   */
  lightingOrder: ["web", "ai-ml", "game", "ui-ux", "app", "engine"],
};
