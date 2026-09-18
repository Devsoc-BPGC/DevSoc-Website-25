/**
 * Dawn. The night gives way, the list is out, and the questions get answered.
 */

import { site } from "@/content/site";
import { list } from "./roll";

export { faq, type Faq } from "@/content/faq";

export const dawn = {
  headline: site.inducteesLive
    ? `The ${site.inducteesYear} list is out.`
    : "Inductions open once a year. Until then, come to DevFest.",
  line: site.inducteesLive
    ? `${list.length} names. Find yours, or come to DevFest and meet the rest of the room.`
    : "Walk in for the interview when it opens. Missed it? Write to us anyway.",
  search: { label: "Search by name or BITS ID", placeholder: "Type a name" },
  link: { label: `See all ${list.length} names`, href: "/inductees" },
  questions: {
    title: "Questions",
    line: "Everything people actually ask, and the answers we give them in person.",
  },
};
