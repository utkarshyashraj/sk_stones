// Post-build verification of the static export (out/). Fails (exit 1) on any production-readiness problem.
// Checks: every sitemap route exists; every internal link/asset resolves; unique titles + descriptions;
// canonical + OG tags; exactly one <h1>; img alt + dimensions; valid JSON-LD; noindex only where intended;
// no references to the old staging host; legacy redirects point at real pages.
// Usage: node scripts/verify-build.mjs
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'out');
const SITE = 'https://skstonesindia.com';
const NOINDEX = new Set(['/thank-you', '/search', '/saved', '/404', '/_not-found']);
const PRODUCT_ROUTES = new Set(
  JSON.parse(fs.readFileSync(path.join(ROOT, 'content/generated/catalog.json'), 'utf8'))
    .categories.filter((c) => c.hasPage)
    .map((c) => `/${c.slug}`),
);
const problems = [];
const warn = (m) => problems.push(m);

const htmlFiles = fs
  .readdirSync(OUT)
  .filter((f) => f.endsWith('.html'))
  .map((f) => f.replace(/\.html$/, ''));
const routeOf = (name) => (name === 'index' ? '/' : `/${name}`);
const fileFor = (urlPath) => {
  const clean = decodeURIComponent(urlPath.split('#')[0].split('?')[0]);
  if (clean === '/' || clean === '') return path.join(OUT, 'index.html');
  const p = path.join(OUT, clean);
  if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  if (fs.existsSync(`${p}.html`)) return `${p}.html`;
  return null;
};

// ---- sitemap ----
const sitemap = fs.readFileSync(path.join(OUT, 'sitemap.xml'), 'utf8');
const sitemapRoutes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, '') || '/');
if (new Set(sitemapRoutes).size !== sitemapRoutes.length) warn('sitemap has duplicate URLs');
for (const r of sitemapRoutes) {
  if (r.endsWith('.html') || r === '/index') warn(`sitemap contains non-pretty URL ${r}`);
  if (!fileFor(r)) warn(`sitemap route has no page: ${r}`);
}
const robots = fs.readFileSync(path.join(OUT, 'robots.txt'), 'utf8');
if (/Disallow:\s*\/\s*$/m.test(robots)) warn('robots.txt blocks the whole site');
if (!robots.includes(`${SITE}/sitemap.xml`)) warn('robots.txt missing sitemap');

