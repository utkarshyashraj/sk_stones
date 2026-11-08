'use client';

import { Fa } from '../Fa';
import { toggleSaved } from './saved-actions';
import { useSaved } from './shortlist-store';

/** "Save" / "Saved" toggle for one stone (aria-pressed), used in the viewer and on the shared-list page. */
export function SaveButton({
  id,
  name,
  where,
  className = 'sk-btn sk-btn--ghost',
}: {
  id: string;
  name: string;
  where: string;
  className?: string;
}) {
  const saved = useSaved().some((e) => e.id === id);
  return (
    <button
      type="button"
      className={`${className}${saved ? ' is-saved' : ''}`}
      aria-pressed={saved}
      aria-label={saved ? `Saved: ${name}. Remove from saved list` : `Save ${name}`}
      onClick={(e) => {
        e.stopPropagation();
        toggleSaved(id, name, where);
      }}
    >
      <Fa name={saved ? 'bookmark-solid' : 'bookmark'} /> {saved ? 'Saved' : 'Save'}
    </button>
  );
}
