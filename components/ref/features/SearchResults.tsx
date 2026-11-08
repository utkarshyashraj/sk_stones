'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { track } from '@/lib/analytics';
import { fromIndexStones } from '@/lib/filter-stones';
import {
  applyFilters,
  FACETS,
  paramsFromState,
  sortStones,
  stateFromParams,
  visibleFacets,
  type FilterState,
} from '@/lib/filters';
import { closestCollection, search } from '@/lib/search';
import { whatsappHref } from '@/lib/site';
import { useClientValue } from '../useClient';
import { FilterPanel } from './FilterPanel';
import { Icon } from './Icon';
import { collectionName, loadIndex, stoneLightboxItem, stoneThumb, useIndex } from './index-client';
import { rememberSearch } from './recent-searches';
import { saveAll } from './saved-actions';
import { SaveIconButton } from './SaveButton';
import { MAX_SAVED, useSaved } from './shortlist-store';
import { showToast } from './toast-store';
import { openFeature } from './bus';
import { STEP_LABEL, type StepKey } from '@/lib/guide';

const readSearch = () => window.location.search;

/**
 * /search: every stone matching ?q=, narrowed by the same data-driven filters as product pages (and
 * ?application= from search suggestions and the guided chooser), in the same product grid,
 * with Save toggles and the fullscreen viewer. The query can be refined in place (the URL follows, without
 * new history entries). Empty and no-result states point onward; a failed index load offers a retry.
 */
