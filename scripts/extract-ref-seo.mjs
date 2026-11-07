// Extracts each reference page's SEO tags (title, description, keywords, Open Graph, Twitter) into
// content/ref/seo.json, read by lib/ref-seo.ts. Values are the reference's own; nothing is invented.
// Usage: node scripts/extract-ref-seo.mjs
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const LEGACY = path.join(ROOT, 'legacy');
const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/\s+/g, ' ')
    .trim();

/** Every <meta> tag's attributes, in document order. Quotes may contain the other quote character. */
function metas(head) {
  return [...head.matchAll(/<meta\b([^>]*)>/gi)].map((m) =>
    Object.fromEntries(
      [...m[1].matchAll(/([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g)].map((a) => [
        a[1].toLowerCase(),
        a[3] ?? a[4],
      ]),
    ),
  );
}
const pick = (list, attr, name) => {
  const tag = list.find((t) => t[attr]?.toLowerCase() === name);
  return tag?.content ? decode(tag.content) : undefined;
};

const out = {};
for (const file of fs
  .readdirSync(LEGACY)
  .filter((f) => f.endsWith('.html'))
  .sort()) {
  const html = fs.readFileSync(path.join(LEGACY, file), 'utf8');
  const head = html.slice(0, html.indexOf('</head>'));
  const list = metas(head);
  const page = file.replace('.html', '');
  const ogImage = pick(list, 'property', 'og:image');
  out[page] = Object.fromEntries(
    Object.entries({
      title: decode((head.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || ''),
      description: pick(list, 'name', 'description'),
      keywords: pick(list, 'name', 'keywords'),
      ogTitle: pick(list, 'property', 'og:title'),
      ogDescription: pick(list, 'property', 'og:description'),
      // Reference og:images live under /images/…; mapped to the self-hosted copy by path.
      ogImage: ogImage ? ogImage.replace(/^https?:\/\/[^/]+\//, '') : undefined,
      twitterCard: pick(list, 'name', 'twitter:card'),
    }).filter(([, v]) => v),
  );
}
fs.mkdirSync(path.join(ROOT, 'content/ref'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'content/ref/seo.json'), JSON.stringify(out, null, 2) + '\n');
const missing = Object.entries(out)
  .filter(([, v]) => !v.description)
  .map(([k]) => k);
console.log(`pages=${Object.keys(out).length}`, 'missing description:', missing.join(' ') || 'none');
