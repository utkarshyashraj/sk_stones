'use client';

import { useSyncExternalStore } from 'react';

/**
 * Saved stones ("shortlist"). Only ids and the time saved are stored (localStorage `sk-shortlist-v2`);
 * names, photos and links always come from the current catalogue, so a renamed stone never goes stale.
 * Lists saved by the pre-port site (`sk-shortlist-v1`, which also stored names) are converted by id.
 * Tabs stay in sync through the `storage` event; when storage is blocked (some private modes) the list
 * still works for the visit, in memory.
 */
export interface SavedEntry {
  id: string;
  at: number;
}
export const KEY = 'sk-shortlist-v2';
export const LEGACY_KEY = 'sk-shortlist-v1';
export const MAX_SAVED = 30;

// ---------- pure helpers (unit-tested) ----------
export function parseStored(raw: string | null, legacyRaw: string | null, now = Date.now()): SavedEntry[] {
  const fromJson = (s: string | null): unknown[] => {
    if (!s) return [];
    try {
      const v = JSON.parse(s) as unknown;
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  };
  const out: SavedEntry[] = [];
  const push = (id: unknown, at: unknown) => {
    if (typeof id !== 'string' || !id || out.some((e) => e.id === id) || out.length >= MAX_SAVED) return;
    out.push({ id, at: typeof at === 'number' ? at : now });
  };
  for (const e of fromJson(raw))
    if (e && typeof e === 'object') push((e as SavedEntry).id, (e as SavedEntry).at);
  if (!raw)
    for (const e of fromJson(legacyRaw)) if (e && typeof e === 'object') push((e as { id: unknown }).id, now);
  return out;
}

export type AddResult = 'added' | 'exists' | 'full';
export function addEntry(list: SavedEntry[], id: string, now = Date.now()): [SavedEntry[], AddResult] {
  if (list.some((e) => e.id === id)) return [list, 'exists'];
  if (list.length >= MAX_SAVED) return [list, 'full'];
  return [[...list, { id, at: now }], 'added'];
}
export const removeEntry = (list: SavedEntry[], id: string) => list.filter((e) => e.id !== id);
/** Drop ids no longer in the catalogue; returns the kept list and how many were dropped. */
export function pruneUnknown(list: SavedEntry[], known: Set<string>): [SavedEntry[], number] {
  const kept = list.filter((e) => known.has(e.id));
  return [kept, list.length - kept.length];
}

// ---------- browser store ----------
const EMPTY: SavedEntry[] = [];
let cache: SavedEntry[] | null = null;
let memoryOnly = false;
const listeners = new Set<() => void>();

function storage(): Storage | null {
  try {
    const s = window.localStorage;
    const probe = '__sk_probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    memoryOnly = true;
    return null;
  }
}

export function readSaved(): SavedEntry[] {
  if (cache) return cache;
  const s = storage();
  cache = s ? parseStored(s.getItem(KEY), s.getItem(LEGACY_KEY)) : [];
  return cache;
}

function write(next: SavedEntry[]) {
  cache = next;
  const s = storage();
  if (s) {
    try {
      s.setItem(KEY, JSON.stringify(next));
      s.removeItem(LEGACY_KEY); // converted on first write
    } catch {
      memoryOnly = true;
    }
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) {
      cache = null;
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export const savedStore = {
  get: readSaved,
  subscribe,
  isMemoryOnly: () => (readSaved(), memoryOnly),
  has: (id: string) => readSaved().some((e) => e.id === id),
  add(id: string): AddResult {
    const [next, r] = addEntry(readSaved(), id);
    if (r === 'added') write(next);
    return r;
  },
  remove(id: string) {
    write(removeEntry(readSaved(), id));
  },
  /** Replace the whole list (undo, "Save all", pruning). */
  set(list: SavedEntry[]) {
    write(list.slice(0, MAX_SAVED));
  },
  clear() {
    write([]);
  },
};

export function useSaved(): SavedEntry[] {
  return useSyncExternalStore(subscribe, readSaved, () => EMPTY);
}
