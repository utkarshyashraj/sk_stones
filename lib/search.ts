import type { ClientProduct } from './types';

export const FACETS = ['category', 'collection', 'colour', 'finish', 'application', 'origin'] as const;
export type FacetKey = (typeof FACETS)[number];
export type SortKey = 'featured' | 'name-asc' | 'name-desc';
export const SORTS: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

export type FilterState = { q: string; sort: SortKey } & Record<FacetKey, string[]>;

export const emptyFilters = (): FilterState => ({
  q: '',
  sort: 'featured',
  category: [],
  collection: [],
  colour: [],
  finish: [],
  application: [],
  origin: [],
});

export const FACET_LABELS: Record<FacetKey, string> = {
  category: 'Category',
  collection: 'Collection',
  colour: 'Colour',
  finish: 'Finish',
  application: 'Application',
  origin: 'Origin',
};

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/gray/g, 'grey')
    .replace(/colou?r/g, 'colour')
    .replace(/[^a-z0-9×]+/g, ' ')
    .trim();

/** Values a product has for a facet. */
export function facetValues(p: ClientProduct, key: FacetKey): string[] {
  switch (key) {
    case 'category':
      return [p.category];
    case 'collection':
      return [p.collection];
    case 'colour':
      return p.colours;
    case 'finish':
      return p.finish ? [p.finish] : [];
    case 'application':
      return p.applications;
    case 'origin':
      return p.origin ? [p.origin] : [];
  }
}

export function haystack(p: ClientProduct, names: Record<string, string>): string {
  return normalize(
    [
      p.name,
      names[p.collection] ?? '',
      names[p.category] ?? '',
      p.subcategory ? (names[p.subcategory] ?? '') : '',
      ...p.colours,
      p.finish ?? '',
      ...p.applications,
      p.origin ?? '',
      ...p.tags,
      p.size ?? '',
    ].join(' '),
  );
}

/** Every query token must appear (as a word prefix) somewhere in the product's searchable text. */
export function matchesQuery(
  p: ClientProduct,
  q: string,
  names: Record<string, string>,
  cache?: Map<string, string>,
): boolean {
  const tokens = normalize(q).split(' ').filter(Boolean);
  if (!tokens.length) return true;
  let text = cache?.get(p.id);
  if (text === undefined) {
    text = haystack(p, names);
    cache?.set(p.id, text);
  }
  const words = ` ${text}`;
  return tokens.every((t) => words.includes(` ${t}`));
}

export function applyFilters(
  products: ClientProduct[],
  state: FilterState,
  names: Record<string, string>,
  except?: FacetKey,
  cache?: Map<string, string>,
): ClientProduct[] {
  return products.filter((p) => {
    for (const key of FACETS) {
      if (key === except) continue;
      const selected = state[key];
      if (selected.length && !facetValues(p, key).some((v) => selected.includes(v))) return false;
    }
    return matchesQuery(p, state.q, names, cache);
  });
}

/** For each facet: value -> count of products matching every *other* active filter. */
export function facetCounts(
  products: ClientProduct[],
  state: FilterState,
  names: Record<string, string>,
  cache?: Map<string, string>,
): Record<FacetKey, Map<string, number>> {
  const out = {} as Record<FacetKey, Map<string, number>>;
  for (const key of FACETS) {
    const counts = new Map<string, number>();
    for (const p of applyFilters(products, state, names, key, cache)) {
      for (const v of facetValues(p, key)) counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    // keep selected values visible even when their count drops to 0
    for (const v of state[key]) if (!counts.has(v)) counts.set(v, 0);
    out[key] = counts;
  }
  return out;
}

export function sortProducts(products: ClientProduct[], sort: SortKey): ClientProduct[] {
  if (sort === 'featured') return products;
  const dir = sort === 'name-asc' ? 1 : -1;
  return [...products].sort(
    (a, b) => dir * a.name.localeCompare(b.name, 'en', { sensitivity: 'base', numeric: true }),
  );
}

export const activeFilterCount = (s: FilterState) =>
  FACETS.reduce((n, k) => n + s[k].length, 0) + (s.q.trim() ? 1 : 0);

// ---------- URL state ----------
export function stateFromParams(params: URLSearchParams): FilterState {
  const s = emptyFilters();
  s.q = params.get('q') ?? '';
  const sort = params.get('sort');
  if (sort && SORTS.some((o) => o.value === sort)) s.sort = sort as SortKey;
  for (const key of FACETS) {
    const v = params.get(key);
    s[key] = v ? v.split(',').filter(Boolean) : [];
  }
  return s;
}

export function paramsFromState(s: FilterState): URLSearchParams {
  const p = new URLSearchParams();
  if (s.q.trim()) p.set('q', s.q); // kept as typed (trailing spaces) so multi-word typing works; matching trims
  for (const key of FACETS) if (s[key].length) p.set(key, s[key].join(','));
  if (s.sort !== 'featured') p.set('sort', s.sort);
  return p;
}
