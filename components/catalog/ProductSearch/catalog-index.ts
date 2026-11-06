'use client';

import type { ClientProduct } from '@/lib/types';

export interface CatalogIndex {
  products: ClientProduct[];
  names: Record<string, string>;
  order: string[];
}

let pending: Promise<CatalogIndex> | null = null;

/** Loads the static product index (/data/catalog.json, generated at build time) once per session. */
export function loadCatalogIndex(): Promise<CatalogIndex> {
  if (!pending) {
    pending = fetch('/data/catalog.json')
      .then((r) => {
        if (!r.ok) throw new Error(`catalog index ${r.status}`);
        return r.json() as Promise<CatalogIndex>;
      })
      .catch((e) => {
        pending = null;
        throw e;
      });
  }
  return pending;
}
