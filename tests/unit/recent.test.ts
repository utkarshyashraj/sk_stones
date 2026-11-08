import { describe, expect, it } from 'vitest';
import { MAX_RECENT, parseRecent, pushRecent } from '@/components/ref/features/recent-store';

describe('recently viewed', () => {
  it('keeps newest first, without duplicates, at most 12', () => {
    let list: string[] = [];
    for (let i = 0; i < 15; i++) list = pushRecent(list, `s${i}`);
    expect(list).toHaveLength(MAX_RECENT);
    expect(list[0]).toBe('s14');
    list = pushRecent(list, 's10');
    expect(list[0]).toBe('s10');
    expect(list.filter((x) => x === 's10')).toHaveLength(1);
  });
  it('reads stored data defensively', () => {
    expect(parseRecent(null)).toEqual([]);
    expect(parseRecent('not json')).toEqual([]);
    expect(parseRecent('{"a":1}')).toEqual([]);
    expect(parseRecent('["a", 3, "", "a", "b"]')).toEqual(['a', 'b']);
  });
});
