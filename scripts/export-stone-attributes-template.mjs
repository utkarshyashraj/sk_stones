// Writes docs/stone-attributes-template.csv: one row per stone (all 444), for the business to confirm or
// correct attributes. Values already confirmed (content/stone-attributes.json) are written as they are;
// current name/category guesses are prefilled and marked "(guess)" so nothing unconfirmed is imported.
// Usage: node scripts/export-stone-attributes-template.mjs
import fs from 'node:fs';
import path from 'node:path';
import { FIELDS, GUESS_MARK, LIST_SEP, toCsv } from './lib/stone-attributes.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/generated/catalog.json'), 'utf8'));
const confirmed =
  JSON.parse(fs.readFileSync(path.join(ROOT, 'content/stone-attributes.json'), 'utf8')).stones ?? {};
const projects = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/ref/projects.json'), 'utf8'));
const name = (slug) => catalog.categories.find((c) => c.slug === slug)?.name ?? slug;

const join = (v) => (Array.isArray(v) ? v.join(`${LIST_SEP} `) : (v ?? ''));
const guess = (v) => (v && String(v).length ? `${v} ${GUESS_MARK}` : '');

const header = ['id', 'name', 'collection', 'category', ...FIELDS.map((f) => f.column)];
const rows = [header];
for (const p of catalog.products) {
  const c = confirmed[p.id] ?? {};
  const cell = (key, fallback) => {
    if (c[key] != null) {
      const v =
        key === 'usedInProjects' ? c[key].map((id) => projects.find((x) => x.id === id)?.name ?? id) : c[key];
      return join(v);
    }
    return fallback ? guess(join(fallback)) : '';
  };
  rows.push([
    p.id,
    p.name,
    name(p.collection),
    name(p.category),
    cell('colourFamilies', p.sources.colours === 'guess' ? p.colours : null),
    cell('finishes', p.sources.finishes === 'guess' ? p.finishes : null),
    cell('applications', p.sources.applications === 'category' ? p.applications : null),
    cell('origin', p.sources.origin === 'category' ? p.origin : null),
    cell('thicknessesMm'),
    cell('formats'),
    cell('synonyms'),
    cell('usedInProjects'),
    cell('notes'),
  ]);
}
fs.writeFileSync(path.join(ROOT, 'docs/stone-attributes-template.csv'), toCsv(rows));
console.log(`docs/stone-attributes-template.csv: ${rows.length - 1} stones`);
