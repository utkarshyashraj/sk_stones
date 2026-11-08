import { describe, expect, it } from 'vitest';
import { closestCollection, editDistance, normalize, search, tokenize, wordScore } from '@/lib/search';
import { buildSearchIndex } from '@/lib/search-index';

const index = buildSearchIndex();
const topNames = (q: string, n = 5) =>
  search(index, q)
    .stones.slice(0, n)
    .map((h) => h.item.n);

describe('normalising', () => {
  it('folds case, accents, gray/grey, color/colour and the reference spelling "Quatrz"', () => {
    expect(normalize('Crème GRAY Quatrz & Co.')).toBe('creme grey quartz and co');
    expect(normalize('Color')).toBe('colour');
    expect(tokenize('  ')).toEqual([]);
    expect(tokenize('x'.repeat(500)).join('').length).toBeLessThanOrEqual(200);
  });
  it('edit distance stops early past the limit and counts transpositions as one', () => {
    expect(editDistance('travertne', 'travertine', 2)).toBe(1);
    expect(editDistance('calcatta', 'calacatta', 2)).toBe(1);
    expect(editDistance('abcd', 'bacd', 1)).toBe(1);
    expect(editDistance('granite', 'marble', 1)).toBe(2);
  });
  it('typo allowance: none under 4 letters, 1 for 4–7, 2 for 8+', () => {
    expect(wordScore('tan', 'tab')).toBe(0);
    expect(wordScore('black', 'blak')).toBeGreaterThan(0);
    expect(wordScore('calacata', 'calacatta')).toBeGreaterThan(0);
    expect(wordScore('kota', 'kotah')).toBeGreaterThan(0.8); // prefix
  });
});

describe('search over the real catalogue', () => {
  it('"travertne" finds travertines', () => {
    expect(topNames('travertne').some((n) => /travertine/i.test(n))).toBe(true);
  });
  it('"calacata" finds calacatta stones', () => {
    expect(topNames('calacata').some((n) => /calacatta/i.test(n))).toBe(true);
  });
  it('"black granite" ranks black granites first', () => {
    const top = search(index, 'black granite').stones.slice(0, 5);
    expect(top.length).toBeGreaterThan(0);
    for (const h of top)
      expect(h.item.n.toLowerCase() + ' ' + h.item.col.join(' ').toLowerCase()).toMatch(/black/);
    // granites dominate; a stone named "Black Granite …" in another collection may lead on its name alone
    expect(top.filter((h) => /granite/.test(h.item.c)).length).toBeGreaterThanOrEqual(4);
  });
  it('"quartz" and "Quatrz" both find the quartz collection and its stones', () => {
    for (const q of ['quartz', 'Quatrz']) {
      const r = search(index, q);
      expect(r.collections[0]?.item.s).toBe('quatrz-surfaces');
      expect(r.stones.some((h) => h.item.c === 'quatrz-surfaces')).toBe(true);
    }
  });
  it('accents and grey/gray match the same stones', () => {
    expect(search(index, 'gray').stones.length).toBe(search(index, 'grey').stones.length);
    expect(topNames('crème').length).toBe(topNames('creme').length);
  });
  it('finds services, applications and projects', () => {
    expect(search(index, 'landscap').services[0]?.item.s).toBe('landscaping');
    expect(search(index, 'flooring').applications[0]?.item.v).toBe('Flooring');
    expect(search(index, 'marriott').projects[0]?.item.id).toBe('project-jw-marriott');
  });
  it('a whole-name prefix wins ("tan br" → Tan Brown)', () => {
    expect(topNames('tan br', 1)[0]).toBe('Tan Brown');
  });
  it('nonsense finds nothing but still suggests a collection when one is close', () => {
    expect(search(index, 'zzqqxx').total).toBe(0);
    expect(closestCollection(index, 'marbel tiles')?.n).toMatch(/Marble|Tiles/);
  });
  it('emoji, symbols and very long input never throw', () => {
    expect(() => search(index, '🙂🙂 <script> %%% ' + 'a'.repeat(1000))).not.toThrow();
  });
});
