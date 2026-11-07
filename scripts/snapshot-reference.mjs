// Snapshots the approved reference site (https://skstone.netlify.app/) into legacy/: every page reachable
// from the homepage plus the known unlinked ones, its CSS/JS, and every media file it serves itself.
// Media hotlinked from the WordPress staging host is fetched separately by download-legacy-images.mjs.
// Orphan pages the reference still serves but never links to (old case studies, marble sub-pages) are
// deliberately not snapshotted; their URLs redirect (scripts/postbuild.mjs).
// Usage: node scripts/snapshot-reference.mjs            (safe to re-run; overwrites changed files)
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'legacy');
const BASE = 'https://skstone.netlify.app/';
// Pages linked only from JS (mobile nav) or not at all, but part of the reference site.
const EXTRA = [
  'thank-you',
  'products',
  'marbles',
  'stone-art',
  'natural-stones',
  'engineered-surfaces',
  'tiles',
  'clay-products',
  'concrete-blocks',
].map((p) => `${p}.html`);

const seen = new Set();
const media = new Set();
const queue = ['index.html', ...EXTRA];
const save = (rel, buf) => {
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, buf);
};
// Netlify injects a hosting comment into every page; it is not part of the site.
const clean = (html) => html.replace(/<!-- This site is hosted on Netlify[\s\S]*?-->\s*/g, '');

const pages = [];
while (queue.length) {
  const rel = queue.shift();
  if (seen.has(rel)) continue;
  seen.add(rel);
  const res = await fetch(BASE + rel);
  if (!res.ok) {
    if (rel.endsWith('.html') && !rel.includes('/')) console.log('skip', res.status, rel);
    continue;
  }
  const text = rel.endsWith('.html') ? clean(await res.text()) : await res.text();
  save(rel, text);
  if (rel.endsWith('.html')) pages.push(rel);
  for (const m of text.matchAll(
    /(?:href|src|data-src|poster|srcset)=["']([^"']+)["']|url\(["']?([^"')]+)["']?\)|['"`](\/?images\/[^'"`\s]+)['"`]/g,
  )) {
    for (const part of (m[1] || m[2] || m[3]).split(',')) {
      const r = part.trim().split(/\s+/)[0];
      if (!r || /^(#|data:|mailto:|tel:|javascript:|https?:\/\/(?!skstone\.netlify\.app))/.test(r)) continue;
      if (r.includes('${') || r.includes('#')) continue; // template literals / in-page anchors in inline JS
      let abs;
      try {
        abs = new URL(r, BASE + rel);
      } catch {
        continue;
      }
      if (abs.host !== 'skstone.netlify.app') continue;
      const p = decodeURIComponent(abs.pathname.replace(/^\//, '')) || 'index.html';
      if (p.includes('#')) continue; // an encoded in-page anchor (%23…), not a file
      if (/\.(css|js)$/.test(p)) queue.push(p);
      else if (!path.extname(p)) {
        if (!p.includes('/')) queue.push(`${p}.html`);
      } else if (p.endsWith('.html')) {
        if (!p.includes('/')) queue.push(p);
      } else media.add(p);
    }
  }
}

let downloaded = 0;
let missing = 0;
for (const p of [...media].sort()) {
  const res = await fetch(BASE + encodeURI(p));
  if (!res.ok) {
    missing++;
    console.log('media missing', res.status, p);
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const dest = path.join(OUT, p);
  if (fs.existsSync(dest) && fs.readFileSync(dest).equals(buf)) continue;
  save(p, buf);
  downloaded++;
}
console.log(
  `pages=${pages.length} css/js=${seen.size - pages.length} media=${media.size} (new/changed ${downloaded}, missing ${missing})`,
);
