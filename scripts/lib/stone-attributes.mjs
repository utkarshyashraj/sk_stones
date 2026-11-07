// Stone attributes supplied by the business (content/stone-attributes.json): the allowed values, validation,
// how they merge with what the catalogue knows already, and per-field coverage. Shared by
// scripts/build-catalog.mjs, scripts/import-stone-attributes.mjs, the CSV template export and unit tests.
//
// Rule: only business-supplied values count as "confirmed". Name-based guesses (colour words, finish words)
// and category-level values are kept as fallbacks for search, but they never count towards coverage, and
// filters/guided steps only appear once a field's confirmed coverage reaches COVERAGE_THRESHOLD.

export const COVERAGE_THRESHOLD = 0.8;

/** Colour families the owner can choose from (one stone may have up to three). */
export const COLOUR_FAMILIES = [
  'White',
  'Beige',
  'Grey',
  'Black',
  'Brown',
  'Gold',
  'Yellow',
  'Green',
  'Blue',
  'Red',
  'Pink',
  'Multi',
];

/** Finishes the owner can choose from (one stone may be offered in several). */
export const FINISHES = [
  'Polished',
  'Honed',
  'Leather',
  'Flamed',
  'Brushed',
  'Sandblasted',
  'Tumbled',
  'Natural',
  'Unpolished',
  'Matt',
  'Glossy',
  'Textured',
  'Split face',
];

/** Every list/scalar field a stone record may carry, with the CSV column it maps to. */
export const FIELDS = [
  { key: 'colourFamilies', column: 'colour_families', kind: 'list' },
  { key: 'finishes', column: 'finishes', kind: 'list' },
  { key: 'applications', column: 'applications', kind: 'list' },
  { key: 'origin', column: 'origin', kind: 'text' },
  { key: 'thicknessesMm', column: 'thicknesses_mm', kind: 'numbers' },
  { key: 'formats', column: 'formats', kind: 'list' },
  { key: 'synonyms', column: 'synonyms', kind: 'list' },
  { key: 'usedInProjects', column: 'used_in_projects', kind: 'list' },
  { key: 'notes', column: 'notes', kind: 'text' },
];

/** Coverage keys reported in catalog metadata (notes are internal and not a feature). */
export const COVERAGE_FIELDS = [
  'colourFamilies',
  'finishes',
  'applications',
  'origin',
  'thicknessesMm',
  'formats',
  'synonyms',
  'usedInProjects',
];

// Name-guess words → colour family (only used as a fallback for search, never shown as fact).
const GUESS_COLOUR = { Multicolour: 'Multi', Silver: 'Grey', Purple: null };
export const guessToFamily = (c) => (c in GUESS_COLOUR ? GUESS_COLOUR[c] : c);

const lower = (s) => s.toLowerCase();
const canon = (allowed, v) => allowed.find((a) => lower(a) === lower(String(v).trim())) ?? null;

/**
 * Validate one stone's record. Returns { value, errors }: `value` holds the cleaned record (canonical
 * spellings, numbers parsed, empty fields dropped), `errors` the human-readable problems.
 * ctx: { applications: string[], projects: { id, name }[] }
 */
export function validateRecord(id, record, ctx) {
  const errors = [];
  const value = {};
  if (!record || typeof record !== 'object' || Array.isArray(record))
    return { value, errors: [`${id}: not an object`] };
  for (const key of Object.keys(record))
    if (!FIELDS.some((f) => f.key === key)) errors.push(`${id}: unknown field "${key}"`);
  const list = (key, allowed, label) => {
    const raw = record[key];
    if (raw == null || (Array.isArray(raw) && !raw.length)) return;
    const arr = Array.isArray(raw) ? raw : [raw];
    const out = [];
    for (const v of arr) {
      const c = allowed ? canon(allowed, v) : String(v).trim();
      if (!c) errors.push(`${id}: "${v}" is not an allowed ${label}`);
      else if (!out.includes(c)) out.push(c);
    }
    if (out.length) value[key] = out;
  };
  list('colourFamilies', COLOUR_FAMILIES, 'colour family');
  list('finishes', FINISHES, 'finish');
  list('applications', ctx.applications, 'application');
  list('formats', null, 'format');
  list('synonyms', null, 'synonym');
  if (Array.isArray(record.colourFamilies) && record.colourFamilies.length > 3)
    errors.push(`${id}: at most 3 colour families`);
  if (record.usedInProjects != null) {
    const out = [];
    for (const v of [].concat(record.usedInProjects)) {
      const p = ctx.projects.find((x) => x.id === v || lower(x.name) === lower(String(v).trim()));
      if (!p) errors.push(`${id}: "${v}" is not a project on /projects`);
      else if (!out.includes(p.id)) out.push(p.id);
    }
    if (out.length) value.usedInProjects = out;
  }
  if (record.thicknessesMm != null) {
    const out = [];
    for (const v of [].concat(record.thicknessesMm)) {
      const n = Number(String(v).replace(/mm$/i, '').trim());
      if (!Number.isFinite(n) || n <= 0 || n > 300) errors.push(`${id}: "${v}" is not a thickness in mm`);
      else if (!out.includes(n)) out.push(n);
    }
    if (out.length) value.thicknessesMm = out.sort((a, b) => a - b);
  }
  for (const key of ['origin', 'notes']) {
    const v = record[key];
    if (v == null || v === '') continue;
    if (typeof v !== 'string') errors.push(`${id}: ${key} must be text`);
    else if (v.trim()) value[key] = v.trim();
  }
  return { value, errors };
}

