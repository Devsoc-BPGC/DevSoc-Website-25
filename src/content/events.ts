export const devfest = {
  name: "DevFest",
  edition: "4.0",
  venue: "BITS Pilani, K.K. Birla Goa Campus",
  /** Confirm the date and sponsor line with the coordinators. */
  when: null as string | null,
  sponsor: null as string | null,
  blurb:
    "Our flagship. Hackathons, talks and a weekend of shipping on the Goa campus. Every room builds something and shows it.",
};

export type Event = {
  name: string;
  kind: string;
  when: string;
  note: string;
};

export const events: Event[] = [
  { name: "DevFest", kind: "Flagship", when: "Once a year", note: "Hackathons, talks, prizes" },
  { name: "Quark", kind: "Technical fest", when: "Every spring", note: "We run the developer events" },
  { name: "Waves", kind: "Cultural fest", when: "Every autumn", note: "We ship the website and the app" },
  { name: "Workshops", kind: "Sessions", when: "Through the semester", note: "Web, app, game, AI and ML, design" },
  { name: "Inductions", kind: "Walk-in interviews", when: "Once a year", note: "Crew first, then core" },
];
