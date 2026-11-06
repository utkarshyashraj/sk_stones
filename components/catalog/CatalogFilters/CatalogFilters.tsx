'use client';

import { useState } from 'react';
import { FACET_LABELS, type FacetKey, type FilterState } from '@/lib/search';
import styles from './CatalogFilters.module.css';

interface Props {
  facets: FacetKey[];
  counts: Record<FacetKey, Map<string, number>>;
  state: FilterState;
  labelFor: (facet: FacetKey, value: string) => string;
  orderFor: (facet: FacetKey, values: string[]) => string[];
  onToggle: (facet: FacetKey, value: string) => void;
  onClear: () => void;
  activeCount: number;
  idPrefix: string;
}

const VISIBLE = 8;

export function CatalogFilters({
  facets,
  counts,
  state,
  labelFor,
  orderFor,
  onToggle,
  onClear,
  activeCount,
  idPrefix,
}: Props) {
  const [expanded, setExpanded] = useState<Partial<Record<FacetKey, boolean>>>({});

  return (
    <div className={styles.filters}>
      <div className={styles.head}>
        <h2 className={styles.title}>Filter stones</h2>
        <button type="button" className={styles.clear} onClick={onClear} disabled={activeCount === 0}>
          Clear all
        </button>
      </div>
      {facets.map((facet) => {
        const values = orderFor(
          facet,
          [...counts[facet].entries()].filter(([v, n]) => n > 0 || state[facet].includes(v)).map(([v]) => v),
        );
        if (values.length < 2 && !state[facet].length) return null;
        const showAll = expanded[facet] || values.length <= VISIBLE + 2;
        const shown = showAll ? values : values.slice(0, VISIBLE);
        return (
          <fieldset key={facet} className={styles.group}>
            <legend className={styles.legend}>{FACET_LABELS[facet]}</legend>
            <ul className={styles.options}>
              {shown.map((v) => {
                const id = `${idPrefix}-${facet}-${v}`.replace(/[^a-zA-Z0-9_-]/g, '-');
                const checked = state[facet].includes(v);
                return (
                  <li key={v}>
                    <input
                      id={id}
                      type="checkbox"
                      className={styles.checkbox}
                      checked={checked}
                      onChange={() => onToggle(facet, v)}
                    />
                    <label htmlFor={id} className={styles.option}>
                      <span>{labelFor(facet, v)}</span>
                      <span className={styles.count}>{counts[facet].get(v) ?? 0}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
            {values.length > VISIBLE + 2 ? (
              <button
                type="button"
                className={styles.more}
                aria-expanded={showAll}
                onClick={() => setExpanded((e) => ({ ...e, [facet]: !showAll }))}
              >
                {showAll ? 'Show fewer' : `Show all ${values.length}`}
              </button>
            ) : null}
          </fieldset>
        );
      })}
    </div>
  );
}
