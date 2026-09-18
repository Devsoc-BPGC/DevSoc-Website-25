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
  /**
   * What you would actually do in this room. Second person conditional, so it
   * describes the shape of the work rather than claiming a specific thing was
   * done by a specific person.
   */
  doing: string;
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
    doing: "You would own three pages of a fest site, and the one that breaks at one in the morning is yours.",
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
    doing: "You would ship a build to a hundred phones, then read the crash log over breakfast.",
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
    doing: "You would finish something small. A jam build with a start screen and a loss state, which is harder than it sounds.",
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
    doing: "You would turn a photo of a timetable into a calendar, and then handle the blurry ones, which is the actual job.",
    image: "/images/rooms/04-ai-ml.jpg",
    light: { x: 40, y: 24 },
  },
  {
    id: "ui-ux",
    index: "05",
    name: "Design",
    short: "Design",
    object: "stacked artboards and a pen",
    voice: "The part people think is the whole thing.",
    head: "Rishika Gupta",
    tools: ["Figma", "Framer", "Blender"],
    build: "Design systems for every fest",
    doing: "You would draw the thing everyone argues about, and then draw it again after they argue.",
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
    doing: "You would work below the framework. C++, memory, and the parts nobody demos.",
    image: "/images/rooms/06-game-engine.jpg",
    light: { x: 26, y: 62 },
  },
];
