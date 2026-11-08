'use client';

import { useEffect, useState } from 'react';
import { Calculator } from './Calculator';
import { FEATURE_EVENT, type FeatureRequest } from './bus';
import { loadIndex } from './index-client';
import { FilterController } from './FilterController';
import { Guide } from './Guide';
import { LightboxController } from './LightboxController';
import { RecentStrips } from './RecentStrip';
import { SavedController } from './SavedController';
import { SavedPanel } from './SavedPanel';
import { SavedPill } from './SavedPill';
import { SearchOverlay } from './SearchOverlay';
import { Toaster } from './Toaster';

/**
 * Root of the lazily loaded feature bundle (see FeatureBoot): owns which feature overlay is open, and
 * replays any request or click that arrived before it loaded. Rendered at the end of the page wrapper, so
 * the scoped reference styles and styles/ref/features.css apply.
 */
export default function FeatureRoot() {
  const [open, setOpen] = useState<FeatureRequest | null>(null);

  useEffect(() => {
    const onRequest = (e: Event) => setOpen((e as CustomEvent<FeatureRequest>).detail);
    window.addEventListener(FEATURE_EVENT, onRequest);
    window.__skReady = true;
    const q = window.__skQueue;
    // Children's listeners are attached by now (their effects ran first); replay what arrived early.
    queueMicrotask(() => {
      const last = q?.requests.at(-1);
      if (last) setOpen(last);
      for (const el of q?.clicks ?? []) if (el.isConnected) (el as HTMLElement).click();
      if (q) q.requests = q.clicks = [];
    });
    // Hovering or focusing the search / saved icons starts loading the index, so it is ready on click.
    const prefetch = (e: Event) => {
      if ((e.target as Element | null)?.closest?.('[data-sk-prefetch]')) void loadIndex().catch(() => {});
    };
    document.addEventListener('pointerover', prefetch, { passive: true });
    document.addEventListener('focusin', prefetch);
    return () => {
      window.removeEventListener(FEATURE_EVENT, onRequest);
      document.removeEventListener('pointerover', prefetch);
      document.removeEventListener('focusin', prefetch);
    };
  }, []);

  const close = () => setOpen(null);
  return (
    <>
      <SavedController />
      <LightboxController />
      <FilterController />
      <SavedPill />
      <RecentStrips />
      {open?.name === 'saved' ? <SavedPanel onClose={close} /> : null}
      {open?.name === 'search' ? <SearchOverlay onClose={close} initial={open.detail?.q ?? ''} /> : null}
      {open?.name === 'guide' ? <Guide onClose={close} /> : null}
      {open?.name === 'calculator' ? <Calculator onClose={close} detail={open.detail} /> : null}
      <Toaster />
    </>
  );
}
