/**
 * Generates the site's physical textures as small PNGs.
 *
 *   node scripts/make-textures.mjs
 *
 * Texture is baked, not computed in the browser. An SVG feTurbulence filter
 * re-rasterises on every paint and costs a full-screen repaint when it sits on
 * a fixed layer; a tiled PNG costs one decode. It is also seeded, so the grain
 * is identical on every build and a diff of public/ stays quiet.
 *
 *   grain.png   128 x 128   luminance noise with alpha, tiled over the whole page
 *   paper.jpg   384 x 384   soft fibre and mottling, multiplied onto every sheet
 *
 * Both are kept small on purpose: noise does not compress, so the only lever
 * is the tile size, and a 128px grain tile is invisible as a repeat at 3.5%
 * opacity. Paper is greyscale JPEG because it is only ever multiplied.
 */

import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "textures");
mkdirSync(out, { recursive: true });

/** mulberry32: small, fast, and the same numbers every run. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function grain() {
  const size = 128;
  const r = rng(7);
  const px = Buffer.alloc(size * size * 2);
  for (let i = 0; i < size * size; i++) {
    const v = r();
    px[i * 2] = v > 0.5 ? 255 : 0;
    // Most pixels transparent; the few that are not carry the grain.
    px[i * 2 + 1] = Math.round(Math.pow(r(), 3) * 255);
  }
  await sharp(px, { raw: { width: size, height: size, channels: 2 } })
    .png({ compressionLevel: 9 })
    .toFile(join(out, "grain.png"));
}

async function paper() {
  const size = 384;
  const r = rng(19);
  const f = new Float32Array(size * size);

  // Low frequency mottling: a few soft blobs, wrapped so the tile is seamless.
  for (let b = 0; b < 26; b++) {
    const cx = r() * size;
    const cy = r() * size;
    const rad = 30 + r() * 90;
    const amp = (r() - 0.5) * 0.08;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let dx = Math.abs(x - cx);
        let dy = Math.abs(y - cy);
        dx = Math.min(dx, size - dx);
        dy = Math.min(dy, size - dy);
        const d = Math.sqrt(dx * dx + dy * dy) / rad;
        if (d < 1) f[y * size + x] += amp * (1 - d * d);
      }
    }
  }

  // Fibres: short, faint, mostly horizontal strokes.
  for (let n = 0; n < 800; n++) {
    let x = r() * size;
    let y = r() * size;
    const len = 6 + r() * 26;
    const ang = (r() - 0.5) * 0.9;
    const amp = (r() - 0.55) * 0.09;
    for (let s = 0; s < len; s++) {
      const ix = ((Math.round(x) % size) + size) % size;
      const iy = ((Math.round(y) % size) + size) % size;
      f[iy * size + ix] += amp;
      x += Math.cos(ang);
      y += Math.sin(ang);
    }
  }

  // Fine tooth.
  for (let i = 0; i < f.length; i++) f[i] += (r() - 0.5) * 0.05;

  const px = Buffer.alloc(size * size);
  for (let i = 0; i < f.length; i++) {
    px[i] = Math.max(0, Math.min(255, Math.round(236 + f[i] * 255)));
  }
  await sharp(px, { raw: { width: size, height: size, channels: 1 } })
    .jpeg({ quality: 70, mozjpeg: true })
    .toFile(join(out, "paper.jpg"));
}

await grain();
await paper();
console.log("textures written to", out);
