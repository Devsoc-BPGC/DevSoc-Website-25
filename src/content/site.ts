export const site = {
  name: "DevSoc",
  fullName: "Developers' Society, BITS Pilani Goa",
  url: "https://devsoc.club",
  description:
    "The developers' society of BITS Pilani, K.K. Birla Goa Campus. Six verticals, one atelier. Web, app, game, AI and ML, UI and UX, engine development.",
  line: "The campus sleeps. Six rooms stay lit.",
  portLine: "Goa has been a port for five hundred years. We still ship.",
  campus: "BITS Pilani, K.K. Birla Goa Campus",
  campusShort: "K.K. Birla Goa Campus",
  email: "devsocbpgc@gmail.com",
  /** Confirm with the coordinators. Rendered only when set. */
  foundedYear: null as number | null,
  inducteesYear: 2026,
  /** Home shows the inductees moment while this is on. */
  inducteesLive: true,
  socials: [
    { label: "GitHub", href: "https://github.com/Devsoc-BPGC" },
    { label: "LinkedIn", href: "https://in.linkedin.com/company/devsoc-bpgc" },
    { label: "Instagram", href: "https://www.instagram.com/devsocbitsgoa/" },
    { label: "YouTube", href: "https://www.youtube.com/channel/UCOYKNjQaifpxy5qG3as82ZA" },
  ],
} as const;

export const routes = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Team", href: "/team" },
  { label: "Gallery", href: "/gallery" },
  { label: "Inductees", href: "/inductees" },
] as const;
