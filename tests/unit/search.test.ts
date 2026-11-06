import { describe, expect, it } from 'vitest';
import {
  activeFilterCount,
  applyFilters,
  emptyFilters,
  facetCounts,
  matchesQuery,
  normalize,
  paramsFromState,
  sortProducts,
  stateFromParams,
} from '@/lib/search';
import type { ClientProduct } from '@/lib/types';

const p = (over: Partial<ClientProduct>): ClientProduct => ({
  id: 'x',
  name: 'X',
  category: 'granites',
  subcategory: 'indian-granites',
  collection: 'indian-granites',
  img: null,
  colours: [],
  finish: null,
  applications: [],
  origin: null,
  size: null,
  tags: [],
  ...over,
});

const names = {
  granites: 'Granites',
  'indian-granites': 'Indian Granites',
  marbles: 'Marbles',
  'imported-marbles': 'Imported Marbles',
};
const products = [
  p({
    id: 'a',
    name: 'Absolute Black',
    colours: ['Black'],
    finish: 'Polished',
    origin: 'India',
    applications: ['Flooring'],
  }),
  p({
    id: 'b',
    name: 'Kashmir White',
    colours: ['White'],
    origin: 'India',
    applications: ['Flooring', 'Countertops & Kitchens'],
  }),
  p({
    id: 'c',
    name: 'Silver Travertine',
    category: 'marbles',
    subcategory: 'imported-marbles',
    collection: 'imported-marbles',
    colours: ['Silver'],
    origin: 'Imported',
    tags: ['Travertine'],
  }),
  p({ id: 'd', name: 'Steel Gray Leather Polished', colours: ['Grey'], finish: 'Leather' }),
];

describe('normalize', () => {
  it('lower-cases, strips punctuation and unifies gray/grey', () => {
    expect(normalize('Steel GRAY, Leather!')).toBe('steel grey leather');
  });
});

describe('matchesQuery', () => {
  it('matches every token against name, collection, colours, finish and tags', () => {
    expect(matchesQuery(products[0]!, 'black polished', names)).toBe(true);
    expect(matchesQuery(products[2]!, 'imported travertine', names)).toBe(true);
    expect(matchesQuery(products[0]!, 'black white', names)).toBe(false);
  });
  it('treats gray and grey as the same word and matches word prefixes', () => {
    expect(matchesQuery(products[3]!, 'grey', names)).toBe(true);
    expect(matchesQuery(products[3]!, 'leath', names)).toBe(true);
  });
  it('an empty query matches everything', () => {
    expect(products.every((x) => matchesQuery(x, '   ', names))).toBe(true);
  });
});

describe('applyFilters + facetCounts', () => {
  it('ANDs across facets and ORs within a facet', () => {
    const s = { ...emptyFilters(), colour: ['Black', 'White'], origin: ['India'] };
    expect(applyFilters(products, s, names).map((x) => x.id)).toEqual(['a', 'b']);
    expect(applyFilters(products, { ...s, finish: ['Polished'] }, names).map((x) => x.id)).toEqual(['a']);
  });
  it('counts each facet ignoring its own selection', () => {
    const s = { ...emptyFilters(), colour: ['Black'] };
    const counts = facetCounts(products, s, names);
    expect(counts.colour.get('White')).toBe(1); // own facet ignored
    expect(counts.finish.get('Polished')).toBe(1); // other facets respected
    expect(counts.finish.get('Leather')).toBeUndefined();
  });
  it('filters by category and collection', () => {
    expect(
      applyFilters(products, { ...emptyFilters(), category: ['marbles'] }, names).map((x) => x.id),
    ).toEqual(['c']);
    expect(
      applyFilters(products, { ...emptyFilters(), collection: ['indian-granites'] }, names),
    ).toHaveLength(3);
  });
});

describe('sortProducts', () => {
  it('keeps catalogue order for featured and sorts by name otherwise', () => {
    expect(sortProducts(products, 'featured').map((x) => x.id)).toEqual(['a', 'b', 'c', 'd']);
    expect(sortProducts(products, 'name-asc').map((x) => x.name)[0]).toBe('Absolute Black');
    expect(sortProducts(products, 'name-desc').map((x) => x.name)[0]).toBe('Steel Gray Leather Polished');
  });
});

describe('URL state', () => {
  it('round-trips through URLSearchParams', () => {
    const s = { ...emptyFilters(), q: 'black', colour: ['Black', 'Grey'], sort: 'name-desc' as const };
    const back = stateFromParams(paramsFromState(s));
    expect(back).toEqual(s);
    expect(activeFilterCount(back)).toBe(3);
  });
  it('ignores unknown sort values', () => {
    expect(stateFromParams(new URLSearchParams('sort=bogus')).sort).toBe('featured');
  });
});
