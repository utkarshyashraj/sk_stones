'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { track } from '@/lib/analytics';
import { withBase } from '@/lib/base-path';
import { closestCollection, search } from '@/lib/search';
import { whatsappHref } from '@/lib/site';
import { openFeature } from './bus';
import { Icon } from './Icon';
import { collectionName, stoneHref, stoneThumb, useIndex } from './index-client';
import { clearRecentSearches, rememberSearch, useRecentSearches } from './recent-searches';
import { useDialog } from './useDialog';

const POPULAR = [
  { label: 'Indian Marbles', href: '/indian-marbles' },
  { label: 'Imported Marbles', href: '/imported-marbles' },
  { label: 'Indian Granites', href: '/granites' },
  { label: 'Quartz', href: '/quatrz-surfaces' },
  { label: 'Wall Claddings', href: '/wall-claddings' },
  { label: 'Tiles', href: '/tiles' },
  { label: 'Cobble Stones', href: '/cobble-stones' },
];

interface Option {
  id: string;
  group: string;
  label: string;
  meta?: string;
  thumb?: string | null;
  href: string;
}

export const resultsHref = (q: string) => `/search?q=${encodeURIComponent(q.trim())}`;

/**
 * Site search: a centred panel on desktop, full screen on phones (the back button closes it). Suggestions
 * appear from 2 characters, grouped Stones · Collections · Services and uses · Projects, and forgive small
 * typos. ↑/↓ move through them, Enter opens one (or all results), Escape closes. Before typing: recent
 * searches and popular collections. With no match: the closest collection and a way to ask us directly.
 */
