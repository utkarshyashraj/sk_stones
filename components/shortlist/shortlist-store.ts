'use client';

import { useCallback, useSyncExternalStore } from 'react';

export interface ShortlistItem {
  id: string;
  name: string;
  collectionName: string;
  /** URL of a small thumbnail (400w WebP) or null when the product has no photo. */
  thumb: string | null;
}

const KEY = 'sk-shortlist-v1';
const EMPTY: ShortlistItem[] = [];
let cache: ShortlistItem[] | null = null;
const listeners = new Set<() => void>();

function read(): ShortlistItem[] {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    cache = Array.isArray(parsed)
      ? (parsed.filter((x) => x && typeof x.id === 'string') as ShortlistItem[])
      : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: ShortlistItem[]) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable (private mode): keep in memory for this tab */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
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

export const MAX_SHORTLIST = 30;

export function useShortlist() {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);
  const has = useCallback((id: string) => items.some((i) => i.id === id), [items]);
  const toggle = useCallback((item: ShortlistItem) => {
    const current = read();
    if (current.some((i) => i.id === item.id)) write(current.filter((i) => i.id !== item.id));
    else if (current.length < MAX_SHORTLIST) write([...current, item]);
  }, []);
  const remove = useCallback((id: string) => write(read().filter((i) => i.id !== id)), []);
  const clear = useCallback(() => write([]), []);
  return { items, has, toggle, remove, clear, count: items.length };
}

/** Open/close signal for the shortlist drawer, shared across header, bottom nav and cards. */
const drawerListeners = new Set<() => void>();
let drawerOpen = false;
export function setShortlistOpen(open: boolean) {
  drawerOpen = open;
  drawerListeners.forEach((l) => l());
}
export function useShortlistOpen() {
  return useSyncExternalStore(
    (l) => {
      drawerListeners.add(l);
      return () => drawerListeners.delete(l);
    },
    () => drawerOpen,
    () => false,
  );
}
