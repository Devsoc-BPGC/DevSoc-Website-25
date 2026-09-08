export type Vertical = {
  id: string;
  index: string;
  name: string;
  short: string;
  /** The object on this vertical's poster, used for alt text. */
  object: string;
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
    object: "an open browser window",
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
    object: "a phone showing a grid of apps",
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
    object: "a game controller",
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
    object: "a small network of nodes",
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
    object: "stacked artboards and a pen",
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
    name: "Game Engine Development",
    short: "Game Engine",
    object: "a pair of gears",
    voice: "Below the framework. Bare metal, C++, the parts nobody sees.",
    head: "Anvesh Mishra",
    tools: ["C++", "Assembly", "Bare metal"],
    build: "Engine work under the game room",
    image: "/images/rooms/06-game-engine.jpg",
    light: { x: 26, y: 62 },
  },
];