/**
 * Merge a product's catalogue values with the business record. Business values win; guesses and
 * category values remain as fallbacks, and `sources` says where each value came from.
 * base: { colours (name guesses), finish (name guess or null), applications (category), origin (category) }
 */
export function mergeAttributes(base, attrs = {}) {
  const guessColours = base.colours.map(guessToFamily).filter(Boolean);
  const colours = attrs.colourFamilies ?? [...new Set(guessColours)];
  const finishes = attrs.finishes ?? (base.finish ? [base.finish] : []);
  const applications = attrs.applications ?? base.applications ?? [];
  const origin = attrs.origin ?? base.origin ?? null;
  const src = (business, fallback, fallbackKind) => (business ? 'business' : fallback ? fallbackKind : null);
  return {
    colours,
    finishes,
    applications,
    origin,
    thicknessesMm: attrs.thicknessesMm ?? [],
    formats: attrs.formats ?? [],
    synonyms: attrs.synonyms ?? [],
    usedInProjects: attrs.usedInProjects ?? [],
    sources: {
      colours: src(attrs.colourFamilies, colours.length, 'guess'),
      finishes: src(attrs.finishes, finishes.length, 'guess'),
      applications: src(attrs.applications, applications.length, 'category'),
      origin: src(attrs.origin, origin, 'category'),
    },
  };
}

/** Share (0–1) of products whose business record has each field, plus the counts behind it. */
export function attributeCoverage(productIds, stones) {
  const total = productIds.length;
  const out = { threshold: COVERAGE_THRESHOLD, total, fields: {} };
  for (const key of COVERAGE_FIELDS) {
    const count = productIds.filter((id) => {
      const v = stones[id]?.[key];
      return Array.isArray(v) ? v.length > 0 : v != null && v !== '';
    }).length;
    out.fields[key] = { count, share: total ? Math.round((count / total) * 1000) / 1000 : 0 };
  }
  return out;
}

// ---------- CSV (RFC 4180, as Excel and Google Sheets write it) ----------
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  const s = text.replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"' && s[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(cell);
      cell = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += c;
  }
  if (cell !== '' || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((x) => x.trim() !== ''));
}

const csvCell = (v) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
export const toCsv = (rows) =>
  rows.map((r) => r.map((v) => csvCell(String(v ?? ''))).join(',')).join('\r\n') + '\r\n';

export const GUESS_MARK = '(guess)';
export const LIST_SEP = ';';

/**
 * Convert CSV rows (first row = header) into stone records. Cells ending in "(guess)" are prefilled
 * suggestions the owner did not confirm, so they are ignored. Unknown ids are reported.
 */
export function recordsFromCsv(rows, knownIds) {
  const [header, ...body] = rows;
  const col = (name) => header.findIndex((h) => h.trim().toLowerCase() === name);
  const idCol = col('id');
  const errors = [];
  if (idCol < 0) return { stones: {}, errors: ['CSV has no "id" column'], ignoredGuesses: 0 };
  const stones = {};
  let ignoredGuesses = 0;
  body.forEach((r, n) => {
    const id = (r[idCol] ?? '').trim();
    if (!id) return;
    if (!knownIds.has(id)) {
      errors.push(`row ${n + 2}: unknown stone id "${id}"`);
      return;
    }
    const rec = {};
    for (const f of FIELDS) {
      const i = col(f.column);
      if (i < 0) continue;
      const raw = (r[i] ?? '').trim();
      if (!raw) continue;
      if (raw.toLowerCase().endsWith(GUESS_MARK)) {
        ignoredGuesses++;
        continue;
      }
      rec[f.key] =
        f.kind === 'text'
          ? raw
          : raw
              .split(LIST_SEP)
              .map((x) => x.trim())
              .filter(Boolean);
    }
    if (Object.keys(rec).length) stones[id] = rec;
  });
  return { stones, errors, ignoredGuesses };
}
