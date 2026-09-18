/**
 * The Society. The building seen as its own plan.
 */

import { site } from "@/content/site";
import inductees from "@/content/inductees.json";

export const society = {
  title: "The Society",
  line: "Every fest the campus turns up to runs on something built the night before.",
  body: "Six rooms, one society: Web Development, App Development, Game Development, AI and ML, UI and UX, and Game Engine Development. We build the fest sites the whole campus registers on, the apps that open on every phone during Waves and Quark, and the small tools that fix a Tuesday. Nobody here is paid and nothing here is a mock-up.",
  /**
   * The facts, set as an architectural drawing's title block. Every value is
   * verifiable elsewhere in src/content; nothing here is a claim of its own.
   */
  titleBlock: [
    { label: "Project", value: "Developers' Society" },
    { label: "Rooms", value: "6" },
    { label: `Inducted ${site.inducteesYear}`, value: String((inductees as unknown[]).length) },
    { label: "Inductions", value: "Once a year" },
    { label: "Site", value: site.campusShort },
    { label: "Sheet", value: "02" },
  ],
};
