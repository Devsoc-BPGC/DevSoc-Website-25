export type Project = {
  id: string;
  title: string;
  year: string;
  vertical: string;
  blurb: string;
  image: string;
  width: number;
  height: number;
  href?: string;
};

export const projects: Project[] = [
  {
    id: "waves-web",
    title: "Waves",
    year: "2024",
    vertical: "Web",
    blurb: "The website for Waves, the cultural fest of BITS Goa. Registration, schedule and the retro revelry theme.",
    image: "/images/work/waves-web.jpg",
    width: 2000,
    height: 1250,
  },
  {
    id: "waves-app",
    title: "Fest app",
    year: "2025",
    vertical: "App",
    blurb: "The app the whole campus opens during Waves and Quark. Schedule, passes, notifications.",
    image: "/images/work/waves-app.jpg",
    width: 1103,
    height: 587,
  },
  {
    id: "class-sync",
    title: "Class Sync",
    year: "2025",
    vertical: "Web",
    blurb: "Screenshot your timetable and it lands in Google Calendar, with reminders.",
    image: "/images/work/classsync.jpg",
    width: 2000,
    height: 1250,
  },
  {
    id: "devfest-site",
    title: "DevFest 4.0",
    year: "2025",
    vertical: "Web",
    blurb: "Timeline, prizes, hackathons and sponsors for the flagship event.",
    image: "/images/work/devfest-site.jpg",
    width: 2000,
    height: 1050,
  },
  {
    id: "maestro",
    title: "Maestro",
    year: "2024",
    vertical: "Web",
    blurb: "An e-commerce build for Maestro, shipped by the web room for a client.",
    image: "/images/work/maestro.jpg",
    width: 1086,
    height: 651,
  },
  {
    id: "csa-times",
    title: "CSA Times",
    year: "2025",
    vertical: "App",
    blurb: "The app reel: the builds the app room shipped, running on real phones.",
    image: "/images/work/csa-times.jpg",
    width: 1280,
    height: 716,
  },
];
