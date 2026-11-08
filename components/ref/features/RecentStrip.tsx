'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { openStoneHere, stoneHref, stonesById, stoneThumb, useIndex } from './index-client';
import { useRecent, recentStore } from './recent-store';

/**
 * "Recently viewed" strip, rendered into each `[data-sk-recent]` slot the page provides (/products and
 * product pages). Hidden until at least one stone has been opened in the viewer; "Clear" empties it.
 */
export function RecentStrips() {
  const [slots, setSlots] = useState<HTMLElement[]>([]);
  useEffect(() => {
    // After a client-side navigation this can render before the new page has committed.
    queueMicrotask(() => setSlots([...document.querySelectorAll<HTMLElement>('[data-sk-recent]')]));
  }, []);
  const ids = useRecent();
  const { index } = useIndex(ids.length > 0 && slots.length > 0);
  if (!ids.length || !index) return null;
  const stones = stonesById(index, ids);
  if (!stones.length) return null;
  return slots.map((slot) =>
    createPortal(
      <div className="sk-recent" role="region" aria-labelledby={`${slot.id || 'sk'}-recent-title`}>
        <div className="sk-recent-head">
          <h2 id={`${slot.id || 'sk'}-recent-title`}>Recently viewed</h2>
          <button type="button" className="sk-link-btn" onClick={() => recentStore.clear()}>
            Clear
          </button>
        </div>
        <ul>
          {stones.map((s) => {
            const thumb = stoneThumb(s);
            return (
              <li key={s.id}>
                <Link
                  href={stoneHref(s)}
                  prefetch={false}
                  onClick={(e) => openStoneHere(stoneHref(s)) && e.preventDefault()}
                >
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element -- pre-optimised thumbnail
                    <img src={thumb} alt="" width={96} height={96} loading="lazy" />
                  ) : (
                    <span className="sk-thumb-empty" aria-hidden="true" />
                  )}
                  <span>{s.n}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>,
      slot,
      slot.id || 'recent',
    ),
  );
}
