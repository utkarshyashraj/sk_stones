'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * A value that only exists in the browser (an element to portal into, a URL flag). Renders `server` during
 * prerender/hydration, then the browser value — without a setState-in-effect round trip.
 */
export function useClientValue<T>(get: () => T, server: T): T {
  return useSyncExternalStore(subscribe, get, () => server);
}

export const usePortalRoot = () =>
  useClientValue<Element | null>(() => document.querySelector('[data-ref-root]'), null);

export const useSearchFlag = (name: string, value: string) =>
  useClientValue(() => new URLSearchParams(window.location.search).get(name) === value, false);
