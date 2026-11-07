// Converts a filled-in stone attributes sheet (CSV saved from Excel or Google Sheets, same columns as
// docs/stone-attributes-template.csv) into content/stone-attributes.json. Every value is checked against the
// allowed lists; cells still ending in "(guess)" were not confirmed and are skipped. Nothing is written when
// any row has an error. Then run `npm run catalog:build` to publish the attributes.
// Usage: node scripts/import-stone-attributes.mjs <file.csv> [--dry-run]
import fs from 'node:fs';
import path from 'node:path';
import { attributeCoverage, parseCsv, recordsFromCsv, validateRecord } from './lib/stone-attributes.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const [file, flag] = process.argv.slice(2);
if (!file) {
  console.error('Usage: node scripts/import-stone-attributes.mjs <file.csv> [--dry-run]');
  process.exit(1);
}
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/generated/catalog.json'), 'utf8'));
const { applicationVocabulary } = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'content/categories.json'), 'utf8'),
);
const projects = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/ref/projects.json'), 'utf8'));
const ids = catalog.products.map((p) => p.id);

const { stones, errors, ignoredGuesses } = recordsFromCsv(
  parseCsv(fs.readFileSync(file, 'utf8')),
  new Set(ids),
);
const clean = {};
for (const [id, rec] of Object.entries(stones)) {
  const { value, errors: e } = validateRecord(id, rec, { applications: applicationVocabulary, projects });
  errors.push(...e);
  if (Object.keys(value).length) clean[id] = value;
}
if (errors.length) {
  console.error(`${errors.length} problem(s) — nothing written:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
const cov = attributeCoverage(ids, clean);
console.log(
  `${Object.keys(clean).length} stones with confirmed values; ${ignoredGuesses} unconfirmed "(guess)" cells skipped.`,
);
for (const [k, v] of Object.entries(cov.fields))
  console.log(
    `  ${k.padEnd(15)} ${String(v.count).padStart(3)} / ${cov.total}  (${Math.round(v.share * 100)}%)${v.share >= cov.threshold ? '  → feature unlocks' : ''}`,
  );
if (flag === '--dry-run') process.exit(0);
const target = path.join(ROOT, 'content/stone-attributes.json');
const current = JSON.parse(fs.readFileSync(target, 'utf8'));
fs.writeFileSync(target, JSON.stringify({ $comment: current.$comment, stones: clean }, null, 2) + '\n');
console.log('Wrote content/stone-attributes.json — now run: npm run catalog:build');
