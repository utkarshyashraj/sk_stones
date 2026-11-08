/**
 * Filters for product grids and search results: data-driven facets, live counts, sorting and URL state.
 * Pure functions, unit-tested (tests/unit/filters.test.ts).
 *
 * A facet is offered only when (a) its field's business-confirmed coverage has reached the threshold
 * (80%; collection needs none), and (b) the stones on the page carry at least two different values for it.
 * Today that leaves the search-within box and, on hub/search pages, Collection.
 */
import { normalize } from './search';

export interface FilterStone {
  id: string;
  name: string;
  /** collection slug and display name */
  c: string;
  cn: string;
  colours: string[];
  finishes: string[];
  applications: string[];
  origin: string | null;
  thicknessesMm: number[];
  formats: string[];
  /** position in the reference order */
  order: number;
}

export type FacetKey = 'collection' | 'colour' | 'finish' | 'application' | 'origin' | 'thickness' | 'format';
export interface FacetDef {
  key: FacetKey;
  label: string;
  /** coverage field that unlocks it (null: always available) */
  coverage: string | null;
  values: (s: FilterStone) => string[];
  /** label for a value (collection slugs show their names) */
  display?: (v: string, stones: FilterStone[]) => string;
}

export const FACETS: FacetDef[] = [
  {
    key: 'collection',
    label: 'Collection',
    coverage: null,
    values: (s) => [s.c],
    display: (v, stones) => stones.find((s) => s.c === v)?.cn ?? v,
  },
  { key: 'colour', label: 'Colour', coverage: 'colourFamilies', values: (s) => s.colours },
  { key: 'finish', label: 'Finish', coverage: 'finishes', values: (s) => s.finishes },
  { key: 'application', label: 'Where to use', coverage: 'applications', values: (s) => s.applications },
  { key: 'origin', label: 'Origin', coverage: 'origin', values: (s) => (s.origin ? [s.origin] : []) },
  {
    key: 'thickness',
    label: 'Thickness',
    coverage: 'thicknessesMm',
    values: (s) => s.thicknessesMm.map((n) => `${n} mm`),
  },
  { key: 'format', label: 'Size', coverage: 'formats', values: (s) => s.formats },
];
export const facetDef = (k: FacetKey) => FACETS.find((f) => f.key === k)!;

/** Grids smaller than this get no filter bar: filtering adds nothing. */
export const MIN_STONES_FOR_FILTERS = 8;

/** Facets to offer for these stones, given coverage shares (0–1) per field and the unlock threshold. */
export function visibleFacets(
  stones: FilterStone[],
  coverage: Record<string, number>,
  threshold: number,
): FacetKey[] {
  return FACETS.filter((f) => {
    if (f.coverage && (coverage[f.coverage] ?? 0) < threshold) return false;
    return new Set(stones.flatMap(f.values)).size >= 2;
  }).map((f) => f.key);
}

export type SortKey = 'reference' | 'name-asc' | 'name-desc';
export const SORTS: { value: SortKey; label: string }[] = [
  { value: 'reference', label: 'Our order' },
  { value: 'name-asc', label: 'Name A–Z' },
  { value: 'name-desc', label: 'Name Z–A' },
];

export interface FilterState {
  q: string;
  sort: SortKey;
  selected: Partial<Record<FacetKey, string[]>>;
}
export const emptyState = (): FilterState => ({ q: '', sort: 'reference', selected: {} });
export const activeCount = (s: FilterState) =>
  Object.values(s.selected).reduce((n, v) => n + (v?.length ?? 0), 0) + (s.q.trim() ? 1 : 0);

const matchesQ = (s: FilterStone, q: string) => {
  const tokens = normalize(q).split(' ').filter(Boolean);
  if (!tokens.length) return true;
  const hay = ` ${normalize(`${s.name} ${s.cn}`)}`;
  return tokens.every((t) => hay.includes(` ${t}`));
};

/** Stones passing every active filter (optionally ignoring one facet, for its own counts). */
export function applyFilters(stones: FilterStone[], state: FilterState, except?: FacetKey): FilterStone[] {
  return stones.filter((s) => {
    for (const f of FACETS) {
      if (f.key === except) continue;
      const sel = state.selected[f.key];
      if (sel?.length && !f.values(s).some((v) => sel.includes(v))) return false;
    }
    return matchesQ(s, state.q);
  });
}

/** For each facet: value → how many stones it would leave, given every other active filter. */
export function facetCounts(stones: FilterStone[], state: FilterState, keys: FacetKey[]) {
  const out = {} as Record<FacetKey, Map<string, number>>;
  for (const key of keys) {
    const f = facetDef(key);
    const all = new Map<string, number>();
    for (const s of stones) for (const v of f.values(s)) all.set(v, 0); // every option stays listed
    for (const s of applyFilters(stones, state, key))
      for (const v of f.values(s)) all.set(v, (all.get(v) ?? 0) + 1);
    out[key] = new Map([...all].sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true })));
  }
  return out;
}

export function sortStones(stones: FilterStone[], sort: SortKey): FilterStone[] {
  if (sort === 'reference') return [...stones].sort((a, b) => a.order - b.order);
  const dir = sort === 'name-asc' ? 1 : -1;
  return [...stones].sort(
    (a, b) => dir * a.name.localeCompare(b.name, 'en', { sensitivity: 'base', numeric: true }),
  );
}

/**
 * Read filters from a URL query. Values the page doesn't offer (an old or mistyped shared link) are
 * dropped and reported, so the page can say "Some filters no longer apply".
 */
export function stateFromParams(
  params: URLSearchParams,
  stones: FilterStone[],
  keys: FacetKey[],
  qParam = 'q',
) {
  const state = emptyState();
  let dropped = 0;
  state.q = (params.get(qParam) ?? '').slice(0, 120);
  const sort = params.get('sort');
  if (sort && SORTS.some((o) => o.value === sort)) state.sort = sort as SortKey;
  else if (sort) dropped++;
  for (const f of FACETS) {
    const raw = params.get(f.key);
    if (!raw) continue;
    const offered =
      keys.includes(f.key) || f.key === 'application' ? new Set(stones.flatMap(f.values)) : new Set<string>();
    const vals = raw
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    const kept = vals.filter((v) => offered.has(v));
    dropped += vals.length - kept.length;
    if (kept.length) state.selected[f.key] = [...new Set(kept)];
  }
  return { state, dropped };
}

/** Write filters into a query string, keeping unrelated parameters (e.g. the search query on /search). */
export function paramsFromState(state: FilterState, base: URLSearchParams, qParam: string | null = 'q') {
  const p = new URLSearchParams(base);
  for (const f of FACETS) p.delete(f.key);
  p.delete('sort');
  if (qParam) {
    if (state.q.trim()) p.set(qParam, state.q);
    else p.delete(qParam);
  }
  for (const f of FACETS) {
    const v = state.selected[f.key];
    if (v?.length) p.set(f.key, v.join(','));
  }
  if (state.sort !== 'reference') p.set('sort', state.sort);
  return p;
}
