// Builds the homepage hero image from the company's own Nero Portoro slab photo (black marble with
// natural gold veining). Colours stay natural — the photo is only cropped (glare-prone top edge removed),
// gently darkened and exported in modern formats. Used in ONE place (homepage hero), by design.
// Usage: node scripts/make-textures.mjs   (source lives in the git-ignored .cache/legacy-src)
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, '.cache/legacy-src/nero-portoro-compressed-scaled-79a4a8.webp');
const OUT = path.join(ROOT, 'public/images/textures');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const base = sharp(SRC)
  .extract({ left: 0, top: 160, width: 2560, height: 1283 })
  .modulate({ brightness: 0.78, saturation: 0.9 });

for (const width of [960, 1920]) {
  const resized = base.clone().resize({ width });
  await resized
    .clone()
    .avif({ quality: 50, effort: 5 })
    .toFile(path.join(OUT, `nero-portoro-slab-${width}.avif`));
  await resized
    .clone()
    .webp({ quality: 68, effort: 5 })
    .toFile(path.join(OUT, `nero-portoro-slab-${width}.webp`));
}
for (const f of fs.readdirSync(OUT))
  console.log(f, Math.round(fs.statSync(path.join(OUT, f)).size / 1024), 'KB');
