/**
 * Grades the old indigo and amber plates into the night palette.
 *
 *   node scripts/grade-plates.mjs
 *
 * Interim only. The new plate family is drawn in ink, bone and blueprint blue
 * and will replace these; until it arrives, the existing plates are mapped
 * through a three stop duotone so they sit in the new world instead of
 * fighting it: shadows to ink, midtones to a cold blueprint grey, highlights
 * to bone. Baked amber windows land on bone, which is the new colour of light.
 *
 * Baked into files rather than applied as a CSS or SVG filter on purpose. The
 * hero plate is scaled and tipped on every scroll frame, and a filter on it
 * would re-rasterise the whole image each frame.
 */

import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "images");
const out = join(root, "graded");
mkdirSync(out, { recursive: true });

const plates = [
  "hero/facade-night-wide.jpg",
  "hero/facade-night-tall.jpg",
  "rooms/01-web.jpg",
  "rooms/02-app.jpg",
  "rooms/03-game.jpg",
  "rooms/04-ai-ml.jpg",
  "rooms/05-ui-ux.jpg",
  "rooms/06-game-engine.jpg",
  "process/desk-2am.jpg",
  "process/chair.jpg",
  "process/whiteboard.jpg",
  "process/lid.jpg",
];

/** ink #0d0e0c, blueprint grey #1f2536, bone #f0ece2 */
const stops = [
  [0.0, [13, 14, 12]],
  [0.42, [31, 37, 54]],
  [1.0, [240, 236, 226]],
];

function ramp(t) {
  for (let i = 1; i < stops.length; i++) {
    const [t1, c1] = stops[i];
    const [t0, c0] = stops[i - 1];
    if (t <= t1) {
      const k = (t - t0) / (t1 - t0);
      return c0.map((v, j) => Math.round(v + (c1[j] - v) * k));
    }
  }
  return stops[stops.length - 1][1];
}

for (const rel of plates) {
  const src = join(root, rel);
  const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = Buffer.alloc(info.width * info.height * 3);
  for (let i = 0; i < info.width * info.height; i++) {
    const r = data[i * 3];
    const g = data[i * 3 + 1];
    const b = data[i * 3 + 2];
    // Perceptual luminance, then a gentle lift so the building's dark
    // indigo does not crush straight to ink and lose its window grid.
    const l = Math.pow((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255, 0.85);
    const [R, G, B] = ramp(l);
    px[i * 3] = R;
    px[i * 3 + 1] = G;
    px[i * 3 + 2] = B;
  }
  const name = `${dirname(rel).replace(/\//g, "-")}-${basename(rel)}`;
  await sharp(px, { raw: { width: info.width, height: info.height, channels: 3 } })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(join(out, name));
  console.log("graded", rel, "->", `graded/${name}`);
}
