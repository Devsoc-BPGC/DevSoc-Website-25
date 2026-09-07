export type Person = {
  id: string;
  name: string;
  role: string;
  image: string;
  link: string;
  room?: string;
};

export const people: Person[] = [
  {
    id: "utkarsh",
    name: "Utkarsh Sharma",
    role: "Chief Coordinator",
    image: "/images/people/utkarsh.jpg",
    link: "https://in.linkedin.com/in/utkarsh-sharma-37090a27a",
  },
  {
    id: "satvik-jain",
    name: "Satvik Jain",
    role: "Sub-Coordinator",
    image: "/images/people/satvikjain.jpg",
    link: "https://www.linkedin.com/in/satvik-jain-64a30631a/",
  },
  {
    id: "tanay",
    name: "Tanay Sheth",
    role: "Web Development",
    image: "/images/people/tanay.jpg",
    link: "https://www.linkedin.com/in/tanay-sheth-088123344/",
    room: "web",
  },
  {
    id: "satvik-srinivas",
    name: "Satvik Srinivas",
    role: "App Development",
    image: "/images/people/satviksrinivas.jpg",
    link: "https://www.linkedin.com/in/satvik-srinivas-b94165247/",
    room: "app",
  },
  {
    id: "anvesh",
    name: "Anvesh Mishra",
    role: "Game Development",
    image: "/images/people/anvesh.jpg",
    link: "https://mrgreenapplz.netlify.app",
    room: "game",
  },
  {
    id: "umang",
    name: "Umang Goel",
    role: "AI and ML",
    image: "/images/people/umang.jpg",
    link: "https://www.linkedin.com/in/umang-goel-7a0b52311/",
    room: "ai-ml",
  },
  {
    id: "rishika",
    name: "Rishika Gupta",
    role: "UI and UX",
    image: "/images/people/rishika.jpg",
    link: "https://www.linkedin.com/in/rishika-gupta-05858b2b5/",
    room: "ui-ux",
  },
];