export function SearchResults() {
  const initial = useClientValue(readSearch, '');
  const params = useMemo(() => new URLSearchParams(initial), [initial]);
  const [q, setQ] = useState<string | null>(null);
  const query = q ?? params.get('q') ?? '';
  const { index, error } = useIndex();

  const filterParams = FACETS.some((f) => params.has(f.key));
  const base = useMemo(() => {
    if (!index) return [];
    return query.trim().length >= 2
      ? search(index, query).stones.map((h) => h.item)
      : filterParams
        ? index.stones
        : [];
  }, [index, query, filterParams]);
  const fstones = useMemo(() => (index ? fromIndexStones(index, base) : []), [index, base]);
  const keys = useMemo(
    () => (index ? visibleFacets(fstones, index.coverage.fields, index.coverage.threshold) : []),
    [index, fstones],
  );
  const [fstate, setFstate] = useState<FilterState | null>(null);
  const parsed = useMemo(() => stateFromParams(params, fstones, keys, 'within'), [params, fstones, keys]);
  const state = fstate ?? parsed.state;
  const stones = useMemo(() => {
    const byId = new Map(base.map((s) => [s.id, s]));
    return sortStones(applyFilters(fstones, state), state.sort).map((f) => byId.get(f.id)!);
  }, [base, fstones, state]);

  // Filters follow the URL (the search query itself is kept as it is), also after a history pop.
  useEffect(() => {
    if (!fstate) return;
    const write = () => {
      const p = paramsFromState(fstate, new URLSearchParams(window.location.search), null);
      const qs = p.toString();
      history.replaceState(history.state, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`);
    };
    write();
    window.addEventListener('popstate', write);
    return () => window.removeEventListener('popstate', write);
  }, [fstate]);

  useEffect(() => {
    if (q === null) return;
    const p = new URLSearchParams(window.location.search);
    if (q.trim()) p.set('q', q.trim());
    else p.delete('q');
    const qs = p.toString();
    history.replaceState(history.state, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`);
  }, [q]);

  // Publish the result grid to the viewer whenever it changes.
  useEffect(() => {
    window.dispatchEvent(new Event('sk:lightbox-refresh'));
  }, [stones]);

  useEffect(() => {
    if (!index || query.trim().length < 2) return;
    const t = window.setTimeout(() => {
      rememberSearch(query);
      if (!stones.length) track('search_no_results', { query: query.trim().slice(0, 80) });
    }, 900);
    return () => window.clearTimeout(t);
  }, [index, query, stones.length]);

  const closest =
    index && query.trim().length >= 2 && !stones.length ? closestCollection(index, query) : null;
  const place = params.get('for')?.slice(0, 40);
  const fromGuide = params.get('guide') === '1';
  const heading = query.trim()
    ? `“${query.trim()}”`
    : place
      ? `Stones for ${place.toLowerCase()}`
      : state.selected.application?.length === 1
        ? `Stones for ${state.selected.application[0]!.toLowerCase()}`
        : 'Search our stones';

  return (
    <div className="sk-results">
      <form
        className="sk-results-form"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          track('search_used', { from: 'results-page' });
        }}
      >
        <label htmlFor="sk-results-q" className="sr-only">
          Search stones
        </label>
        <Icon name="search" />
        <input
          id="sk-results-q"
          type="search"
          value={query}
          placeholder="Search stones, colours, collections…"
          maxLength={120}
          autoComplete="off"
          onChange={(e) => setQ(e.target.value)}
        />
      </form>

      <div className="product-grid-header">
        <h2>{heading}</h2>
        <p className="product-count" aria-live="polite">
          {index ? `${stones.length} ${stones.length === 1 ? 'stone' : 'stones'}` : error ? '' : 'Loading…'}
        </p>
      </div>

      {error && !index ? (
        <div className="sk-empty sk-empty--page">
          <p>We couldn&apos;t load search results just now.</p>
          <div className="sk-btn-row">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void loadIndex().catch(() => {})}
            >
              Try again
            </button>
            <Link className="btn btn-outline-light" href="/products">
              Browse all products
            </Link>
          </div>
        </div>
      ) : !index ? null : !query.trim() && !filterParams ? (
        <div className="sk-empty sk-empty--page">
          <p>Type a stone name, colour, finish or use — for example “black granite” or “travertine”.</p>
        </div>
      ) : !stones.length ? (
        <div className="sk-empty sk-empty--page">
          <p>No stones match “{query.trim()}”.</p>
          {closest ? (
            <p>
              Closest collection: <Link href={`/${closest.s}`}>{closest.n}</Link>
            </p>
          ) : null}
          <p>We may still have it — ask us about “{query.trim()}”.</p>
          <div className="sk-btn-row">
            <a
              className="sk-btn sk-btn--wa"
              href={whatsappHref(`Hi S K Stones India, do you have "${query.trim()}"?`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="whatsapp" /> Ask on WhatsApp
            </a>
            <Link className="sk-btn sk-btn--ghost" href={`/contact?ask=${encodeURIComponent(query.trim())}`}>
              Ask in a quote
            </Link>
          </div>
        </div>
      ) : (
        <>
          {fromGuide ? (
            <GuideBar ids={stones.map((s) => s.id)} place={place} broadened={params.get('broadened')} />
          ) : null}
          <FilterPanel
            stones={fstones}
            keys={keys}
            state={state}
            onChange={setFstate}
            label="these results"
            resultCount={stones.length}
            showSearch={false}
            notice={!fstate && parsed.dropped ? 'Some filters no longer apply.' : null}
          />
          <div className="product-grid sk-search-grid">
            {stones.map((s) => {
              const thumb = stoneThumb(s);
              return (
                <div key={s.id} className="product-item product-item-clickable" data-sk-id={s.id}>
                  <div
                    className="product-item-image"
                    role="button"
                    tabIndex={0}
                    data-sk-click=""
                    aria-label={`View ${s.n} full screen`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- pre-optimised thumbnail */}
                    {thumb ? <img src={thumb} alt={s.n} loading="lazy" /> : null}
                  </div>
                  <SaveIconButton id={s.id} name={s.n} where="search" />
                  <div className="product-item-info">
                    <h4>{s.n}</h4>
                    <p className="sk-card-meta">{collectionName(index, s.c)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <script
            type="application/json"
            data-sk-lightbox=""
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                grid: '.sk-search-grid',
                item: '.product-item',
                items: stones.map((s) => stoneLightboxItem(index, s)),
              }).replace(/</g, '\\u003c'),
            }}
          />
        </>
      )}
    </div>
  );
}

/**
 * Under results reached through "Help me choose": what was left out to find matches, "Save all" and
 * "Get a quote for these" (the quote form lists the stones; above 30 it names the request instead).
 */
function GuideBar({ ids, place, broadened }: { ids: string[]; place?: string; broadened: string | null }) {
  const saved = useSaved();
  const allSaved = ids.every((id) => saved.some((e) => e.id === id));
  const room = MAX_SAVED - saved.filter((e) => !ids.includes(e.id)).length;
  const fits = ids.length <= MAX_SAVED;
  const left = (broadened ?? '')
    .split(',')
    .filter((k): k is StepKey => k in STEP_LABEL)
    .map((k) => STEP_LABEL[k]);
  const quoteHref = fits
    ? `/contact?stones=${ids.map(encodeURIComponent).join(',')}`
    : `/contact?ask=${encodeURIComponent(place ? `Stones for ${place.toLowerCase()}` : 'Help choosing a stone')}`;
  return (
    <div className="sk-guide-bar">
      {left.length ? (
        <p className="sk-filter-notice" role="status">
          Nothing matched everything you picked, so these ignore {left.join(' and ')}.
        </p>
      ) : null}
      <div className="sk-guide-actions">
        <button
          type="button"
          className="sk-btn sk-btn--ghost"
          disabled={allSaved || !fits || room < ids.length}
          onClick={() => {
            const n = saveAll(ids);
            showToast(
              n ? `Saved ${n} ${n === 1 ? 'stone' : 'stones'} to your list` : 'Already in your list',
              {
                label: 'View list',
                run: () => openFeature('saved'),
              },
            );
          }}
        >
          <Icon name="bookmark" /> {allSaved ? 'All saved' : `Save all ${ids.length}`}
        </button>
        <Link className="sk-btn sk-btn--gold" href={quoteHref} prefetch={false}>
          Get a quote for these
        </Link>
        <button type="button" className="sk-link-btn" onClick={() => openFeature('guide')}>
          Start again
        </button>
      </div>
      {!fits ? (
        <p className="sk-muted">Narrow these down with the filters to save them all (up to {MAX_SAVED}).</p>
      ) : !allSaved && room < ids.length ? (
        <p className="sk-muted">Your saved list holds up to {MAX_SAVED} stones.</p>
      ) : null}
    </div>
  );
}
