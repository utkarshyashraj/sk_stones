'use client';

import { useSyncExternalStore } from 'react';

/** Up to 5 recent searches (localStorage `sk-recent-searches`), newest first; silently memory-only if blocked. */
const KEY = 'sk-recent-searches';
const MAX = 5;
let cache: string[] | null = null;
const listeners = new Set<() => void>();
const EMPTY: string[] = [];

function read(): string[] {
  if (cache) return cache;
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) ?? '[]') as unknown;
    cache = Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').slice(0, MAX) : [];
  } catch {
    cache = [];
  }
  return cache;
}
function write(next: string[]) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // memory only
  }
  listeners.forEach((l) => l());
}

export function rememberSearch(q: string) {
  const t = q.trim().slice(0, 80);
  if (t.length < 2) return;
  write([t, ...read().filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, MAX));
}
export const clearRecentSearches = () => write([]);

export function useRecentSearches(): string[] {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    read,
    () => EMPTY,
  );
}
