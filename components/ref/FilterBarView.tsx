import { facetDef, SORTS, type FacetKey, type FilterState, type SortKey } from '@/lib/filters';
import { Icon as Fa } from './features/Icon';

/**
 * The filter bar's markup, shared by the server (rendered immediately, at its final size) and the
 * client panel that replaces it once the feature bundle loads. Pure: no state, handlers optional.
 *  - desktop: search-within field, one chip per available facet, sort, "Clear all";
 *  - phones: search-within field, a "Filters (n)" button (when facets exist) and sort.
 */
export function FilterBarView({
  keys,
  state,
  label,
  showSearch = true,
  openKey = null,
  onQuery,
  onSort,
  onChip,
  onOpenSheet,
  onClearAll,
  activeTotal = 0,
}: {
  keys: FacetKey[];
  state: FilterState;
  /** e.g. "Granites" → placeholder "Search within Granites" */
  label: string;
  showSearch?: boolean;
  openKey?: FacetKey | null;
  onQuery?: (q: string) => void;
  onSort?: (s: SortKey) => void;
  onChip?: (k: FacetKey, el: HTMLElement) => void;
  onOpenSheet?: () => void;
  onClearAll?: () => void;
  activeTotal?: number;
}) {
  const facetActive = keys.reduce((n, k) => n + (state.selected[k]?.length ?? 0), 0);
  return (
    <div className="sk-filterbar" role="search" aria-label={`Filter ${label}`}>
      {showSearch ? (
        <div className="sk-filter-search">
          <Fa name="search" />
          <input
            type="search"
            name="q"
            placeholder={`Search within ${label}`}
            aria-label={`Search within ${label}`}
            autoComplete="off"
            maxLength={120}
            value={onQuery ? state.q : undefined}
            onChange={onQuery ? (e) => onQuery(e.target.value) : undefined}
          />
        </div>
      ) : null}
      {keys.length ? (
        <div className="sk-filter-chips">
          {keys.map((k) => {
            const n = state.selected[k]?.length ?? 0;
            return (
              <button
                key={k}
                type="button"
                className={`sk-chip-btn${n ? ' is-active' : ''}`}
                data-sk-chip={k}
                aria-haspopup="true"
                aria-expanded={openKey === k}
                onClick={onChip ? (e) => onChip(k, e.currentTarget) : undefined}
              >
                {facetDef(k).label}
                {n ? <span className="sk-chip-count">{n}</span> : null}
                <Fa name="chevron-down" />
              </button>
            );
          })}
        </div>
      ) : null}
      {keys.length ? (
        <button type="button" className="sk-filter-open" data-sk-sheet="" onClick={onOpenSheet}>
          <Fa name="sliders" /> Filters{facetActive ? ` (${facetActive})` : ''}
        </button>
      ) : null}
      <label className="sk-sort">
        <span className="sr-only">Sort stones</span>
        <select
          value={onSort ? state.sort : undefined}
          defaultValue={onSort ? undefined : 'reference'}
          onChange={onSort ? (e) => onSort(e.target.value as SortKey) : undefined}
          aria-label="Sort stones"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      {activeTotal ? (
        <button type="button" className="sk-link-btn sk-filter-clear" onClick={onClearAll}>
          Clear all
        </button>
      ) : null}
    </div>
  );
}
