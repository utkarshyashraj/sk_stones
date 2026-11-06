'use client';

import Link from 'next/link';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { replaceUrl, useHash, useSearchString } from '@/components/ui/useLocation';
import { Icon } from '@/components/ui/Icon';
import { CatalogFilters } from '@/components/catalog/CatalogFilters/CatalogFilters';
import { ProductCard } from '@/components/catalog/ProductCard/ProductCard';
import dynamic from 'next/dynamic';
import { loadCatalogIndex } from '@/components/catalog/ProductSearch/catalog-index';
import {
  activeFilterCount,
  applyFilters,
  emptyFilters,
  FACET_LABELS,
  facetCounts,
  paramsFromState,
  SORTS,
  sortProducts,
  stateFromParams,
  type FacetKey,
  type FilterState,
  type SortKey,
} from '@/lib/search';
import { whatsappHref } from '@/lib/site';
import type { ClientProduct } from '@/lib/types';
import styles from './ProductGrid.module.css';

interface Props {
  /** Products to show. Omit to load the full catalog index in the browser (search page). */
  products?: ClientProduct[];
  names?: Record<string, string>;
  order?: string[];
  facets: FacetKey[];
  showCollection: boolean;
  /** Visible label for the results region, e.g. "Indian Marbles collection". */
  label: string;
  /** Number of cards whose images load eagerly (above the fold). */
  eager?: number;
}

// Code-split: the lightbox loads when a product is first opened.
const ProductLightbox = dynamic(
  () => import('@/components/catalog/ProductLightbox/ProductLightbox').then((m) => m.ProductLightbox),
  {
    ssr: false,
  },
);

const COLOUR_ORDER = [
  'White',
  'Beige',
  'Cream',
  'Grey',
  'Silver',
  'Black',
  'Brown',
  'Gold',
  'Yellow',
  'Red',
  'Pink',
  'Green',
  'Blue',
  'Purple',
  'Multicolour',
];

