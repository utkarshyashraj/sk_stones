'use client';

import { track } from '@/lib/analytics';
import { openFeature } from './bus';
import { MAX_SAVED, savedStore } from './shortlist-store';
import { showToast } from './toast-store';

/** Save or unsave one stone, with the toast (View list / Undo) and analytics, from anywhere. */
export function toggleSaved(id: string, name: string, where: string) {
  if (savedStore.has(id)) {
    const before = savedStore.get();
    savedStore.remove(id);
    track('stone_unsaved', { id, where });
    showToast(`Removed ${name}`, { label: 'Undo', run: () => savedStore.set(before) });
    return;
  }
  const r = savedStore.add(id);
  if (r === 'full') {
    showToast(`Your list is full (${MAX_SAVED} stones). Remove one to save another.`, {
      label: 'View list',
      run: () => openFeature('saved'),
    });
    return;
  }
  track('stone_saved', { id, where });
  const memory = savedStore.isMemoryOnly() ? ' (kept for this visit only)' : '';
  showToast(`Saved ${name}${memory}`, { label: 'View list', run: () => openFeature('saved') });
}

/** Save several stones at once ("Save all"); returns how many were added. */
export function saveAll(ids: string[]): number {
  let added = 0;
  for (const id of ids) if (savedStore.add(id) === 'added') added++;
  return added;
}
