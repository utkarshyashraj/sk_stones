/**
 * "Help me choose": a short guided chooser that ends on /search with filters applied. Pure functions,
 * unit-tested (tests/unit/guide.test.ts).
 *
 * Step 1 (where) maps everyday places to the catalogue's application values. Steps 2 (colour) and 3
 * (Indian or imported) only appear once business-confirmed coverage of that field reaches the threshold
 * (80%), like the filters. A place whose application values match no stone is not offered.
 */
import { applyFilters, emptyState, paramsFromState, type FacetKey, type FilterStone } from './filters';

export interface WhereOption {
  key: string;
  label: string;
  /** application values (OR) this place stands for */
  apps: string[];
}

export const WHERE: WhereOption[] = [
  { key: 'kitchen', label: 'Kitchen', apps: ['Countertops & Kitchens'] },
  { key: 'flooring', label: 'Flooring', apps: ['Flooring'] },
  { key: 'bathroom', label: 'Bathroom', apps: ['Bathrooms'] },
  { key: 'wall', label: 'Wall / feature wall', apps: ['Wall Cladding', 'Walls & Partitions'] },
  { key: 'staircase', label: 'Staircase', apps: ['Staircases'] },
  {
    key: 'outdoor',
    label: 'Outdoor',
    apps: ['Paving & Pathways', 'Landscaping', 'Facades & Elevations', 'Roofing & Terraces'],
  },
];

export type StepKey = 'where' | 'colour' | 'origin';
export const STEP_FACET: Record<StepKey, FacetKey> = {
  where: 'application',
  colour: 'colour',
  origin: 'origin',
};

/** Places offered: those whose application values match at least one stone. */
export const whereOptions = (stones: FilterStone[]) =>
  WHERE.filter((w) => stones.some((s) => s.applications.some((a) => w.apps.includes(a))));

/** Steps to ask, given coverage shares per field. */
export function guideSteps(coverage: Record<string, number>, threshold: number): StepKey[] {
  const steps: StepKey[] = ['where'];
  if ((coverage.colourFamilies ?? 0) >= threshold) steps.push('colour');
  if ((coverage.origin ?? 0) >= threshold) steps.push('origin');
  return steps;
}

export type Answers = Partial<Record<StepKey, string[]>>;

const stateFor = (answers: Answers, steps: StepKey[], apps: Set<string>) => {
  const s = emptyState();
  for (const k of steps) {
    const v =
      k === 'where'
        ? WHERE.filter((w) => answers.where?.includes(w.key))
            .flatMap((w) => w.apps)
            .filter((a) => apps.has(a)) // only values the catalogue uses
        : answers[k];
    if (v?.length) s.selected[STEP_FACET[k]] = v;
  }
  return s;
};

export interface GuideResult {
  /** query string for /search */
  query: string;
  count: number;
  /** steps dropped to find matches, last first (empty when everything matched) */
  dropped: StepKey[];
}

/**
 * Filters for the answers. When nothing matches, the last answered step is dropped (and then the one
 * before) until something does; the dropped steps are reported so the page can say so.
 */
export function guideResult(stones: FilterStone[], answers: Answers, steps: StepKey[]): GuideResult {
  const apps = new Set(stones.flatMap((s) => s.applications));
  let used = steps.filter((k) => answers[k]?.length);
  const dropped: StepKey[] = [];
  let state = stateFor(answers, used, apps);
  let count = applyFilters(stones, state).length;
  while (!count && used.length > 1) {
    dropped.push(used.at(-1)!);
    used = used.slice(0, -1);
    state = stateFor(answers, used, apps);
    count = applyFilters(stones, state).length;
  }
  const p = paramsFromState(state, new URLSearchParams(), null);
  p.set('guide', '1');
  if (dropped.length) p.set('broadened', dropped.join(','));
  return { query: p.toString(), count, dropped };
}

export const STEP_LABEL: Record<StepKey, string> = {
  where: 'where it goes',
  colour: 'the colour',
  origin: 'Indian or imported',
};
