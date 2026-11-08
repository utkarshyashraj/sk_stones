import { describe, expect, it } from 'vitest';
import {
  activeCount,
  applyFilters,
  emptyState,
  facetCounts,
  paramsFromState,
  sortStones,
  stateFromParams,
  visibleFacets,
  type FilterStone,
} from '@/lib/filters';

const stone = (id: string, over: Partial<FilterStone> = {}): FilterStone => ({
  id,
  name: id,
  c: 'granites',
  cn: 'Indian Granites',
  colours: [],
  finishes: [],
  applications: ['Flooring'],
  origin: 'India',
  thicknessesMm: [],
  formats: [],
  order: 0,
  ...over,
});
const stones: FilterStone[] = [
  stone('Absolute Black', { colours: ['Black'], finishes: ['Polished'], order: 2 }),
  stone('Kashmir White', { colours: ['White'], finishes: ['Polished', 'Leather'], order: 0 }),
  stone('Tan Brown', { colours: ['Brown'], finishes: ['Leather'], order: 1 }),
  stone('Crema Marfil', { c: 'imported-marbles', cn: 'Imported Marbles', colours: ['Beige'], order: 3 }),
];

describe('facet visibility (data-driven)', () => {
  it('today: only Collection, and only where the page has two collections', () => {
    expect(visibleFacets(stones, {}, 0.8)).toEqual(['collection']);
    expect(visibleFacets(stones.slice(0, 3), {}, 0.8)).toEqual([]);
  });
  it('a facet appears automatically once its coverage crosses the threshold', () => {
    expect(visibleFacets(stones, { colourFamilies: 0.79 }, 0.8)).not.toContain('colour');
    expect(visibleFacets(stones, { colourFamilies: 0.8 }, 0.8)).toContain('colour');
    expect(visibleFacets(stones, { colourFamilies: 1, finishes: 0.95 }, 0.8)).toEqual([
      'collection',
      'colour',
      'finish',
    ]);
  });
  it('a covered facet with a single value on the page stays hidden', () => {
    expect(visibleFacets(stones, { origin: 1 }, 0.8)).not.toContain('origin'); // all "India"
  });
});

describe('filtering, counts, sorting', () => {
  it('ANDs facets and ORs values within a facet; search-within matches name words', () => {
    const s = { ...emptyState(), selected: { colour: ['Black', 'White'], finish: ['Leather'] } };
    expect(applyFilters(stones, s).map((x) => x.id)).toEqual(['Kashmir White']);
    expect(applyFilters(stones, { ...emptyState(), q: 'tan' }).map((x) => x.id)).toEqual(['Tan Brown']);
    expect(activeCount({ ...s, q: 'x' })).toBe(4);
  });
  it('counts each option against the other active filters and keeps zero options listed', () => {
    const s = { ...emptyState(), selected: { finish: ['Leather'] } };
    const counts = facetCounts(stones, s, ['colour', 'finish']);
    expect(counts.colour.get('White')).toBe(1);
    expect(counts.colour.get('Black')).toBe(0); // listed, would leave nothing
    expect(counts.finish.get('Polished')).toBe(2); // own facet ignores itself
  });
  it('sorts by reference order or name', () => {
    expect(sortStones(stones, 'reference').map((s) => s.order)).toEqual([0, 1, 2, 3]);
    expect(sortStones(stones, 'name-asc')[0]!.id).toBe('Absolute Black');
    expect(sortStones(stones, 'name-desc')[0]!.id).toBe('Tan Brown');
  });
});

describe('URL state', () => {
  it('round-trips and keeps unrelated parameters', () => {
    const s = { q: 'black', sort: 'name-desc' as const, selected: { collection: ['granites'] } };
    const p = paramsFromState(s, new URLSearchParams('keep=1'));
    expect(p.toString()).toBe('keep=1&q=black&collection=granites&sort=name-desc');
    const back = stateFromParams(p, stones, ['collection']);
    expect(back.state).toEqual(s);
    expect(back.dropped).toBe(0);
  });
  it('drops values the page does not offer and reports them', () => {
    const r = stateFromParams(
      new URLSearchParams('collection=granites,nope&colour=Black&sort=bogus'),
      stones,
      ['collection'],
    );
    expect(r.state.selected).toEqual({ collection: ['granites'] });
    expect(r.dropped).toBe(3); // "nope", the hidden colour facet, the bogus sort
  });
  it('accepts application from links (the guided chooser) even while its facet is hidden', () => {
    const r = stateFromParams(new URLSearchParams('application=Flooring'), stones, []);
    expect(r.state.selected).toEqual({ application: ['Flooring'] });
  });
});
