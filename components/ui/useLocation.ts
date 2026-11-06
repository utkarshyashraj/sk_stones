'use client';

import { useSyncExternalStore } from 'react';

/**
 * The URL (query string + hash) as an external store. Components derive UI state from it
 * (filters, open product) instead of copying it into React state, so links are always shareable.
 * Server snapshot is empty: the static HTML renders the default (unfiltered) view.
 */
const EVENT = 'sk:urlchange';

function subscribe(cb: () => void) {
  window.addEventListener('popstate', cb);
  window.addEventListener('hashchange', cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener('popstate', cb);
    window.removeEventListener('hashchange', cb);
    window.removeEventListener(EVENT, cb);
  };
}

export const useSearchString = () =>
  useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => '',
  );
export const useHash = () =>
  useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => '',
  );

/** Replace the current URL's query and/or hash without navigation, then notify subscribers. */
export function replaceUrl({ search, hash }: { search?: string; hash?: string }) {
  const s = search ?? window.location.search;
  const h = hash ?? window.location.hash;
  const url = `${window.location.pathname}${s && s !== '?' ? (s.startsWith('?') ? s : `?${s}`) : ''}${h && h !== '#' ? h : ''}`;
  if (url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
    window.history.replaceState(window.history.state, '', url);
    window.dispatchEvent(new Event(EVENT));
  }
}

const noop = () => () => {};
/** true after hydration on the client, false during prerender — without a setState-in-effect. */
export const useIsClient = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
