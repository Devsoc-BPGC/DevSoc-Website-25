export type Vertical = {
  id: string;
  index: string;
  name: string;
  short: string;
  instrument: string;
  voice: string;
  head: string | null;
  tools: string[];
  build: string;
  image: string;
  /** Where the ambient light sits for this room, in percent. */
  light: { x: number; y: number };
};

export const verticals: Vertical[] = [
  {
    id: "web",
    index: "01",
    name: "Web Development",
    short: "Web",
    instrument: "The Loom",
    voice: "Every fest opens in a browser first.",
    head: "Tanay Sheth",
    tools: ["Next.js", "React", "Three.js", "Node"],
    build: "Waves and Quark fest websites",
    image: "/images/rooms/01-web.jpg",
    light: { x: 72, y: 32 },
  },
  {
    id: "app",
    index: "02",
    name: "App Development",
    short: "App",
    instrument: "The Chronometer",
    voice: "The timetable lives in a pocket.",
    head: "Satvik Srinivas",
    tools: ["Flutter", "Dart", "Firebase", "Swift"],
    build: "Fest apps and Class Sync",
    image: "/images/rooms/02-app.jpg",
    light: { x: 30, y: 40 },
  },
  {
    id: "game",
    index: "03",
    name: "Game Development",
    short: "Game",
    instrument: "The Automaton",
    voice: "Frames, physics, and someone's first boss fight.",
    head: "Anvesh Mishra",
    tools: ["Unity", "Unreal", "C#", "Godot"],
    build: "Game jams during Quark",
    image: "/images/rooms/03-game.jpg",
    light: { x: 64, y: 70 },
  },
  {
    id: "ai-ml",
    index: "04",
    name: "AI and ML",
    short: "AI and ML",
    instrument: "The Orrery",
    voice: "Models trained on campus problems.",
    head: "Umang Goel",
    tools: ["Python", "PyTorch", "TensorFlow"],
    build: "Timetable capture for Class Sync",
    image: "/images/rooms/04-ai-ml.jpg",
    light: { x: 40, y: 24 },
  },
  {
    id: "ui-ux",
    index: "05",
    name: "UI and UX",
    short: "UI and UX",
    instrument: "The Lens",
    voice: "The part people think is the whole thing.",
    head: "Rishika Gupta",
    tools: ["Figma", "Framer", "Blender"],
    build: "Design systems for every fest",
    image: "/images/rooms/05-ui-ux.jpg",
    light: { x: 76, y: 56 },
  },
  {
    id: "engine",
    index: "06",
    name: "Engine Development",
    short: "Engine",
    instrument: "The Movement",
    voice: "Below the framework. Bare metal, C++, the parts nobody sees.",
    head: null,
    tools: ["C++", "Assembly", "Bare metal"],
    build: "Project SysCall",
    image: "/images/rooms/06-engine.jpg",
    light: { x: 26, y: 62 },
  },
];
