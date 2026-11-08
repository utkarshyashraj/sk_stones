import { describe, expect, it } from 'vitest';
import type { FilterStone } from '@/lib/filters';
import { guideResult, guideSteps, whereOptions } from '@/lib/guide';

const stone = (id: string, over: Partial<FilterStone> = {}): FilterStone => ({
  id,
  name: id,
  c: 'granites',
  cn: 'Indian Granites',
  colours: [],
  finishes: [],
  applications: [],
  origin: null,
  thicknessesMm: [],
  formats: [],
  order: 0,
  ...over,
});
const stones = [
  stone('a', { applications: ['Flooring', 'Countertops & Kitchens'], colours: ['Black'], origin: 'India' }),
  stone('b', { applications: ['Flooring'], colours: ['White'], origin: 'Imported' }),
  stone('c', { applications: ['Paving & Pathways'], colours: ['Grey'], origin: 'India' }),
];

describe('guided chooser', () => {
  it('asks colour and origin only once their coverage reaches the threshold', () => {
    expect(guideSteps({}, 0.8)).toEqual(['where']);
    expect(guideSteps({ colourFamilies: 0.79, origin: 0.9 }, 0.8)).toEqual(['where', 'origin']);
    expect(guideSteps({ colourFamilies: 0.8, origin: 0.8 }, 0.8)).toEqual(['where', 'colour', 'origin']);
  });

  it('offers only places whose application values match some stone', () => {
    expect(whereOptions(stones).map((w) => w.key)).toEqual(['kitchen', 'flooring', 'outdoor']);
  });

  it('maps places to application values on /search', () => {
    const r = guideResult(stones, { where: ['outdoor'] }, ['where']);
    expect(r.count).toBe(1);
    const p = new URLSearchParams(r.query);
    expect(p.get('application')).toBe('Paving & Pathways'); // the only outdoor value these stones use
    expect(p.get('guide')).toBe('1');
    expect(p.has('broadened')).toBe(false);
  });

  it('combines steps and broadens by dropping the last one when nothing matches', () => {
    const steps = guideSteps({ colourFamilies: 1, origin: 1 }, 0.8);
    expect(guideResult(stones, { where: ['flooring'], colour: ['White'] }, steps).count).toBe(1);
    const r = guideResult(stones, { where: ['kitchen'], colour: ['White'], origin: ['Imported'] }, steps);
    expect(r.dropped).toEqual(['origin', 'colour']);
    expect(r.count).toBe(1);
    expect(new URLSearchParams(r.query).get('broadened')).toBe('origin,colour');
  });
});