export function ProductGrid({
  products: initialProducts,
  names: initialNames,
  order: initialOrder,
  facets,
  showCollection,
  label,
  eager = 4,
}: Props) {
  const uid = useId();
  const [loaded, setLoaded] = useState<{
    products: ClientProduct[];
    names: Record<string, string>;
    order: string[];
  } | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const data = useMemo(
    () =>
      initialProducts
        ? { products: initialProducts, names: initialNames ?? {}, order: initialOrder ?? [] }
        : loaded,
    [initialProducts, initialNames, initialOrder, loaded],
  );

  // Client-side catalog for the search page (async callback, not a synchronous effect update).
  useEffect(() => {
    if (initialProducts) return;
    let cancelled = false;
    loadCatalogIndex()
      .then((idx) => !cancelled && setLoaded(idx))
      .catch(() => !cancelled && setLoadError(true));
    return () => {
      cancelled = true;
    };
  }, [initialProducts]);

  // The URL is the single source of truth for filters (?q=&colour=…) and the open product (#product=id).
  const search = useSearchString();
  const hash = useHash();
  const state = useMemo(() => stateFromParams(new URLSearchParams(search)), [search]);
  const setState = useCallback((update: (s: FilterState) => FilterState) => {
    const next = update(stateFromParams(new URLSearchParams(window.location.search)));
    replaceUrl({ search: paramsFromState(next).toString() });
  }, []);

  const names = useMemo(() => data?.names ?? {}, [data]);
  const all = useMemo(() => data?.products ?? [], [data]);
  const cache = useMemo(() => new Map<string, string>(), []);
  const filtered = useMemo(
    () => sortProducts(applyFilters(all, state, names, undefined, cache), state.sort),
    [all, state, names, cache],
  );
  const counts = useMemo(() => facetCounts(all, state, names, cache), [all, state, names, cache]);
  const active = activeFilterCount(state);

  // Lightbox: derived from #product=<id>. If the product is filtered out, browse the full list instead.
  const openId = hash.match(/^#product=([\w-]+)/)?.[1] ?? null;
  const inFiltered = openId ? filtered.findIndex((p) => p.id === openId) : -1;
  const lightboxList = openId && inFiltered < 0 ? all : filtered;
  const lightbox = openId ? (inFiltered >= 0 ? inFiltered : all.findIndex((p) => p.id === openId)) : -1;
  // Mount (and download) the lightbox on first open, then keep it mounted so closing runs the dialog's close logic.
  const [lightboxSeen, setLightboxSeen] = useState(false);
  if (lightbox >= 0 && !lightboxSeen) setLightboxSeen(true);

  const openAt = useCallback(
    (i: number) => {
      const p = lightboxList[i];
      if (p) replaceUrl({ hash: `#product=${p.id}` });
    },
    [lightboxList],
  );
  const closeLightbox = useCallback(() => {
    if (window.location.hash.startsWith('#product=')) replaceUrl({ hash: '' });
  }, []);

  const toggle = (facet: FacetKey, value: string) =>
    setState((s) => ({
      ...s,
      [facet]: s[facet].includes(value) ? s[facet].filter((v) => v !== value) : [...s[facet], value],
    }));
  const clearAll = () => setState((s) => ({ ...emptyFilters(), sort: s.sort }));

  const order = useMemo(() => data?.order ?? [], [data]);
  const labelFor = useCallback(
    (facet: FacetKey, v: string) => (facet === 'category' || facet === 'collection' ? (names[v] ?? v) : v),
    [names],
  );
  const orderFor = useCallback(
    (facet: FacetKey, values: string[]) => {
      if (facet === 'category' || facet === 'collection')
        return [...values].sort((a, b) => order.indexOf(a) - order.indexOf(b));
      if (facet === 'colour')
        return [...values].sort((a, b) => COLOUR_ORDER.indexOf(a) - COLOUR_ORDER.indexOf(b));
      return [...values].sort((a, b) => a.localeCompare(b));
    },
    [order],
  );

  const chips = (Object.keys(FACET_LABELS) as FacetKey[]).flatMap((f) => state[f].map((v) => ({ f, v })));

  return (
    <div className={styles.explorer}>
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Icon name="search" className={styles.searchIcon} />
          <label htmlFor={`${uid}-q`} className="visually-hidden">
            Search within {label}
          </label>
          <input
            id={`${uid}-q`}
            type="search"
            value={state.q}
            onChange={(e) => setState((s) => ({ ...s, q: e.target.value }))}
            placeholder="Search by name, colour, finish…"
            autoComplete="off"
          />
        </div>
        <button
          type="button"
          className={`btn btn--outline btn--sm ${styles.filterToggle}`}
          aria-expanded={filtersOpen}
          aria-controls={`${uid}-filters`}
          onClick={() => setFiltersOpen((o) => !o)}
        >
          <Icon name="filter" /> Filters{active ? ` (${active - (state.q.trim() ? 1 : 0)})` : ''}
        </button>
        <div className={styles.sort}>
          <label htmlFor={`${uid}-sort`}>Sort</label>
          <select
            id={`${uid}-sort`}
            value={state.sort}
            onChange={(e) => setState((s) => ({ ...s, sort: e.target.value as SortKey }))}
          >
            {SORTS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.layout}>
        <aside id={`${uid}-filters`} className={styles.sidebar} data-open={filtersOpen} aria-label="Filters">
          {data ? (
            <CatalogFilters
              facets={facets}
              counts={counts}
              state={state}
              labelFor={labelFor}
              orderFor={orderFor}
              onToggle={toggle}
              onClear={clearAll}
              activeCount={active}
              idPrefix={uid}
            />
          ) : null}
        </aside>

        <div className={styles.results} role="region" aria-label={label}>
          <div className={styles.summary}>
            <p aria-live="polite" aria-atomic="true" className={styles.count}>
              {data ? (
                <>
                  <strong>{filtered.length}</strong> {filtered.length === 1 ? 'stone' : 'stones'}
                  {active ? ` of ${all.length}` : ''}
                  {state.q.trim() ? ` matching “${state.q.trim()}”` : ''}
                </>
              ) : loadError ? (
                'The catalogue could not be loaded. Please refresh the page.'
              ) : (
                'Loading stones…'
              )}
            </p>
            {chips.length ? (
              <ul className={styles.chips} aria-label="Active filters">
                {chips.map(({ f, v }) => (
                  <li key={`${f}-${v}`}>
                    <button
                      type="button"
                      className={styles.chip}
                      onClick={() => toggle(f, v)}
                      aria-label={`Remove filter ${FACET_LABELS[f]}: ${labelFor(f, v)}`}
                    >
                      {labelFor(f, v)} <Icon name="close" size={14} />
                    </button>
                  </li>
                ))}
                <li>
                  <button type="button" className={styles.clearChips} onClick={clearAll}>
                    Clear all
                  </button>
                </li>
              </ul>
            ) : null}
          </div>

          {data && filtered.length === 0 ? (
            <div className={styles.empty}>
              <Icon name="search" size={32} />
              <h3>No stones match these filters</h3>
              <p>
                Try removing a filter or searching for a broader term. Our team can also source stones that
                aren&apos;t listed online.
              </p>
              <div className={styles.emptyActions}>
                <button type="button" className="btn btn--primary" onClick={clearAll}>
                  Clear filters
                </button>
                <a
                  className="btn btn--outline"
                  href={whatsappHref(
                    `Hi S K Stones India, I'm looking for ${state.q.trim() || 'a stone'} — can you help?`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="whatsapp" /> Ask our experts
                </a>
                <Link className="btn btn--outline" href="/products">
                  Browse all categories
                </Link>
              </div>
            </div>
          ) : (
            <ul className={styles.grid}>
              {filtered.map((p, i) => (
                <li key={p.id}>
                  <ProductCard
                    product={p}
                    collectionName={names[p.collection] ?? ''}
                    showCollection={showCollection}
                    onQuickView={() => openAt(i)}
                    priority={i < eager}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {lightboxSeen ? (
        <ProductLightbox
          products={lightboxList}
          index={lightbox >= 0 ? lightbox : null}
          names={names}
          onClose={closeLightbox}
          onNavigate={openAt}
        />
      ) : null}
    </div>
  );
}
