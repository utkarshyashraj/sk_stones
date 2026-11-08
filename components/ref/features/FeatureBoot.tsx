'use client';

import { lazy, Suspense, useEffect, useState } from 'react';
import { FEATURE_EVENT, type FeatureRequest } from './bus';

// Everything interactive that is not needed for first paint (saved list, search, filters, lightbox,
// calculator, guide) lives in this one lazily loaded bundle, so pages ship no extra JavaScript up front.
// React.lazy (already part of React) rather than next/dynamic, whose loader would add to every page.
const FeatureRoot = lazy(() => import('./FeatureRoot'));

/** Requests and clicks that arrive before the bundle has loaded, replayed by FeatureRoot. */
export interface BootQueue {
  requests: FeatureRequest[];
  clicks: Element[];
}
declare global {
  interface Window {
    __skQueue?: BootQueue;
    __skReady?: boolean;
  }
}

/**
 * Loads the feature bundle when the browser is idle (at most ~2.5 s after load) or at the first sign of
 * intent — a pointer, key press or focus — whichever comes first. A click on a server-rendered control
 * marked [data-sk-click] (a Save button, a lightbox photo) before then is held and replayed, so nothing
 * the visitor does is lost.
 */
export function FeatureBoot() {
  // After a client-side navigation the bundle is already loaded: mount straight away.
  const [ready, setReady] = useState(() => typeof window !== 'undefined' && Boolean(window.__skReady));
  useEffect(() => {
    const q: BootQueue = (window.__skQueue ??= { requests: [], clicks: [] });
    const go = () => setReady(true);
    const onIntent = () => go();
    const onHover = (e: Event) => {
      if ((e.target as Element | null)?.closest?.('[data-sk-prefetch]')) go();
    };
    // "/" opens search from anywhere (not while typing), before or after the bundle has loaded.
    const onSlash = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      if ((e.target as Element | null)?.closest?.('input, textarea, select, [contenteditable="true"]'))
        return;
      e.preventDefault();
      window.dispatchEvent(new CustomEvent<FeatureRequest>(FEATURE_EVENT, { detail: { name: 'search' } }));
    };
    const onRequest = (e: Event) => {
      if (window.__skReady) return;
      q.requests.push((e as CustomEvent<FeatureRequest>).detail);
      go();
    };
    const onClick = (e: MouseEvent) => {
      if (window.__skReady) return;
      const el = (e.target as Element | null)?.closest?.('[data-sk-click]');
      if (!el) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      q.clicks.push(el);
      go();
    };
    const onKey = (e: KeyboardEvent) => {
      if (window.__skReady || (e.key !== 'Enter' && e.key !== ' ')) return;
      const el = (e.target as Element | null)?.closest?.('[data-sk-click]');
      if (!el || el instanceof HTMLButtonElement) return; // buttons turn Enter/Space into a click already
      e.preventDefault();
      q.clicks.push(el);
      go();
    };
    const opts = { passive: true, once: true } as const;
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
    const cic = window.cancelIdleCallback ?? window.clearTimeout;
    const idle = ric(go, { timeout: 2500 });
    window.addEventListener('pointerdown', onIntent, opts);
    window.addEventListener('keydown', onIntent, opts);
    window.addEventListener('focusin', onIntent, opts);
    window.addEventListener(FEATURE_EVENT, onRequest);
    document.addEventListener('pointerover', onHover, { passive: true });
    document.addEventListener('keydown', onSlash);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKey, true);
    return () => {
      cic(idle);
      window.removeEventListener('pointerdown', onIntent);
      window.removeEventListener('keydown', onIntent);
      window.removeEventListener('focusin', onIntent);
      window.removeEventListener(FEATURE_EVENT, onRequest);
      document.removeEventListener('pointerover', onHover);
      document.removeEventListener('keydown', onSlash);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKey, true);
    };
  }, []);
  return ready ? (
    <Suspense fallback={null}>
      <FeatureRoot />
    </Suspense>
  ) : null;
}
