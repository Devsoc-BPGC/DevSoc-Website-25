/**
 * The building, measured.
 *
 * Every window on the facade plates, as pixel spans read off the graded images
 * (scripts/grade-plates.mjs), so the site can light any window it likes rather
 * than being stuck with whichever ones the illustration happened to bake in.
 * That is what lets one plate carry the hero, the hover states, and the ending
 * where five rooms go dark and one stays on.
 *
 * Spans are the glass only, inside the frame: [start, end] in plate pixels.
 * `mullion` is where the horizontal glazing bar sits, as a share of the glass
 * height, so a window lit in code carries the same bar the drawn ones do.
 *
 * When the new plate family lands, re-measure and replace these numbers; the
 * scenes read nothing else about the drawing.
 */

export type Plate = {
  src: string;
  w: number;
  h: number;
  cols: readonly (readonly [number, number])[];
  rows: readonly (readonly [number, number])[];
  mullion: number;
  /** Which window each room gets: [column index, row index]. */
  rooms: Record<string, readonly [number, number]>;
  /** Windows the drawing lights on its own that are not rooms. Forced dark. */
  baked: readonly (readonly [number, number])[];
  /**
   * The room whose window carries the Light when the page opens. Chosen per
   * plate for position rather than for meaning: it needs to sit near the
   * middle of the frame so the camera can push into it without swinging.
   */
  tube: string;
};

export const facadeWide: Plate = {
  src: "/images/graded/hero-facade-night-wide.jpg",
  w: 1672,
  h: 941,
  cols: [
    [35, 85], [136, 187], [240, 288], [343, 391], [440, 491], [543, 593], [645, 697], [752, 801],
    [853, 905], [958, 1010], [1063, 1112], [1168, 1217], [1272, 1321], [1381, 1426], [1482, 1533], [1587, 1631],
  ],
  rows: [
    [111, 225],
    [310, 425],
    [509, 622],
    [710, 821],
  ],
  mullion: 0.27,
  // Chosen across the top two floors. A 16:10 frame shows the building from
  // the roof down to about the second floor once the wordmark has its sky, and
  // the floors below that fall into the dark ground band where the copy sits.
  // Three of these are lit in the drawing already; the other three are lit in
  // code.
  rooms: {
    web: [2, 0],
    game: [9, 0],
    "ui-ux": [14, 0],
    engine: [4, 1],
    app: [6, 1],
    "ai-ml": [12, 1],
  },
  // The drawing lights these itself, and they are not rooms.
  baked: [
    [12, 2],
    [1, 3],
    [14, 3],
  ],
  tube: "app",
};

export const facadeTall: Plate = {
  src: "/images/graded/hero-facade-night-tall.jpg",
  w: 941,
  h: 1672,
  cols: [
    [53, 134], [203, 282], [352, 435], [506, 588], [660, 739], [809, 888],
  ],
  rows: [
    [136, 311],
    [436, 617],
    [742, 920],
    [1045, 1223],
  ],
  mullion: 0.28,
  // The top three floors. On a phone the copy stands on the fourth.
  rooms: {
    web: [1, 0],
    "ui-ux": [4, 0],
    "ai-ml": [0, 1],
    app: [5, 1],
    game: [2, 2],
    engine: [4, 2],
  },
  baked: [[0, 3]],
  tube: "game",
};

/** A window's glass as shares of the plate: left, top, width, height. */
export function windowBox(plate: Plate, col: number, row: number) {
  const [x0, x1] = plate.cols[col];
  const [y0, y1] = plate.rows[row];
  return {
    x: x0 / plate.w,
    y: y0 / plate.h,
    w: (x1 - x0) / plate.w,
    h: (y1 - y0) / plate.h,
  };
}
