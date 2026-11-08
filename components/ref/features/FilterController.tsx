'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { fromLightboxItems } from '@/lib/filter-stones';
import {
  applyFilters,
  emptyState,
  paramsFromState,
  sortStones,
  stateFromParams,
  type FacetKey,
  type FilterState,
} from '@/lib/filters';
import type { LightboxGroup } from '@/lib/lightbox-items';
import { FilterPanel } from './FilterPanel';

interface MountConfig {
  keys: FacetKey[];
  label: string;
  countLabel: string;
}

function readPage() {
  const mount = document.getElementById('sk-filter-mount');
  const grid = document.querySelector<HTMLElement>('.product-grid');
  if (!mount || !grid) return null;
  const config = JSON.parse(mount.dataset.config || '{}') as MountConfig;
  const groupScript = [...document.querySelectorAll<HTMLScriptElement>('script[data-sk-lightbox]')]
    .map((s) => JSON.parse(s.textContent || '{}') as LightboxGroup)
    .find((g) => g.grid === '.product-grid');
  return { mount, grid, config, stones: fromLightboxItems(groupScript?.items ?? []) };
}

/**
 * Product pages: replaces the server-rendered filter bar (same size, so nothing moves) with the live one,
 * and applies the filters to the existing cards — hiding and reordering them rather than re-rendering, so
 * photos already loaded stay put. State lives in the URL (replaceState: no history flooding) and survives
 * reloads and shared links. A deep link to a filtered-out stone clears the filters so it can show.
 */
export function FilterController() {
  const [page, setPage] = useState<ReturnType<typeof readPage>>(null);
  // Read after mount: after a client-side navigation this can render before the new page is in the DOM.
  useEffect(() => queueMicrotask(() => setPage(readPage())), []);
  if (!page) return null;
  return <LiveFilters {...page} />;
}

function LiveFilters({ mount, grid, config, stones }: NonNullable<ReturnType<typeof readPage>>) {
  const initial = useMemo(() => {
    const r = stateFromParams(new URLSearchParams(window.location.search), stones, config.keys);
    // Anything done on the static bar before this took over carries across.
    const skeleton = document.getElementById('sk-filter-skeleton');
    const typed = skeleton?.querySelector<HTMLInputElement>('input[type=search]')?.value;
    const sorted = skeleton?.querySelector<HTMLSelectElement>('select')?.value;
    if (typed) r.state.q = typed;
    if (sorted && sorted !== 'reference') r.state.sort = sorted as FilterState['sort'];
    return r;
  }, [stones, config.keys]);
  const [pending] = useState(() => {
    const q = window.__skQueue;
    const p = q?.filter;
    if (q) q.filter = undefined;
    const active = document.activeElement;
    return { ...p, focusSearch: Boolean(active?.closest('#sk-filter-skeleton input')) };
  });
  const [state, setState] = useState<FilterState>(initial.state);
  const [notice, setNotice] = useState(initial.dropped ? 'Some filters no longer apply.' : null);

  const visible = useMemo(() => sortStones(applyFilters(stones, state), state.sort), [stones, state]);

  // The server-rendered bar steps aside in the same frame the live one appears.
  useLayoutEffect(() => {
    const skeleton = document.getElementById('sk-filter-skeleton');
    if (skeleton) skeleton.hidden = true;
    return () => {
      if (skeleton) skeleton.hidden = false;
    };
  }, []);

  // Apply to the cards: show/hide, reorder, update the count line and the empty state.
  useEffect(() => {
    const cards = new Map(
      [...grid.querySelectorAll<HTMLElement>('.product-item[data-sk-id]')].map((el) => [
        el.dataset.skId!,
        el,
      ]),
    );
    const shown = new Set(visible.map((s) => s.id));
    for (const [id, el] of cards) el.hidden = !shown.has(id);
    const order = state.sort === 'reference' ? sortStones(stones, 'reference') : visible;
    for (const s of order) {
      const el = cards.get(s.id);
      if (el) grid.appendChild(el);
    }
    const count = document.querySelector<HTMLElement>('.product-grid-section .product-count');
    if (count) {
      count.dataset.label ??= count.textContent ?? '';
      count.textContent =
        visible.length === stones.length
          ? count.dataset.label
          : `${visible.length} of ${count.dataset.label}`;
      count.setAttribute('aria-live', 'polite');
    }
    const empty = document.getElementById('sk-filter-empty');
    if (empty) empty.hidden = visible.length > 0;
  }, [grid, stones, visible, state.sort]);

  // Keep the URL in step — also after a history pop (closing the phone sheet undoes its own history entry,
  // which would otherwise bring back the address from before the filters changed).
  useEffect(() => {
    const write = () => {
      const p = paramsFromState(state, new URLSearchParams(window.location.search));
      const qs = p.toString();
      history.replaceState(
        history.state,
        '',
        `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`,
      );
    };
    write();
    window.addEventListener('popstate', write);
    return () => window.removeEventListener('popstate', write);
  }, [state]);

  const clear = useCallback(() => setState((s) => ({ ...emptyState(), sort: s.sort })), []);
  useEffect(() => {
    const onReveal = (e: Event) => {
      const id = (e as CustomEvent<{ id: string }>).detail?.id;
      if (id && !visible.some((s) => s.id === id)) clear();
    };
    const onClear = (e: Event) => {
      if ((e.target as Element | null)?.closest?.('[data-sk-filter-clear]')) clear();
    };
    window.addEventListener('sk:reveal', onReveal);
    document.addEventListener('click', onClear);
    return () => {
      window.removeEventListener('sk:reveal', onReveal);
      document.removeEventListener('click', onClear);
    };
  }, [visible, clear]);

  return createPortal(
    <FilterPanel
      stones={stones}
      keys={config.keys}
      state={state}
      onChange={(s) => {
        setState(s);
        setNotice(null);
      }}
      label={config.label}
      resultCount={visible.length}
      notice={notice}
      initialOpen={pending}
    />,
    mount,
  );
}
