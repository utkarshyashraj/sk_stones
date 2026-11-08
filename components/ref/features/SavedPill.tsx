'use client';

import { Fa } from '../Fa';
import { openFeature } from './bus';
import { useSaved } from './shortlist-store';

/**
 * Phones and tablets: after the first save, a "Saved (N)" pill floats above the bottom bar and opens the
 * list. CSS hides it on desktop and while any sheet, the viewer or search is open (data-sk-overlay).
 */
export function SavedPill() {
  const n = useSaved().length;
  if (!n) return null;
  return (
    <button type="button" className="sk-saved-pill" onClick={() => openFeature('saved')}>
      <Fa name="bookmark-solid" /> Saved ({n})
    </button>
  );
}
