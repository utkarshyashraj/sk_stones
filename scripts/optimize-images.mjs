// Generates responsive, modern-format images for every job in content/generated/image-jobs.json.
//   catalog/* -> WebP at 400/800/1200 px
//   site/* and categories/* -> WebP + AVIF at 640/1280/1920 px
// Never upscales. Writes intrinsic dimensions + dominant colour to content/generated/images.json
// so components can reserve space (no layout shift). Incremental: existing outputs are reused.
// Usage: node scripts/optimize-images.mjs [--force]
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'public', 'images');
const META_FILE = path.join(ROOT, 'content', 'generated', 'images.json');
const force = process.argv.includes('--force');
const forceKind = (process.argv.find((a) => a.startsWith('--force-kind=')) ?? '').split('=')[1] ?? null;
// Per-image overrides (e.g. the header logo is shown ~50px tall: ship a tiny file).
const WIDTH_OVERRIDES = { 'site/shree-logo': [60] };
const jobs = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/generated/image-jobs.json'), 'utf8'));
const prev = !force && fs.existsSync(META_FILE) ? JSON.parse(fs.readFileSync(META_FILE, 'utf8')) : {};

const PROFILES = {
  catalog: { widths: [400, 800, 1200], webp: 74, avif: null },
  site: { widths: [480, 800, 1200, 1920], webp: 74, avif: 52 },
};

sharp.concurrency(2);
const meta = {};
let done = 0;
let reused = 0;
const t0 = Date.now();

async function run(job) {
  const profile = PROFILES[job.kind];
  const src = path.join(ROOT, job.source);
  const outBase = path.join(OUT, job.key);
  fs.mkdirSync(path.dirname(outBase), { recursive: true });
  const old = forceKind === job.kind ? undefined : prev[job.key];
  if (
    old &&
    old.widths.every(
      (w) => fs.existsSync(`${outBase}-${w}.webp`) && (!old.avif || fs.existsSync(`${outBase}-${w}.avif`)),
    )
  ) {
    meta[job.key] = old;
    reused++;
    return;
  }
  const img = sharp(src, { failOn: 'none' }).rotate(); // honour EXIF orientation
  const info = await img.metadata();
  const oriented = (info.orientation ?? 1) >= 5;
  const width = oriented ? info.height : info.width;
  const height = oriented ? info.width : info.height;
  let widths = (WIDTH_OVERRIDES[job.key] ?? profile.widths).filter((w) => w < width);
  if (!WIDTH_OVERRIDES[job.key] && (!widths.length || widths[widths.length - 1] < width))
    widths.push(Math.min(width, profile.widths[profile.widths.length - 1]));
  widths = [...new Set(widths)].sort((a, b) => a - b);
  const { dominant } = await sharp(src, { failOn: 'none' }).resize(32).stats();
  for (const w of widths) {
    const resized = sharp(src, { failOn: 'none' }).rotate().resize({ width: w, withoutEnlargement: true });
    await resized.clone().webp({ quality: profile.webp, effort: 5 }).toFile(`${outBase}-${w}.webp`);
    if (profile.avif)
      await resized.clone().avif({ quality: profile.avif, effort: 4 }).toFile(`${outBase}-${w}.avif`);
  }
  const hex = (n) => n.toString(16).padStart(2, '0');
  meta[job.key] = {
    w: width,
    h: height,
    widths,
    avif: Boolean(profile.avif),
    color: `#${hex(dominant.r)}${hex(dominant.g)}${hex(dominant.b)}`,
  };
  done++;
  if (done % 50 === 0) console.log(`  ${done} processed…`);
}

const queue = [...jobs];
async function worker() {
  while (queue.length) {
    const job = queue.shift();
    try {
      await run(job);
    } catch (e) {
      console.error(`FAILED ${job.key} (${job.source}): ${e.message}`);
      process.exitCode = 1;
    }
  }
}
await Promise.all(Array.from({ length: 4 }, worker));

const sorted = Object.fromEntries(Object.entries(meta).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(META_FILE, JSON.stringify(sorted, null, 1));
let bytes = 0;
const walk = (d) =>
  fs
    .readdirSync(d, { withFileTypes: true })
    .forEach((e) =>
      e.isDirectory() ? walk(path.join(d, e.name)) : (bytes += fs.statSync(path.join(d, e.name)).size),
    );
walk(OUT);
console.log(
  `images: ${Object.keys(sorted).length} (new ${done}, reused ${reused}) in ${((Date.now() - t0) / 1000).toFixed(0)}s; public/images = ${(bytes / 1e6).toFixed(1)} MB`,
);
