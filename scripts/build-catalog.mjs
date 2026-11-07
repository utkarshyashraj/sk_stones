// Builds the centralized product database from the legacy extraction + curated taxonomy + corrections.
// Inputs:  content/raw/legacy-catalog.json, content/raw/image-manifest.json,
//          content/categories.json, content/catalog-corrections.json, content/site-images.json
// Outputs: content/generated/catalog.json  (categories + products used by the app)
//          content/generated/image-jobs.json (source file -> optimized output key, consumed by optimize-images)
// Usage: node scripts/build-catalog.mjs
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const legacy = read('content/raw/legacy-catalog.json');
const manifest = read('content/raw/image-manifest.json').images;
const { categories, applicationVocabulary, retiredLegacyPages } = read('content/categories.json');
const corrections = read('content/catalog-corrections.json');
const siteImages = read('content/site-images.json');

const byUrl = new Map(manifest.map((m) => [m.url, m]));
const legacyPage = (slug) => legacy.find((p) => p.slug === slug);
const fail = (msg) => {
  console.error('ERROR:', msg);
  process.exitCode = 1;
};

export const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// ---------- name normalisation ----------
const ACRONYMS = new Set(['CNC', 'MOP', 'BBC', 'SK', 'AGL', 'TV', 'WC', 'R', 'D']);
const SMALL = new Set(['in', 'on', 'with', 'to', 'of', 'and', 'a']);
function titleCase(name) {
  return name
    .split(/(\s+|-)/)
    .map((w, i) => {
      if (/^\s+$|^-$/.test(w) || !w) return w;
      const upper = w.toUpperCase();
      if (ACRONYMS.has(upper) && (w === upper || upper === 'TV' || upper === 'SK')) return upper;
      if (/^\d+X\d+$/i.test(w)) return w.toUpperCase();
      const lower = w.toLowerCase();
      if (i > 0 && SMALL.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}
function normaliseName(raw) {
  let n = raw.replace(/\s+/g, ' ').trim();
  for (const [from, to] of Object.entries(corrections.nameFixes)) {
    if (from.startsWith('$')) continue;
    n = n.replace(new RegExp(from, 'gi'), to);
  }
  return titleCase(n.replace(/\s+/g, ' ').trim());
}

// ---------- attribute derivation (strictly from the product name / category copy) ----------
const COLOURS = [
  ['White', /\b(white|bianco|blanco|polar|arctic|ivory|alpine|snow)\b/i],
  ['Black', /\b(black|nero|jet|onyx black|absolute black|anthracite|charcoal|graphite)\b/i],
  ['Grey', /\b(gr[ae]y|grigio|gris|greige|silver grey|smoke|ash|slate)\b/i],
  ['Green', /\b(green|verde|emerald|pista|sage)\b/i],
  ['Red', /\b(red|rosso|rojo|burgundy|ruby)\b/i],
  ['Yellow', /\b(yellow)\b/i],
  ['Gold', /\b(gold|golden|oro)\b/i],
  ['Brown', /\b(brown|chocolate|coffee|caramel|tan|teak|cappuccino|cinnamon|walnut)\b/i],
  ['Blue', /\b(blue|aqua|ocean|azul)\b/i],
  ['Beige', /\b(beige|cream|crema|sand|almond|taupe|marfil)\b/i],
  ['Pink', /\b(pink|rose|peach)\b/i],
  ['Silver', /\b(silver)\b/i],
  ['Purple', /\b(purple)\b/i],
  ['Multicolour', /\b(multi|multicolou?r|rainbow|mix|mixed)\b/i],
];
const FINISHES = [
  ['Unpolished', /\bunpolished\b/i],
  ['Polished', /\b(?<!un)polish(ed)?\b/i],
  ['Leather', /\bleather(ed)?\b/i],
  ['Honed', /\bhoned\b/i],
  ['Flamed', /\bflamed\b/i],
  ['Tumbled', /\btumbled\b/i],
  ['Natural', /\bnatural finish\b/i],
  ['Matte', /\bmatte?\b/i],
  ['Glossy', /\bgloss(y)?\b/i],
  ['Textured', /\btextured\b/i],
];
const TAGS = [
  'Onyx',
  'Travertine',
  'Quartzite',
  'Statuario',
  'Calacatta',
  'Granite',
  'Marble',
  'Basalt',
  'Terrazzo',
  'Inlay',
  'Brass',
  'Slate',
  'Sandstone',
  'Book Match',
];

function deriveAttributes(name) {
  const colours = COLOURS.filter(([, re]) => re.test(name)).map(([c]) => c);
  const finish = FINISHES.find(([, re]) => re.test(name))?.[0] ?? null;
  const size = name.match(/\b(\d+)\s*[xX×]\s*(\d+)\b/);
  const tags = TAGS.filter((t) => new RegExp(`\\b${t.replace(' ', '\\s*')}`, 'i').test(name));
  return { colours, finish, size: size ? `${size[1]}×${size[2]}` : null, tags };
}

// ---------- image jobs ----------
const jobs = new Map(); // key -> { key, kind, source, recoveredFrom }
function addJob(key, url, kind) {
  if (!/^https?:/.test(url)) {
    // Served by the reference site itself; snapshotted into legacy/ by snapshot-reference.mjs.
    const source = `legacy/${decodeURIComponent(url.replace(/^\//, '').replace(/[?#].*$/, ''))}`;
    if (!fs.existsSync(path.join(ROOT, source))) {
      fail(`reference image missing on disk: ${source}`);
      return null;
    }
    jobs.set(key, { key, kind, source, url, recoveredFrom: null });
    return key;
  }
  const m = byUrl.get(url);
  if (!m || !m.file) {
    fail(`no downloaded file for ${url}`);
    return null;
  }
  jobs.set(key, {
    key,
    kind,
    source: `.cache/legacy-src/${m.file}`,
    url,
    recoveredFrom: m.recoveredFrom ?? null,
  });
  return key;
}

// ---------- categories ----------
const catBySlug = new Map(categories.map((c) => [c.slug, c]));
for (const c of categories) {
  if (c.parent && !catBySlug.has(c.parent)) fail(`category ${c.slug} has unknown parent ${c.parent}`);
  for (const a of c.applications ?? [])
    if (!applicationVocabulary.includes(a)) fail(`unknown application ${a} in ${c.slug}`);
}
const topOf = (slug) => {
  let c = catBySlug.get(slug);
  while (c.parent) c = catBySlug.get(c.parent);
  return c.slug;
};

// ---------- products ----------
const products = [];
const ids = new Set();
const usedImageUrls = new Set();
const notProductImages = {};

function pushProduct(cat, name, imageUrl, legacyName, legacyIndex, sourcePage) {
  const attrs = deriveAttributes(name);
  let base = `${cat.slug}-${slugify(name)}`;
  let id = base;
  for (let n = 2; ids.has(id); n++) id = `${base}-${n}`;
  ids.add(id);
  const imageKey = imageUrl ? addJob(`catalog/${id}`, imageUrl, 'catalog') : null;
  if (imageUrl) usedImageUrls.add(imageUrl);
  products.push({
    id,
    name,
    category: topOf(cat.slug),
    subcategory: cat.parent ? cat.slug : null,
    collection: cat.slug,
    image: imageKey,
    colours: attrs.colours,
    finish: attrs.finish,
    applications: cat.applications ?? [],
    origin: cat.origin ?? null,
    size: attrs.size,
    tags: attrs.tags,
    legacy: { page: sourcePage, index: legacyIndex, name: legacyName },
  });
}

// Every reference page lists its own products, in reference order. A photo that appears on several
// pages (a collection and its hub) is one product, owned by the first page that lists it (collections
// are processed before hubs); hub-only photos become products of the hub.
const PAGE_KINDS = new Set(['collection', 'hub']);
const byImage = new Map(); // image url -> product id
const pageProducts = {}; // category slug -> product ids in reference order
const ordered = [
  ...categories.filter((c) => c.kind === 'collection'),
  ...categories.filter((c) => c.kind === 'hub'),
];
for (const cat of ordered) {
  if (!cat.legacySource) continue;
  const page = legacyPage(cat.legacySource);
  if (!page) {
    fail(`reference page missing for ${cat.slug}`);
    continue;
  }
  const fix = corrections.relabel[cat.slug];
  const list = (pageProducts[cat.slug] = []);
  page.items.forEach((it, idx) => {
    const file = decodeURIComponent(it.image.split('/').pop());
    if (fix?.notProducts) {
      const np = Object.keys(fix.notProducts).find((k) => file.includes(k));
      if (np) {
        notProductImages[cat.slug] = it.image;
        return;
      }
    }
    if (byImage.has(it.image)) {
      if (!list.includes(byImage.get(it.image))) list.push(byImage.get(it.image));
      return;
    }
    let name = it.name;
    const k = fix?.byImage && Object.keys(fix.byImage).find((key) => file.includes(key));
    if (k) name = fix.byImage[k]; // verified correction; otherwise the reference label stands
    pushProduct(cat, normaliseName(name), it.image, it.name, idx, cat.legacySource);
    const id = products.at(-1).id;
    byImage.set(it.image, id);
    list.push(id);
  });
  for (const add of fix?.addWithoutImage ?? []) {
    pushProduct(cat, normaliseName(add.name), null, null, null, cat.legacySource);
    list.push(products.at(-1).id);
  }
}

// ---------- category records for the app ----------
const descendants = (slug) => {
  const kids = categories.filter((c) => c.parent === slug).map((c) => c.slug);
  return [slug, ...kids.flatMap(descendants)];
};
const outCategories = categories.map((c, order) => {
  const page = c.legacySource ? legacyPage(c.legacySource) : null;
  const scope = new Set(descendants(c.slug));
  const inScope = products.filter((p) => scope.has(p.collection));
  // overview copy + image from legacy page (only leaf pages had one)
  let overview = null;
  if (page?.overview?.html) {
    const html = page.overview.html;
    const paragraphs = [...html.matchAll(/<p>([\s\S]*?)<\/p>/g)]
      .map((m) =>
        m[1]
          .replace(/<[^>]*>/g, '')
          .replace(/\s+/g, ' ')
          .trim(),
      )
      .filter(Boolean);
    const bullets = [...html.matchAll(/<li>([\s\S]*?)<\/li>/g)]
      .map((m) =>
        m[1]
          .replace(/<[^>]*>/g, '')
          .replace(/\s+/g, ' ')
          .trim(),
      )
      .filter(Boolean);
    const image = page.overview.image
      ? addJob(`categories/${c.slug}-overview`, page.overview.image, 'site')
      : null;
    // `html`: the reference overview markup verbatim (only <p>, <ul>, <li>, <strong>, <br> occur).
    overview = { paragraphs, bullets, image, html };
  }
  // card image: explicit legacy hub image > lifestyle image > first product photo
  let cardImage = null;
  if (c.cardImageUrl) cardImage = addJob(`categories/${c.slug}`, c.cardImageUrl, 'site');
  else if (notProductImages[c.slug])
    cardImage = addJob(`categories/${c.slug}`, notProductImages[c.slug], 'site');
  else if (overview?.image) cardImage = overview.image;
  else {
    const first = inScope.find((p) => p.image);
    cardImage = first ? first.image : null;
  }
  const rest = { ...c };
  delete rest.legacySource;
  delete rest.cardImageUrl;
  delete rest.sourceNote;
  const legacySource = c.legacySource;
  const ids = pageProducts[c.slug] ?? [];
  return {
    ...rest,
    order,
    legacySource,
    overview,
    cardImage,
    hasPage: PAGE_KINDS.has(c.kind) && Boolean(page),
    // Reference page copy, verbatim (title, meta, hero, grid heading).
    refPage: page
      ? {
          title: page.title,
          metaDescription: page.metaDescription,
          hero: page.hero,
          gridTitle: page.gridTitle,
          countLabel: page.countLabel,
        }
      : null,
    productIds: ids,
    productCount: ids.length,
    children: categories.filter((k) => k.parent === c.slug).map((k) => k.slug),
  };
});

// ---------- site (non-catalog) images ----------
for (const [key, src] of Object.entries(siteImages.images)) {
  if (src.startsWith('http')) addJob(`site/${key}`, src, 'site');
  else {
    const abs = path.join(ROOT, src);
    if (!fs.existsSync(abs)) fail(`site image missing: ${src}`);
    jobs.set(`site/${key}`, {
      key: `site/${key}`,
      kind: 'site',
      source: src,
      url: null,
      recoveredFrom: null,
    });
  }
}

// ---------- checks ----------
const pageImages = new Set(
  categories
    .filter((c) => PAGE_KINDS.has(c.kind) && c.legacySource)
    .flatMap((c) => legacyPage(c.legacySource)?.items.map((i) => i.image) ?? []),
);
const unaccounted = [...pageImages].filter(
  (u) => !usedImageUrls.has(u) && !Object.values(notProductImages).includes(u),
);
if (unaccounted.length)
  fail(
    `reference product images not mapped to any product: ${unaccounted.length}\n${unaccounted.join('\n')}`,
  );

// ---------- overview pages that list collection cards (Marbles hub, Products) ----------
const cardPages = {};
for (const page of legacy.filter((p) => p.categoryCards?.length)) {
  cardPages[page.slug] = {
    title: page.title,
    metaDescription: page.metaDescription,
    hero: page.hero,
    gridTitle: page.gridTitle,
    countLabel: page.countLabel,
    cards: page.categoryCards.map((card, i) => ({
      name: card.name,
      description: card.description,
      href: card.href,
      image: addJob(`cards/${page.slug}-${i + 1}`, card.image, 'site'),
    })),
  };
}

const generated = {
  $comment: 'GENERATED by scripts/build-catalog.mjs — do not edit by hand.',
  applicationVocabulary,
  retiredLegacyPages,
  categories: outCategories,
  products,
  cardPages,
};
fs.mkdirSync(path.join(ROOT, 'content', 'generated'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'content/generated/catalog.json'), JSON.stringify(generated, null, 1));
fs.writeFileSync(
  path.join(ROOT, 'content/generated/image-jobs.json'),
  JSON.stringify([...jobs.values()], null, 1),
);

const withImg = products.filter((p) => p.image).length;
console.log(
  `categories=${outCategories.length} products=${products.length} (with image ${withImg}, without ${products.length - withImg}) image jobs=${jobs.size} reference product photos accounted=${pageImages.size - unaccounted.length}/${pageImages.size}`,
);
