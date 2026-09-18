/**
 * Torn edges, as a clip-path.
 *
 * A tear is a jagged line along one or both short sides of a sheet. It is
 * generated from a seed, so a given sheet tears the same way on every render
 * and on the server, and it is emitted as `polygon()` with x in percent and y
 * in pixels: the tear keeps its size when the sheet is resized instead of
 * stretching into a sawtooth on a tall sheet.
 *
 * Deliberately not an SVG turbulence filter. That re-rasterises every paint and
 * is one of the clearest tells of a generated page; a static polygon is free.
 */

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type TearSides = "top" | "bottom" | "both" | "none";

/**
 * @param seed   any integer; the same seed gives the same tear
 * @param sides  which edges are torn
 * @param depth  how deep the tear bites, in px
 * @param steps  how many teeth across the width
 */
export function tornEdge(seed: number, sides: TearSides = "bottom", depth = 7, steps = 34) {
  if (sides === "none") return undefined;
  const r = rng(seed);
  const edge = (fromTop: boolean) => {
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * 100;
      // Paper tears in runs: mostly shallow, now and then a deeper bite.
      const bite = r() < 0.18 ? depth : depth * r() * 0.55;
      const y = fromTop ? `${bite.toFixed(1)}px` : `calc(100% - ${bite.toFixed(1)}px)`;
      pts.push(`${x.toFixed(2)}% ${y}`);
    }
    return pts;
  };

  const top = sides === "top" || sides === "both" ? edge(true) : ["0% 0px", "100% 0px"];
  const bottom = sides === "bottom" || sides === "both" ? edge(false).reverse() : ["100% 100%", "0% 100%"];
  return `polygon(${[...top, ...bottom].join(", ")})`;
}
