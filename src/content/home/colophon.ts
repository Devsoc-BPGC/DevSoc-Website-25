/**
 * The colophon. Back outside, at dawn, one room still lit.
 */

import { site } from "@/content/site";

export const colophon = {
  line: "The night shift is always short one person.",
  body: "Inductions open once a year and the interview is a conversation, not a test. Any discipline, any year. If you missed the window, write to us anyway.",
  email: site.email,
  pages: [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "Gallery", href: "/gallery" },
    { label: "Inductees", href: "/inductees" },
  ],
  elsewhere: site.socials,
  where: ["Developers' Society", "BITS Pilani, Goa", "Zuarinagar 403726"],
  credit: (year: number) => `Developers' Society, ${year}. Built by the web room.`,
  backToTop: "Back to the top",
  headings: { pages: "Pages", elsewhere: "Elsewhere", where: "Where" },
};
