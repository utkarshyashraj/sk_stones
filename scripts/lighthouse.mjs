// Runs Lighthouse (mobile + desktop presets) against the local production preview and writes
// reports/lighthouse/<page>-<formFactor>.json plus reports/lighthouse/summary.json.
// Prereq: `npm run build && npm start` (serves out/ on :4321). Set CHROME_PATH to a Chromium-based browser.
// Usage: node scripts/lighthouse.mjs [/path ...]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'reports', 'lighthouse');
const BASE = process.env.LH_BASE ?? 'http://localhost:4321';
const ARGS = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const RUNS = Number((process.argv.find((a) => a.startsWith('--runs=')) ?? '--runs=1').split('=')[1]);
const PAGES = ARGS.length ? ARGS : ['/', '/kota-stones', '/tiles', '/products', '/contact', '/installations'];
const CATS = ['performance', 'accessibility', 'best-practices', 'seo'];
fs.mkdirSync(OUT, { recursive: true });

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const summary = [];
for (let run = 1; run <= RUNS; run++)
  for (const page of PAGES) {
    for (const formFactor of ['mobile', 'desktop']) {
      const name =
        (RUNS > 1 ? `run${run}-` : '') + `${page === '/' ? 'home' : page.replace(/\W+/g, '')}-${formFactor}`;
      const file = path.join(OUT, `${name}.json`);
      const args = [
        '-y',
        'lighthouse@13.6.0',
        `${BASE}${page}`,
        '--output=json',
        `--output-path=${file}`,
        `--only-categories=${CATS.join(',')}`,
        '--chrome-flags=--headless=new --no-first-run',
        '--quiet',
        ...(formFactor === 'desktop' ? ['--preset=desktop'] : []),
      ];
      execFileSync(npx, args, { stdio: 'inherit', shell: process.platform === 'win32' });
      const lhr = JSON.parse(fs.readFileSync(file, 'utf8'));
      const scores = Object.fromEntries(
        CATS.map((c) => [c, Math.round((lhr.categories[c]?.score ?? 0) * 100)]),
      );
      const metrics = {
        LCP: lhr.audits['largest-contentful-paint']?.displayValue,
        CLS: lhr.audits['cumulative-layout-shift']?.displayValue,
        TBT: lhr.audits['total-blocking-time']?.displayValue,
        FCP: lhr.audits['first-contentful-paint']?.displayValue,
      };
      const failing = Object.values(lhr.audits)
        .filter(
          (a) =>
            a.score !== null &&
            a.score < 0.9 &&
            a.scoreDisplayMode !== 'informative' &&
            a.scoreDisplayMode !== 'notApplicable' &&
            a.scoreDisplayMode !== 'manual',
        )
        .map((a) => a.id);
      summary.push({ run, page, formFactor, ...scores, ...metrics, failing });
      console.log(
        `${page.padEnd(16)} ${formFactor.padEnd(8)} P${scores.performance} A${scores.accessibility} BP${scores['best-practices']} SEO${scores.seo}  LCP ${metrics.LCP} CLS ${metrics.CLS} TBT ${metrics.TBT}`,
      );
    }
  }
// Median per page/form factor across runs (Lighthouse recommends medians: single runs are noisy).
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const medians = [];
for (const page of PAGES)
  for (const formFactor of ['mobile', 'desktop']) {
    const rs = summary.filter((r) => r.page === page && r.formFactor === formFactor);
    const m = Object.fromEntries(CATS.map((c) => [c, median(rs.map((r) => r[c]))]));
    medians.push({ page, formFactor, runs: rs.length, ...m });
    if (RUNS > 1)
      console.log(
        `MEDIAN ${page.padEnd(16)} ${formFactor.padEnd(8)} P${m.performance} A${m.accessibility} BP${m['best-practices']} SEO${m.seo}  (perf runs: ${rs.map((r) => r.performance).join('/')})`,
      );
  }
fs.writeFileSync(
  path.join(OUT, 'summary.json'),
  JSON.stringify(
    { base: BASE, ranAt: new Date().toISOString(), runs: RUNS, medians, results: summary },
    null,
    2,
  ),
);
