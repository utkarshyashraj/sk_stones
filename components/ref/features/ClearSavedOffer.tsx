'use client';

import { savedStore, useSaved } from './shortlist-store';

/** On /thank-you: offer to clear the saved list (never automatic — architects reuse lists). */
export function ClearSavedOffer() {
  const n = useSaved().length;
  if (!n) return null;
  return (
    <p className="sk-clear-offer">
      You have {n} saved {n === 1 ? 'stone' : 'stones'}.{' '}
      <button type="button" className="sk-link-btn" onClick={() => savedStore.clear()}>
        Clear saved list
      </button>
    </p>
  );
}