// ---- pages ----
const titles = new Map();
const descriptions = new Map();
let links = 0;
let images = 0;
let jsonLdBlocks = 0;
for (const name of htmlFiles) {
  const route = routeOf(name);
  const html = fs.readFileSync(path.join(OUT, `${name}.html`), 'utf8');
  const isUtility = NOINDEX.has(route);
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  const robotsMeta = (html.match(/<meta name="robots" content="([^"]*)"/) || [])[1] ?? '';
  if (!title) warn(`${route}: missing <title>`);
  if (!isUtility) {
    if (!desc) warn(`${route}: missing meta description`);
    if (title) titles.set(title, [...(titles.get(title) ?? []), route]);
    if (desc) descriptions.set(desc, [...(descriptions.get(desc) ?? []), route]);
    const canonical = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
    if (canonical !== `${SITE}${route === '/' ? '' : route}` && canonical !== `${SITE}${route}`)
      warn(`${route}: canonical is ${canonical}`);
    if (!html.includes('property="og:title"') || !html.includes('property="og:image"'))
      warn(`${route}: missing Open Graph tags`);
    if (robotsMeta.includes('noindex')) warn(`${route}: unexpectedly noindex`);
    if (!sitemapRoutes.includes(route)) warn(`${route}: indexable page missing from sitemap`);
  } else if (!robotsMeta.includes('noindex') && route !== '/_not-found' && route !== '/404')
    warn(`${route}: utility page should be noindex`);

  // The homepage's phone "More" view has its own heading, shown only when the hero (and its h1) is hidden.
  const h1s = (html.replace(/<div class="mobile-more-intro[\s\S]*?<\/div>/, '').match(/<h1[\s>]/g) || [])
    .length;
  if (h1s !== 1) warn(`${route}: ${h1s} <h1> elements`);
  if (html.includes('hostingersite.com')) warn(`${route}: references staging host`);
  if (/href="#"/.test(html)) warn(`${route}: contains href="#"`);

  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    jsonLdBlocks++;
    try {
      const data = JSON.parse(m[1]);
      if (!data['@context'] || !data['@type']) warn(`${route}: JSON-LD without @context/@type`);
    } catch {
      warn(`${route}: invalid JSON-LD`);
    }
  }
  // LocalBusiness on the homepage and contact page; BreadcrumbList on every product page.
  const wantsBusiness = route === '/' || route === '/contact';
  if (wantsBusiness !== html.includes('"LocalBusiness"'))
    warn(`${route}: LocalBusiness JSON-LD ${wantsBusiness ? 'missing' : 'not expected here'}`);
  if (PRODUCT_ROUTES.has(route) && !html.includes('"BreadcrumbList"'))
    warn(`${route}: BreadcrumbList JSON-LD missing`);

  for (const m of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    const href = m[1].replace(/&amp;/g, '&');
    if (/^(https?:|mailto:|tel:|#)/.test(href)) continue;
    links++;
    if (!fileFor(href)) warn(`${route}: broken link ${href}`);
  }
  for (const m of html.matchAll(/<img\b([^>]*)>/g)) {
    images++;
    const attrs = m[1];
    const src = (attrs.match(/\ssrc="([^"]+)"/) || [])[1];
    if (!/\salt="/.test(attrs)) warn(`${route}: <img> without alt (${src})`);
    const fill = /\sdata-nimg="fill"/.test(attrs); // next/image fill: sized by its positioned container
    if (!fill && (!/\swidth="\d+"/.test(attrs) || !/\sheight="\d+"/.test(attrs)))
      warn(`${route}: <img> without width/height (${src})`);
    if (src && !src.startsWith('http') && !fileFor(src)) warn(`${route}: missing image ${src}`);
  }
  for (const m of html.matchAll(/srcSet="([^"]+)"/g)) {
    for (const part of m[1].split(',')) {
      const u = part.trim().split(' ')[0];
      if (u && !fileFor(u)) warn(`${route}: missing srcset image ${u}`);
    }
  }
}
for (const [t, rs] of titles) if (rs.length > 1) warn(`duplicate <title> "${t}" on ${rs.join(', ')}`);
for (const [d, rs] of descriptions)
  if (rs.length > 1) warn(`duplicate description on ${rs.join(', ')}: "${d.slice(0, 60)}…"`);

// ---- redirects ----
const redirects = fs.existsSync(path.join(OUT, '_redirects'))
  ? fs.readFileSync(path.join(OUT, '_redirects'), 'utf8')
  : '';
let redirectCount = 0;
for (const line of redirects.split('\n')) {
  const m = line.match(/^(\S+)\s+(\S+)\s+301/);
  if (!m) continue;
  redirectCount++;
  if (!fileFor(m[2])) warn(`redirect ${m[1]} -> ${m[2]} targets a missing page`);
}

// ---- catalogue images: every product's renditions exist in the export ----
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/generated/catalog.json'), 'utf8'));
const imageMeta = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/generated/images.json'), 'utf8'));
for (const p of catalog.products) {
  const meta = p.image && (imageMeta.images ?? imageMeta)[p.image];
  if (!meta) {
    warn(`product without image metadata: ${p.id}`);
    continue;
  }
  for (const w of meta.widths)
    if (!fs.existsSync(path.join(OUT, 'images', `${p.image}-${w}.webp`)))
      warn(`catalog image missing: ${p.image}-${w}`);
}

console.log(
  `verify-build: ${htmlFiles.length} pages, ${sitemapRoutes.length} sitemap URLs, ${links} internal links, ${images} <img>, ${jsonLdBlocks} JSON-LD blocks, ${redirectCount} redirects, ${catalog.products.length} catalogue products`,
);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n- ${[...new Set(problems)].join('\n- ')}`);
  process.exit(1);
}
console.log('verify-build: OK — no problems found');
