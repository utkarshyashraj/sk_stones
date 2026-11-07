// One-time extractor: reads the legacy static catalog pages and writes a raw JSON dump.
// Usage: node scripts/extract-legacy.mjs
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const LEGACY = path.join(ROOT, 'legacy');
const OUT = path.join(ROOT, 'content', 'raw');

const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
const text = (html) =>
  decode(html.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
const pick = (re, s) => (s.match(re) || [])[1];

const pages = [];
for (const file of fs
  .readdirSync(LEGACY)
  .filter((f) => f.endsWith('.html'))
  .sort()) {
  const html = fs.readFileSync(path.join(LEGACY, file), 'utf8');
  // Product pages (a product grid) and overview pages that list collection cards (Marbles, Products).
  if (!html.includes('class="product-grid"') && !html.includes('class="category-card"')) continue;
  const slug = file.replace(/\.html$/, '');
  const hero = (html.match(/<section class="page-hero[\s\S]*?<\/section>/) || [''])[0];
  const overview = (html.match(/<section class="product-overview-section">[\s\S]*?<\/section>/) || [''])[0];
  const items = [
    ...html.matchAll(
      /<div class="product-item">\s*<div class="product-item-image">\s*<img src="([^"]+)" alt="([^"]*)"[^>]*>\s*<\/div>\s*<div class="product-item-info">\s*<h4>([^<]*)<\/h4>/g,
    ),
  ].map((m) => ({ image: m[1], alt: decode(m[2]), name: decode(m[3]).trim() }));
  const itemCount = (html.match(/class="product-item"/g) || []).length;
  const categoryCards = [
    ...html.matchAll(
      /<div class="category-card">[\s\S]*?<img src="([^"]+)" alt="([^"]*)"[\s\S]*?<h3>([\s\S]*?)<\/h3>\s*(?:<p>([\s\S]*?)<\/p>)?[\s\S]*?class='category-link' href='([^']+)'/g,
    ),
  ].map((m) => ({ image: m[1], name: text(m[3]), description: text(m[4] || ''), href: m[5] }));
  pages.push({
    slug,
    title: decode(pick(/<title>([^<]*)<\/title>/, html) || ''),
    metaDescription: decode(pick(/<meta name="description" content="([^"]*)"/, html) || ''),
    hero: {
      tagline: text(pick(/<p class="page-hero-tagline">([\s\S]*?)<\/p>/, hero) || ''),
      h1: text(pick(/<h1[^>]*>([\s\S]*?)<\/h1>/, hero) || ''),
      h1Html: (pick(/<h1[^>]*>([\s\S]*?)<\/h1>/, hero) || '').trim(),
      description: text(pick(/<p class="page-hero-description">([\s\S]*?)<\/p>/, hero) || ''),
    },
    overview: overview
      ? {
          image: pick(/<img src="([^"]+)"/, overview) || null,
          html: (pick(/<div class="product-overview-text">([\s\S]*?)<\/div>/, overview) || '').trim(),
        }
      : null,
    gridTitle: text(pick(/<div class="product-grid-header">\s*<h2>([\s\S]*?)<\/h2>/, html) || ''),
    countLabel: text(pick(/<p class="product-count">([\s\S]*?)<\/p>/, html) || ''),
    itemCount,
    items,
    categoryCards,
  });
}

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'legacy-catalog.json'), JSON.stringify(pages, null, 2));
const parsed = pages.reduce((n, p) => n + p.items.length, 0);
const declared = pages.reduce((n, p) => n + p.itemCount, 0);
const urls = new Set(
  pages.flatMap((p) => [...p.items.map((i) => i.image), p.overview?.image].filter(Boolean)),
);
console.log(
  `pages=${pages.length} items parsed=${parsed} declared=${declared} unique image urls=${urls.size}`,
);
for (const p of pages)
  if (p.items.length !== p.itemCount) console.log('MISMATCH', p.slug, p.items.length, p.itemCount);
