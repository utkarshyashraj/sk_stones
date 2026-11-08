'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { track } from '@/lib/analytics';
import { closestCollection, search } from '@/lib/search';
import type { IndexStone } from '@/lib/search-index';
import { whatsappHref } from '@/lib/site';
import { useClientValue } from '../useClient';
import { Icon } from './Icon';
import { collectionName, loadIndex, stoneLightboxItem, stoneThumb, useIndex } from './index-client';
import { rememberSearch } from './recent-searches';
import { SaveIconButton } from './SaveButton';

const readSearch = () => window.location.search;

/**
 * /search: every stone matching ?q= (and ?application= from search suggestions), in the same product grid,
 * with Save toggles and the fullscreen viewer. The query can be refined in place (the URL follows, without
 * new history entries). Empty and no-result states point onward; a failed index load offers a retry.
 */
export function SearchResults({ children }: { children?: (stones: IndexStone[]) => React.ReactNode }) {
  const initial = useClientValue(readSearch, '');
  const params = new URLSearchParams(initial);
  const [q, setQ] = useState<string | null>(null);
  const query = q ?? params.get('q') ?? '';
  const application = params.get('application');
  const { index, error } = useIndex();

  const stones = useMemo(() => {
    if (!index) return [];
    let list =
      query.trim().length >= 2
        ? search(index, query).stones.map((h) => h.item)
        : application
          ? index.stones
          : [];
    if (application) list = list.filter((s) => s.app.includes(application));
    return list;
  }, [index, query, application]);

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
  const heading = query.trim()
    ? `“${query.trim()}”`
    : application
      ? `Stones for ${application.toLowerCase()}`
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
          {application && query.trim() ? ` · ${application}` : ''}
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
      ) : !index ? null : !query.trim() && !application ? (
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
          {children ? children(stones) : null}
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
