'use client';

import { useSyncExternalStore } from 'react';
import { withBase } from '@/lib/base-path';
import { imageUrl } from '@/lib/image-url';
import type { IndexStone, SearchIndex } from '@/lib/search-index';

/**
 * Loads /data/search-index.json once per visit (started on first use, or when the search/saved icons are
 * hovered or focused). Failed loads can be retried; the state is shared by every feature.
 */
type State = { index: SearchIndex | null; error: boolean };
let state: State = { index: null, error: false };
let pending: Promise<SearchIndex> | null = null;
const listeners = new Set<() => void>();
const set = (s: State) => {
  state = s;
  listeners.forEach((l) => l());
};

export function loadIndex(): Promise<SearchIndex> {
  if (state.index) return Promise.resolve(state.index);
  if (!pending) {
    pending = fetch(withBase('/data/search-index.json'))
      .then((r) => {
        if (!r.ok) throw new Error(`search index ${r.status}`);
        return r.json() as Promise<SearchIndex>;
      })
      .then((index) => {
        set({ index, error: false });
        return index;
      })
      .catch((e) => {
        pending = null;
        set({ index: null, error: true });
        throw e;
      });
  }
  return pending;
}

const EMPTY: State = { index: null, error: false };
export function useIndex(load = true): State {
  const s = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => EMPTY,
  );
  if (load && !s.index && !s.error && !pending) void loadIndex().catch(() => {});
  return s;
}

// ---------- helpers over index stones ----------
export const stoneHref = (s: Pick<IndexStone, 'id' | 'c'>) => `/${s.c}#stone=${s.id}`;
export const stoneThumb = (s: Pick<IndexStone, 'img'>) => (s.img ? imageUrl(s.img[0], s.img[1]) : null);
export function collectionName(index: SearchIndex, slug: string) {
  return index.collections.find((c) => c.s === slug)?.n ?? slug;
}
export function stonesById(index: SearchIndex, ids: string[]): IndexStone[] {
  const map = new Map(index.stones.map((s) => [s.id, s]));
  return ids.map((id) => map.get(id)).filter((s): s is IndexStone => Boolean(s));
}
