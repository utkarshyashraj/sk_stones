// Downloads every image hotlinked from the legacy staging WordPress host into .cache/legacy-src/
// and writes a manifest (url -> local file, status, bytes, sha1). Safe to re-run: skips existing files.
// Usage: node scripts/download-legacy-images.mjs
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.resolve(import.meta.dirname, '..');
const LEGACY = path.join(ROOT, 'legacy');
const CACHE = path.join(ROOT, '.cache', 'legacy-src');
const MANIFEST = path.join(ROOT, 'content', 'raw', 'image-manifest.json');
const HOST = 'tan-beaver-239605.hostingersite.com';

const urls = new Set();
for (const f of fs.readdirSync(LEGACY).filter((x) => x.endsWith('.html'))) {
  const html = fs.readFileSync(path.join(LEGACY, f), 'utf8');
  for (const m of html.matchAll(/https?:\/\/tan-beaver-239605\.hostingersite\.com\/[^"'\s)]+/g))
    urls.add(m[0]);
}

// Plus staging-host images the app itself references (content/site-images.json).
const siteImages = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'site-images.json'), 'utf8')).images;
for (const src of Object.values(siteImages)) if (src.includes(HOST)) urls.add(src);

const localName = (url) => {
  const base = decodeURIComponent(url.split('/').pop())
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/-+/g, '-');
  const hash = crypto.createHash('sha1').update(url).digest('hex').slice(0, 6);
  const ext = path.extname(base) || '.bin';
  return `${path.basename(base, ext).slice(0, 60)}-${hash}${ext}`;
};

fs.mkdirSync(CACHE, { recursive: true });
const list = [...urls].sort();
const results = [];
let i = 0;
async function worker() {
  while (i < list.length) {
    const url = list[i++];
    const file = localName(url);
    const dest = path.join(CACHE, file);
    let status = 'cached';
    let recoveredFrom = null;
    const get = async (u) => {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const res = await fetch(u, { headers: { 'User-Agent': 'skstones-migration/1.0' } });
          if (!res.ok) return `http-${res.status}`;
          fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
          return 'downloaded';
        } catch (e) {
          status = `error: ${e.message}`;
        }
      }
      return status;
    };
    if (!fs.existsSync(dest)) {
      status = await get(url);
      // WordPress "edited image" copies (-e<timestamp>) were deleted on the host for a few files;
      // the unedited original is still served without the suffix.
      if (status.startsWith('http-404') && /-e\d{6,}\./.test(url)) {
        const alt = url.replace(/-e\d{6,}\./, '.');
        const altStatus = await get(alt);
        if (altStatus === 'downloaded') {
          status = 'recovered';
          recoveredFrom = alt;
        }
      }
    } else if (/-e\d{6,}\./.test(url) && fs.existsSync(dest + '.recovered')) {
      status = 'recovered';
      recoveredFrom = fs.readFileSync(dest + '.recovered', 'utf8');
    }
    if (recoveredFrom) fs.writeFileSync(dest + '.recovered', recoveredFrom);
    const ok = fs.existsSync(dest);
    const buf = ok ? fs.readFileSync(dest) : null;
    results.push({
      url,
      file: ok ? file : null,
      status,
      recoveredFrom,
      bytes: buf ? buf.length : 0,
      sha1: buf ? crypto.createHash('sha1').update(buf).digest('hex') : null,
    });
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
results.sort((a, b) => a.url.localeCompare(b.url));
fs.writeFileSync(MANIFEST, JSON.stringify({ host: HOST, count: results.length, images: results }, null, 2));
const failed = results.filter((r) => !r.file);
const bytes = results.reduce((n, r) => n + r.bytes, 0);
const dupes = Object.values(results.reduce((m, r) => ((m[r.sha1] ||= []).push(r.url), m), {})).filter(
  (g) => g.length > 1 && g[0],
);
console.log(
  `unique urls=${results.length} ok=${results.length - failed.length} failed=${failed.length} total=${(bytes / 1e6).toFixed(1)}MB identical-content groups=${dupes.length}`,
);
for (const f of failed) console.log('FAILED', f.status, f.url);
