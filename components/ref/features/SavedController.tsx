'use client';

import { useEffect } from 'react';
import { openFeature, type FeatureName } from './bus';
import { toggleSaved } from './saved-actions';
import { useSaved } from './shortlist-store';

/**
 * Brings the server-rendered saved-list controls to life without re-rendering the page:
 *  - every Save toggle (`[data-save-id]`, on product cards) reflects and changes the list;
 *  - every count (`[data-sk-saved-count]`: header bookmark, More tab badge, More sheet entry) shows it;
 *  - `[data-sk-open="<feature>"]` controls (header icons, sheet entries) open that feature.
 */
export function SavedController() {
  const saved = useSaved();

  useEffect(() => {
    const ids = new Set(saved.map((e) => e.id));
    document.querySelectorAll<HTMLElement>('[data-save-id]').forEach((b) => {
      const on = ids.has(b.dataset.saveId!);
      const name = b.dataset.saveName ?? 'this stone';
      b.setAttribute('aria-pressed', String(on));
      b.setAttribute('aria-label', on ? `Saved: ${name}. Remove from saved list` : `Save ${name}`);
      b.classList.toggle('is-saved', on);
    });
    document.querySelectorAll<HTMLElement>('[data-sk-saved-count]').forEach((el) => {
      el.textContent = String(saved.length);
      el.dataset.count = String(saved.length);
    });
  }, [saved]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Element | null;
      const save = t?.closest?.<HTMLElement>('[data-save-id]');
      if (save) {
        e.preventDefault();
        e.stopPropagation();
        toggleSaved(save.dataset.saveId!, save.dataset.saveName ?? 'stone', save.dataset.saveWhere ?? 'card');
        return;
      }
      const opener = t?.closest?.<HTMLElement>('[data-sk-open]');
      if (opener) {
        e.preventDefault();
        const detail = Object.fromEntries(new URLSearchParams(opener.dataset.skDetail ?? ''));
        openFeature(opener.dataset.skOpen as FeatureName, detail);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}
