'use client';

import { useEffect, useState } from 'react';
import { FEATURE_EVENT, type FeatureRequest } from './bus';
import { LightboxController } from './LightboxController';
import { SavedController } from './SavedController';
import { SavedPanel } from './SavedPanel';
import { SavedPill } from './SavedPill';
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
    return () => window.removeEventListener(FEATURE_EVENT, onRequest);
  }, []);

  const close = () => setOpen(null);
  return (
    <>
      <SavedController />
      <LightboxController />
      <SavedPill />
      {open?.name === 'saved' ? <SavedPanel onClose={close} /> : null}
      <Toaster />
    </>
  );
}
