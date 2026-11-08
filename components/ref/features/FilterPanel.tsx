'use client';

import { useEffect, useRef, useState } from 'react';
import { track } from '@/lib/analytics';
import {
  activeCount,
  emptyState,
  facetCounts,
  facetDef,
  type FacetKey,
  type FilterState,
  type FilterStone,
} from '@/lib/filters';
import { FilterBarView } from '../FilterBarView';
import { Icon } from './Icon';
import { useDialog } from './useDialog';

/**
 * Interactive filter bar: desktop popovers (one per facet, real checkboxes with live counts; options that
 * would leave nothing are disabled), the phone "Filters" bottom sheet (fieldsets of checkboxes and a
 * sticky "Show N stones"), removable pills for active choices, sort, search-within and "Clear all".
 * Stateless about data: the owner passes the stones, the facets to offer and the current state.
 */
export function FilterPanel({
  stones,
  keys,
  state,
  onChange,
  label,
  resultCount,
  showSearch = true,
  notice,
  initialOpen,
}: {
  stones: FilterStone[];
  keys: FacetKey[];
  state: FilterState;
  onChange: (s: FilterState) => void;
  label: string;
  resultCount: number;
  showSearch?: boolean;
  notice?: string | null;
  /** carried over from the static bar: a chip or the sheet to open, or the search box to focus */
  initialOpen?: { chip?: string; sheet?: boolean; focusSearch?: boolean };
}) {
  const [pop, setPop] = useState<{ key: FacetKey; left: number; top: number } | null>(null);
  const [sheet, setSheet] = useState(false);
  const counts = facetCounts(stones, state, keys);
  const total = activeCount(state);
  const qTimer = useRef<number | undefined>(undefined);
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!initialOpen) return;
    queueMicrotask(() => {
      const bar = barRef.current;
      if (initialOpen.focusSearch) {
        const input = bar?.querySelector<HTMLInputElement>('input[type=search]');
        input?.focus();
        input?.setSelectionRange(input.value.length, input.value.length);
      }
      if (initialOpen.sheet) setSheet(true);
      const chip =
        initialOpen.chip && bar?.querySelector<HTMLElement>(`[data-sk-chip="${initialOpen.chip}"]`);
      if (chip) {
        const r = chip.getBoundingClientRect();
        setPop({
          key: initialOpen.chip as FacetKey,
          left: Math.min(r.left, window.innerWidth - 300),
          top: r.bottom + 8,
        });
      }
    });
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (k: FacetKey, v: string) => {
    const cur = state.selected[k] ?? [];
    const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
    onChange({ ...state, selected: { ...state.selected, [k]: next } });
    track('filter_used', { facet: k });
  };
  const clearAll = () => {
    onChange({ ...emptyState(), sort: state.sort });
    setPop(null);
  };

  // Close the desktop popover on outside click, Escape or scroll. Only a real scroll closes it: a scroll
  // event still in flight from bringing the chip into view (smooth scrolling, a slow device) would
  // otherwise close the popover the moment it opens.
  const popRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!pop) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element;
      if (!popRef.current?.contains(t) && !t.closest('.sk-chip-btn')) setPop(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPop(null);
    const startY = window.scrollY;
    const onScroll = () => Math.abs(window.scrollY - startY) > 48 && setPop(null);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    popRef.current?.querySelector<HTMLElement>('input')?.focus();
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
    };
  }, [pop]);

  const options = (k: FacetKey) => {
    const f = facetDef(k);
    return [...counts[k]].map(([v, n]) => {
      const checked = state.selected[k]?.includes(v) ?? false;
      return (
        <label key={v} className={`sk-check${!n && !checked ? ' is-disabled' : ''}`}>
          <input type="checkbox" checked={checked} disabled={!n && !checked} onChange={() => toggle(k, v)} />
          <span>{f.display ? f.display(v, stones) : v}</span>
          <span className="sk-check-count">{n}</span>
        </label>
      );
    });
  };

  return (
    <div ref={barRef}>
      <FilterBarView
        keys={keys}
        state={state}
        label={label}
        showSearch={showSearch}
        openKey={pop?.key ?? null}
        activeTotal={total}
        onQuery={(q) => {
          onChange({ ...state, q });
          window.clearTimeout(qTimer.current);
          qTimer.current = window.setTimeout(
            () => q.trim() && track('filter_used', { facet: 'search-within' }),
            1200,
          );
        }}
        onSort={(sort) => onChange({ ...state, sort })}
        onChip={(key, el) => {
          if (pop?.key === key) return setPop(null);
          const r = el.getBoundingClientRect();
          setPop({ key, left: Math.min(r.left, window.innerWidth - 300), top: r.bottom + 8 });
        }}
        onOpenSheet={() => setSheet(true)}
        onClearAll={clearAll}
      />
      {notice ? (
        <p className="sk-filter-notice" role="status">
          {notice}
        </p>
      ) : null}
      {Object.entries(state.selected).some(([, v]) => v?.length) ? (
        <ul className="sk-active-pills" aria-label="Active filters">
          {keys
            .concat(state.selected.application && !keys.includes('application') ? ['application'] : [])
            .flatMap((k) =>
              (state.selected[k] ?? []).map((v) => {
                const f = facetDef(k);
                const text = `${f.label}: ${f.display ? f.display(v, stones) : v}`;
                return (
                  <li key={`${k}-${v}`}>
                    <button
                      type="button"
                      className="sk-pill is-on"
                      aria-label={`Remove filter ${text}`}
                      onClick={() => toggle(k, v)}
                    >
                      {text} <Icon name="times" />
                    </button>
                  </li>
                );
              }),
            )}
        </ul>
      ) : null}
      {pop ? (
        <div
          ref={popRef}
          className="sk-popover"
          style={{ left: pop.left, top: pop.top }}
          role="group"
          aria-label={facetDef(pop.key).label}
        >
          <fieldset>
            <legend className="sr-only">{facetDef(pop.key).label}</legend>
            {options(pop.key)}
          </fieldset>
        </div>
      ) : null}
      {sheet ? (
        <FilterSheet
          keys={keys}
          options={options}
          resultCount={resultCount}
          total={total}
          onClear={clearAll}
          onClose={() => setSheet(false)}
        />
      ) : null}
    </div>
  );
}

function FilterSheet({
  keys,
  options,
  resultCount,
  total,
  onClear,
  onClose,
}: {
  keys: FacetKey[];
  options: (k: FacetKey) => React.ReactNode;
  resultCount: number;
  total: number;
  onClear: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useDialog(ref, true, onClose, { backCloses: true });
  return (
    <>
      <div className="sk-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        className="sk-panel sk-panel--filters"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sk-filters-title"
      >
        <div className="sk-panel-handle" aria-hidden="true" />
        <div className="sk-panel-head">
          <h2 id="sk-filters-title">Filters</h2>
          <button type="button" className="sk-icon-btn" aria-label="Close filters" onClick={onClose}>
            <Icon name="times" />
          </button>
        </div>
        <div className="sk-panel-body">
          {keys.map((k) => (
            <fieldset key={k} className="sk-filter-group">
              <legend>{facetDef(k).label}</legend>
              {options(k)}
            </fieldset>
          ))}
        </div>
        <div className="sk-panel-foot sk-filter-foot">
          <button type="button" className="sk-btn sk-btn--ghost" onClick={onClear} disabled={!total}>
            Clear all
          </button>
          <button type="button" className="sk-btn sk-btn--gold" onClick={onClose} data-autofocus="">
            Show {resultCount} {resultCount === 1 ? 'stone' : 'stones'}
          </button>
        </div>
      </div>
    </>
  );
}
