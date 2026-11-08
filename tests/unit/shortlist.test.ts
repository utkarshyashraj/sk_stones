import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  addEntry,
  KEY,
  LEGACY_KEY,
  MAX_SAVED,
  parseStored,
  pruneUnknown,
  removeEntry,
} from '@/components/ref/features/shortlist-store';
import { parseIds } from '@/lib/shared-ids';

describe('saved list: pure helpers', () => {
  it('adds once, refuses duplicates and caps at 30', () => {
    let list = parseStored(null, null);
    let r;
    [list, r] = addEntry(list, 'a', 1);
    expect(r).toBe('added');
    [list, r] = addEntry(list, 'a', 2);
    expect(r).toBe('exists');
    for (let i = 0; i < 40; i++) [list] = addEntry(list, `s${i}`, i);
    expect(list).toHaveLength(MAX_SAVED);
    expect(addEntry(list, 'one-more')[1]).toBe('full');
  });
  it('removes and prunes ids no longer in the catalogue', () => {
    const list = [
      { id: 'a', at: 1 },
      { id: 'gone', at: 2 },
      { id: 'b', at: 3 },
    ];
    expect(removeEntry(list, 'a').map((e) => e.id)).toEqual(['gone', 'b']);
    const [kept, dropped] = pruneUnknown(list, new Set(['a', 'b']));
    expect(kept.map((e) => e.id)).toEqual(['a', 'b']);
    expect(dropped).toBe(1);
  });
  it('migrates the pre-port v1 list (which stored names) by id only', () => {
    const v1 = JSON.stringify([
      { id: 'granites-tan-brown', name: 'Tan Brown', collectionName: 'Granites', thumb: null },
      { id: 'granites-tan-brown', name: 'dupe' },
      { name: 'no id' },
    ]);
    expect(parseStored(null, v1, 99)).toEqual([{ id: 'granites-tan-brown', at: 99 }]);
    // a v2 list wins over any v1 leftovers
    expect(parseStored(JSON.stringify([{ id: 'x', at: 5 }]), v1)).toEqual([{ id: 'x', at: 5 }]);
  });
  it('survives corrupt storage', () => {
    expect(parseStored('{not json', '[1,2')).toEqual([]);
    expect(parseStored('"a string"', null)).toEqual([]);
  });
});

describe('saved list: browser store', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });
  const fakeWindow = (storage: Storage | (() => never)) => ({
    get localStorage() {
      if (typeof storage === 'function') return storage();
      return storage;
    },
    addEventListener: () => {},
    removeEventListener: () => {},
  });
  const memoryStorage = () => {
    const m = new Map<string, string>();
    return {
      getItem: (k: string) => m.get(k) ?? null,
      setItem: (k: string, v: string) => void m.set(k, v),
      removeItem: (k: string) => void m.delete(k),
      clear: () => m.clear(),
      key: () => null,
      length: 0,
      dump: m,
    };
  };
  it('persists ids only and converts v1 on first write', async () => {
    const s = memoryStorage();
    s.setItem(LEGACY_KEY, JSON.stringify([{ id: 'old', name: 'Old' }]));
    vi.stubGlobal('window', fakeWindow(s as unknown as Storage));
    const { savedStore } = await import('@/components/ref/features/shortlist-store');
    expect(savedStore.get().map((e) => e.id)).toEqual(['old']);
    expect(savedStore.add('new')).toBe('added');
    const stored = JSON.parse(s.getItem(KEY)!);
    expect(stored.map((e: { id: string }) => e.id)).toEqual(['old', 'new']);
    expect(Object.keys(stored[0]).sort()).toEqual(['at', 'id']);
    expect(s.getItem(LEGACY_KEY)).toBeNull();
  });
  it('keeps working in memory when storage is blocked', async () => {
    vi.stubGlobal(
      'window',
      fakeWindow(() => {
        throw new DOMException('blocked', 'SecurityError');
      }),
    );
    const { savedStore } = await import('@/components/ref/features/shortlist-store');
    expect(savedStore.add('a')).toBe('added');
    expect(savedStore.has('a')).toBe(true);
    expect(savedStore.isMemoryOnly()).toBe(true);
  });
});

describe('shared list links', () => {
  it('keeps valid, unique ids (max 30)', () => {
    expect(parseIds('?ids=a,b,a,,bad id,<x>,c-1')).toEqual(['a', 'b', 'c-1']);
    expect(parseIds('?ids=' + Array.from({ length: 40 }, (_, i) => `s${i}`).join(','))).toHaveLength(30);
    expect(parseIds('')).toEqual([]);
  });
});