export function SearchOverlay({ onClose, initial = '' }: { onClose: () => void; initial?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { leaveVia } = useDialog(ref, true, onClose, { backCloses: true });
  const router = useRouter();
  const uid = useId();
  const [q, setQ] = useState(initial);
  const [active, setActive] = useState(-1);
  const { index, error } = useIndex();
  const recent = useRecentSearches();
  const ready = q.trim().length >= 2;

  const results = useMemo(() => (index && ready ? search(index, q) : null), [index, q, ready]);
  const options: Option[] = useMemo(() => {
    if (!index || !results) return [];
    return [
      ...results.stones.slice(0, 6).map((h) => ({
        id: `s-${h.item.id}`,
        group: 'Stones',
        label: h.item.n,
        meta: collectionName(index, h.item.c),
        thumb: stoneThumb(h.item),
        href: stoneHref(h.item),
      })),
      ...results.collections.slice(0, 3).map((h) => ({
        id: `c-${h.item.s}`,
        group: 'Collections',
        label: h.item.n,
        meta: `${h.item.count} ${h.item.count === 1 ? 'variety' : 'varieties'}`,
        href: `/${h.item.s}`,
      })),
      ...[
        ...results.services.map((h) => ({
          id: `v-${h.item.s}`,
          label: h.item.n,
          meta: 'Service',
          href: `/${h.item.s}`,
          score: h.score,
        })),
        ...results.applications.map((h) => ({
          id: `a-${h.item.v}`,
          label: h.item.v,
          meta: `Stones for ${h.item.v.toLowerCase()}`,
          href: `/search?application=${encodeURIComponent(h.item.v)}`,
          score: h.score,
        })),
      ]
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(({ score: _score, ...o }) => ({ ...o, group: 'Services and uses' })),
      ...results.projects.slice(0, 2).map((h) => ({
        id: `p-${h.item.id}`,
        group: 'Projects',
        label: h.item.n,
        meta: 'Project',
        href: `/projects#${h.item.id}`,
      })),
    ];
  }, [index, results]);

  const noResults = Boolean(index && ready && results && results.total === 0);
  const closest = noResults && index ? closestCollection(index, q) : null;

  // Count a search with no results once the visitor pauses typing.
  useEffect(() => {
    if (!noResults) return;
    const t = window.setTimeout(() => track('search_no_results', { query: q.trim().slice(0, 80) }), 900);
    return () => window.clearTimeout(t);
  }, [noResults, q]);

  const go = (href: string) => {
    rememberSearch(q);
    track('search_used', { results: results?.total ?? 0 });
    const [path, hash] = href.split('#');
    const here = window.location.pathname.replace(/\/$/, '') === withBase(path!).replace(/\/$/, '');
    if (here && hash) {
      onClose(); // the dialog's history entry is undone, then the viewer opens via hashchange
      window.setTimeout(() => (window.location.hash = hash), 60);
      return;
    }
    leaveVia();
    onClose();
    router.replace(href); // replaces the overlay's own history entry: Back returns to the page before
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && options.length) {
      e.preventDefault();
      setActive((a) => (a + 1) % options.length);
    } else if (e.key === 'ArrowUp' && options.length) {
      e.preventDefault();
      setActive((a) => (a <= 0 ? options.length - 1 : a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (active >= 0 && options[active]) go(options[active].href);
      else if (ready) go(resultsHref(q));
    }
  };

  const listId = `${uid}-list`;
  const optId = (i: number) => `${uid}-opt-${i}`;
  let lastGroup = '';

  return (
    <>
      <div className="sk-backdrop" onClick={onClose} aria-hidden="true" />
      <div ref={ref} className="sk-search" role="dialog" aria-modal="true" aria-label="Search stones">
        <div className="sk-search-bar">
          <Icon name="search" />
          <input
            data-autofocus=""
            type="search"
            role="combobox"
            aria-expanded={options.length > 0}
            aria-controls={listId}
            aria-activedescendant={active >= 0 ? optId(active) : undefined}
            aria-autocomplete="list"
            aria-label="Search stones, colours, collections and services"
            placeholder="Search stones, colours, collections…"
            autoComplete="off"
            enterKeyHint="search"
            value={q}
            maxLength={120}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(-1);
            }}
            onKeyDown={onKeyDown}
          />
          <button type="button" className="sk-icon-btn" aria-label="Close search" onClick={onClose}>
            <Icon name="times" />
          </button>
        </div>

        <div className="sk-search-body">
          {!ready ? (
            <>
              {recent.length ? (
                <section className="sk-search-section">
                  <div className="sk-search-section-head">
                    <h3>Recent searches</h3>
                    <button type="button" className="sk-link-btn" onClick={clearRecentSearches}>
                      Clear
                    </button>
                  </div>
                  <div className="sk-search-chips">
                    {recent.map((r) => (
                      <button key={r} type="button" className="sk-pill" onClick={() => setQ(r)}>
                        <Icon name="clock" /> {r}
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}
              <section className="sk-search-section">
                <h3>Popular collections</h3>
                <div className="sk-search-chips">
                  {POPULAR.map((p) => (
                    <Link
                      key={p.href}
                      href={p.href}
                      className="sk-pill"
                      onClick={(e) => {
                        e.preventDefault();
                        go(p.href);
                      }}
                    >
                      {p.label}
                    </Link>
                  ))}
                </div>
              </section>
              <section className="sk-search-section sk-search-guide">
                <p>Not sure what you need?</p>
                <button type="button" className="sk-btn sk-btn--ghost" onClick={() => openFeature('guide')}>
                  Help me choose
                </button>
              </section>
            </>
          ) : error && !index ? (
            <div className="sk-search-msg">
              <p>Instant results aren&apos;t available right now.</p>
              <button type="button" className="sk-btn sk-btn--gold" onClick={() => go(resultsHref(q))}>
                See results for “{q.trim()}”
              </button>
            </div>
          ) : !index ? (
            <p className="sk-search-msg sk-muted" aria-busy="true">
              Loading…
            </p>
          ) : noResults ? (
            <div className="sk-search-msg">
              <p>
                No stones match “<strong>{q.trim()}</strong>”.
              </p>
              {closest ? (
                <p>
                  Closest collection:{' '}
                  <Link
                    href={`/${closest.s}`}
                    onClick={(e) => {
                      e.preventDefault();
                      go(`/${closest.s}`);
                    }}
                  >
                    {closest.n}
                  </Link>
                </p>
              ) : null}
              <p className="sk-muted">We may still have it — ask us about “{q.trim()}”.</p>
              <div className="sk-btn-row">
                <a
                  className="sk-btn sk-btn--wa"
                  href={whatsappHref(`Hi S K Stones India, do you have "${q.trim()}"?`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="whatsapp" /> Ask on WhatsApp
                </a>
                <Link
                  className="sk-btn sk-btn--ghost"
                  href={`/contact?ask=${encodeURIComponent(q.trim())}`}
                  onClick={(e) => {
                    e.preventDefault();
                    go(`/contact?ask=${encodeURIComponent(q.trim())}`);
                  }}
                >
                  Ask in a quote
                </Link>
              </div>
            </div>
          ) : (
            <>
              <ul id={listId} role="listbox" aria-label="Suggestions" className="sk-search-list">
                {options.map((o, i) => {
                  const head = o.group !== lastGroup ? o.group : null;
                  lastGroup = o.group;
                  return (
                    <li key={o.id} role="presentation">
                      {head ? (
                        <p className="sk-search-group" aria-hidden="true">
                          {head}
                        </p>
                      ) : null}
                      <div
                        id={optId(i)}
                        role="option"
                        aria-selected={i === active}
                        aria-label={`${o.label}${o.meta ? `, ${o.meta}` : ''} (${o.group})`}
                        className={`sk-search-option${i === active ? ' is-active' : ''}`}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => go(o.href)}
                      >
                        {o.group === 'Stones' ? (
                          o.thumb ? (
                            // eslint-disable-next-line @next/next/no-img-element -- pre-optimised thumbnail
                            <img src={o.thumb} alt="" width={44} height={44} />
                          ) : (
                            <span className="sk-thumb-empty" />
                          )
                        ) : null}
                        <span className="sk-search-option-text">
                          <span>{o.label}</span>
                          {o.meta ? <span className="sk-muted">{o.meta}</span> : null}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <button type="button" className="sk-search-all" onClick={() => go(resultsHref(q))}>
                See all {results?.stones.length ?? 0} stones for “{q.trim()}” <Icon name="arrow-right" />
              </button>
            </>
          )}
        </div>
        <p className="sr-only" aria-live="polite">
          {ready && index ? (noResults ? 'No results' : `${options.length} suggestions`) : ''}
        </p>
      </div>
    </>
  );
}
