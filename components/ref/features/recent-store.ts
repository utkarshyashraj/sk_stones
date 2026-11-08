'use client';

import { useSyncExternalStore } from 'react';

/**
 * Recently viewed stones: the last 12 stones opened in the viewer, newest first. Ids only
 * (localStorage `sk-recent-v1`); names and photos come from the catalogue. Works in memory when storage
 * is blocked; tabs stay in sync through the `storage` event.
 */
export const RECENT_KEY = 'sk-recent-v1';
export const MAX_RECENT = 12;

export function parseRecent(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return [...new Set(v.filter((x): x is string => typeof x === 'string' && x.length > 0))].slice(
      0,
      MAX_RECENT,
    );
  } catch {
    return [];
  }
}

/** Move (or add) an id to the front, keeping at most MAX_RECENT. */
export const pushRecent = (list: string[], id: string) =>
  [id, ...list.filter((x) => x !== id)].slice(0, MAX_RECENT);

const EMPTY: string[] = [];
let cache: string[] | null = null;
const listeners = new Set<() => void>();

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
function read(): string[] {
  if (cache) return cache;
  try {
    cache = parseRecent(storage()?.getItem(RECENT_KEY) ?? null);
  } catch {
    cache = [];
  }
  return cache;
}
function write(next: string[]) {
  cache = next;
  try {
    const s = storage();
    if (next.length) s?.setItem(RECENT_KEY, JSON.stringify(next));
    else s?.removeItem(RECENT_KEY);
  } catch {
    /* memory only */
  }
  listeners.forEach((l) => l());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === RECENT_KEY || e.key === null) {
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

export const recentStore = {
  get: read,
  subscribe,
  add(id: string) {
    const cur = read();
    if (cur[0] !== id) write(pushRecent(cur, id));
  },
  set: (list: string[]) => write(list.slice(0, MAX_RECENT)),
  clear: () => write([]),
};

export const useRecent = () => useSyncExternalStore(subscribe, read, () => EMPTY);
