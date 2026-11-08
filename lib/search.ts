import type { IndexStone, SearchIndex } from './search-index';

/**
 * Site search over the static index: normalising, typo-tolerant matching, weighted ranking and grouping.
 * Pure functions, unit-tested (tests/unit/search.test.ts).
 *
 * Rules: every query word must match a word of the item. A word matches exactly (best), as a prefix
 * (while typing), or with typos: 1 edit for words of 4–7 letters, 2 for 8 or more. Stone fields are
 * weighted name ×3, collection and synonyms ×2, colours/finishes/applications/origin ×1.
 */

/** Known spelling variants, applied to queries and item text alike (the reference spells it "Quatrz"). */
const VARIANTS: Record<string, string> = {
  quatrz: 'quartz',
  gray: 'grey',
  color: 'colour',
  colors: 'colours',
};

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((w) => VARIANTS[w] ?? w)
    .join(' ');
}
export const tokenize = (s: string) =>
  (normalize(s.slice(0, 200)) || '').split(' ').filter(Boolean).slice(0, 8);

/** Optimal-string-alignment distance, giving up (returning max + 1) as soon as it must exceed `max`. */
export function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  if (a === b) return 0;
  const prev2: number[] = [];
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        v = Math.min(v, prev2[j - 2]! + 1);
      cur.push(v);
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev2.length = 0;
    prev2.push(...prev);
    prev = cur;
  }
  return prev[b.length]!;
}

export const allowedTypos = (len: number) => (len >= 8 ? 2 : len >= 4 ? 1 : 0);

/** How well one query word matches one item word: 1 exact, 0.85 prefix, 0.6 within typo allowance, else 0. */
export function wordScore(q: string, w: string): number {
  if (q === w) return 1;
  if (q.length >= 2 && w.startsWith(q)) return 0.85;
  const max = allowedTypos(q.length);
  if (!max) return 0;
  if (editDistance(q, w, max) <= max) return 0.6;
  // a typo while still typing: compare with the start of a longer word ("travertn" ~ "travertine")
  if (w.length > q.length && editDistance(q, w.slice(0, q.length), max) <= max) return 0.5;
  return 0;
}

interface Field {
  words: string[];
  weight: number;
}
/** Every query word must match some field word; returns the weighted score, or 0 when any word misses. */
export function scoreFields(tokens: string[], fields: Field[]): number {
  if (!tokens.length) return 0;
  let total = 0;
  for (const t of tokens) {
    let best = 0;
    for (const f of fields) for (const w of f.words) best = Math.max(best, wordScore(t, w) * f.weight);
    if (!best) return 0;
    total += best;
  }
  return total;
}

const words = (...parts: (string | null | undefined)[]) =>
  normalize(parts.filter(Boolean).join(' ')).split(' ').filter(Boolean);

const stoneFieldCache = new WeakMap<IndexStone, Field[]>();
export function stoneFields(s: IndexStone, collectionName: string): Field[] {
  let f = stoneFieldCache.get(s);
  if (!f) {
    f = [
      { words: words(s.n), weight: 3 },
      { words: words(collectionName, ...s.syn), weight: 2 },
      { words: words(...s.col, ...s.fin, ...s.app, s.o), weight: 1 },
    ];
    stoneFieldCache.set(s, f);
  }
  return f;
}

export interface Hit<T> {
  item: T;
  score: number;
}
export interface SearchResults {
  stones: Hit<IndexStone>[];
  collections: Hit<SearchIndex['collections'][number]>[];
  services: Hit<SearchIndex['services'][number]>[];
  applications: Hit<SearchIndex['applications'][number]>[];
  projects: Hit<SearchIndex['projects'][number]>[];
  total: number;
}

const rank = <T>(hits: Hit<T>[]) => hits.filter((h) => h.score > 0).sort((a, b) => b.score - a.score);

/** Search everything; a whole-name prefix match gets a small boost so "tan br" puts Tan Brown first. */
export function search(index: SearchIndex, query: string): SearchResults {
  const tokens = tokenize(query);
  const q = tokens.join(' ');
  const names = new Map(index.collections.map((c) => [c.s, c.n]));
  const empty: SearchResults = {
    stones: [],
    collections: [],
    services: [],
    applications: [],
    projects: [],
    total: 0,
  };
  if (!tokens.length) return empty;
  const stones = rank(
    index.stones.map((s) => {
      const base = scoreFields(tokens, stoneFields(s, names.get(s.c) ?? ''));
      return { item: s, score: base && normalize(s.n).startsWith(q) ? base + 0.5 : base };
    }),
  );
  const simple = <T>(items: T[], text: (t: T) => string) =>
    rank(
      items.map((item) => ({ item, score: scoreFields(tokens, [{ words: words(text(item)), weight: 3 }]) })),
    );
  const collections = simple(index.collections, (c) => c.n);
  const services = simple(index.services, (s) => s.n);
  const applications = simple(index.applications, (a) => a.v);
  const projects = simple(index.projects, (p) => p.n);
  return {
    stones,
    collections,
    services,
    applications,
    projects,
    total: stones.length + collections.length + services.length + applications.length + projects.length,
  };
}

/** For "no results": the collection whose name is closest to the query (by edit distance per word). */
export function closestCollection(index: SearchIndex, query: string) {
  const tokens = tokenize(query);
  if (!tokens.length) return null;
  let best: { c: SearchIndex['collections'][number]; d: number } | null = null;
  for (const c of index.collections) {
    const cw = words(c.n);
    const d = tokens.reduce(
      (sum, t) => sum + Math.min(...cw.map((w) => editDistance(t, w.slice(0, Math.max(t.length, 3)), 6))),
      0,
    );
    if (!best || d < best.d) best = { c, d };
  }
  return best && best.d <= tokens.length * 4 ? best.c : null;
}
