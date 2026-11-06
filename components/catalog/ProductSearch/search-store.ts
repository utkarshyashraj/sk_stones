'use client';

import { useSyncExternalStore } from 'react';

let open = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const openSearch = () => {
  open = true;
  emit();
};
export const closeSearch = () => {
  open = false;
  emit();
};
export const useSearchOpen = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => open,
    () => false,
  );
