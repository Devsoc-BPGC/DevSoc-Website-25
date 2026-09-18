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
 *   grain.png         128 x 128   luminance noise with alpha, tiled over the whole page
 *   paper.jpg         384 x 384   soft fibre and mottling, multiplied onto every sheet
 *   paper-quiet.jpg   384 x 384   the same fibre on bone, washed back, for long sheets
 *   feed.png           64 x 64    one feed hole of continuous printer paper
 *   pin.png            16 x 16    one dot-matrix pin, a mask tile for printed names
 *   halftone.png       32 x 256   a riso dot screen ramping from speck to solid
 *   ink.png           128 x 128   riso ink: solid, with the specks the drum missed
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

/**
 * The paper for sheets long enough that the camera travels down them: the
 * fibre tile already multiplied onto bone and washed most of the way back
 * toward it. Baked, because doing the same in CSS takes a gradient layer and
 * a blend mode on an element thousands of pixels tall, which some GPUs simply
 * decline to paint.
 */
async function paperQuiet() {
  const { data, info } = await sharp(join(out, "paper.jpg")).raw().toBuffer({ resolveWithObject: true });
  const bone = [240, 236, 226];
  const px = Buffer.alloc(info.width * info.height * 3);
  for (let i = 0; i < info.width * info.height; i++) {
    const t = data[i * info.channels] / 255;
    for (let c = 0; c < 3; c++) {
      const multiplied = bone[c] * t;
      px[i * 3 + c] = Math.round(bone[c] * 0.7 + multiplied * 0.3);
    }
  }
  await sharp(px, { raw: { width: info.width, height: info.height, channels: 3 } })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(join(out, "paper-quiet.jpg"));
}

/** A round, anti-aliased dot on transparent, `size` square, for tiling. */
async function dot(file, size, radius, rgb) {
  const px = Buffer.alloc(size * size * 4);
  const c = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Coverage by 4x4 supersampling, so the edge is soft at any scale.
      let cover = 0;
      for (let sy = 0; sy < 4; sy++) {
        for (let sx = 0; sx < 4; sx++) {
          const dx = x + (sx + 0.5) / 4 - c;
          const dy = y + (sy + 0.5) / 4 - c;
          if (dx * dx + dy * dy <= radius * radius) cover++;
        }
      }
      const i = (y * size + x) * 4;
      px[i] = rgb[0];
      px[i + 1] = rgb[1];
      px[i + 2] = rgb[2];
      px[i + 3] = Math.round((cover / 16) * 255);
    }
  }
  await sharp(px, { raw: { width: size, height: size, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(join(out, file));
}

/**
 * A risograph halftone ramp: a 45 degree dot screen whose dots grow from a
 * speck at the top to nearly touching at the bottom. Used as a mask, it prints
 * a solid shape the way a riso prints a gradient: in dots.
 */
async function halftoneRamp() {
  const w = 32;
  const h = 256;
  const pitch = 8;
  const px = Buffer.alloc(w * h * 2);
  const rows = h / pitch;
  // Is the point inside any dot? Checks the dots of this row and the rows
  // either side, since the big dots at the bottom reach into their neighbours.
  const inside = (px0, py0) => {
    const row = Math.floor(py0 / pitch);
    for (let rr = row - 1; rr <= row + 1; rr++) {
      if (rr < 0 || rr >= rows) continue;
      const ox = rr % 2 ? pitch / 2 : 0;
      const cy = rr * pitch + pitch / 2;
      const radius = 0.4 + Math.pow(cy / h, 1.3) * 4.8;
      const base = Math.floor((px0 - ox) / pitch) * pitch + pitch / 2 + ox;
      for (const cx of [base - pitch, base, base + pitch]) {
        // Wrap horizontally so the tile repeats without a seam.
        const dx = ((px0 - cx + w * 1.5) % w) - w / 2;
        const dy = py0 - cy;
        if (dx * dx + dy * dy <= radius * radius) return true;
      }
    }
    return false;
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let cover = 0;
      for (let sy = 0; sy < 4; sy++) {
        for (let sx = 0; sx < 4; sx++) {
          if (inside(x + (sx + 0.5) / 4, y + (sy + 0.5) / 4)) cover++;
        }
      }
      const i = (y * w + x) * 2;
      px[i] = 0;
      px[i + 1] = Math.round((cover / 16) * 255);
    }
  }
  await sharp(px, { raw: { width: w, height: h, channels: 2 } })
    .png({ compressionLevel: 9 })
    .toFile(join(out, "halftone.png"));
}

/**
 * Riso ink: solid, with the specks where the drum did not quite lay ink
 * down. A mask over everything printed on the DevFest poster.
 */
async function risoInk() {
  const size = 128;
  const r = rng(41);
  const px = Buffer.alloc(size * size * 2);
  for (let i = 0; i < size * size; i++) {
    px[i * 2] = 0;
    const v = r();
    px[i * 2 + 1] = v < 0.05 ? Math.round(40 + r() * 120) : v < 0.12 ? 215 : 255;
  }
  await sharp(px, { raw: { width: size, height: size, channels: 2 } })
    .png({ compressionLevel: 9 })
    .toFile(join(out, "ink.png"));
}

await grain();
await paper();
await halftoneRamp();
await risoInk();
await paperQuiet();
// A feed hole in continuous printer paper: ink, because a hole shows the night.
await dot("feed.png", 64, 12.5, [13, 14, 12]);
// One pin of a dot-matrix print head, used as a mask tile.
await dot("pin.png", 16, 7.2, [0, 0, 0]);
console.log("textures written to", out);
