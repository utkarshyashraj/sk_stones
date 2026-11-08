'use client';

import Link from 'next/link';
import { parseIds } from '@/lib/shared-ids';
import { Icon } from './Icon';
import { useClientValue } from '../useClient';
import { collectionName, stoneHref, stonesById, stoneThumb, useIndex } from './index-client';
import { saveAll } from './saved-actions';
import { useSaved } from './shortlist-store';
import { showToast } from './toast-store';

/**
 * /saved?ids=… — a read-only list someone shared: each stone with its photo and collection, a link to it,
 * and "Save all" to copy them into this visitor's own saved list. Unknown ids are skipped with a note.
 */
export function SharedList() {
  const search = useClientValue(() => window.location.search, '');
  const ids = parseIds(search);
  const { index, error } = useIndex(ids.length > 0);
  const saved = useSaved();
  const stones = index ? stonesById(index, ids) : [];
  const missing = index ? ids.length - stones.length : 0;
  const allSaved = stones.length > 0 && stones.every((s) => saved.some((e) => e.id === s.id));

  if (!ids.length)
    return (
      <div className="sk-empty sk-empty--page">
        <p>This link doesn&apos;t contain any stones.</p>
        <Link className="btn btn-primary" href="/products">
          Explore our collection
        </Link>
      </div>
    );
  if (error && !index)
    return <p className="sk-muted sk-center">We couldn&apos;t load these stones. Please try again.</p>;
  if (!index)
    return (
      <p className="sk-muted sk-center" aria-busy="true">
        Loading stones…
      </p>
    );
  return (
    <>
      <div className="sk-shared-actions">
        <button
          type="button"
          className="btn btn-primary"
          disabled={allSaved}
          onClick={() => {
            const n = saveAll(stones.map((s) => s.id));
            showToast(n ? `Saved ${n} ${n === 1 ? 'stone' : 'stones'} to your list` : 'Already in your list');
          }}
        >
          <Icon name="bookmark" /> {allSaved ? 'All saved' : `Save all ${stones.length}`}
        </button>
        {missing ? (
          <p className="sk-muted">
            {missing} {missing === 1 ? 'stone is' : 'stones are'} no longer in our catalogue.
          </p>
        ) : null}
      </div>
      <div className="product-grid sk-shared-grid">
        {stones.map((s) => {
          const thumb = stoneThumb(s);
          return (
            <Link
              key={s.id}
              href={stoneHref(s)}
              className="product-item product-item-clickable sk-shared-item"
            >
              <div className="product-item-image">
                {/* eslint-disable-next-line @next/next/no-img-element -- pre-optimised thumbnail */}
                {thumb ? <img src={thumb} alt={s.n} loading="lazy" /> : null}
              </div>
              <div className="product-item-info">
                <h4>{s.n}</h4>
                <p className="sk-muted">{collectionName(index, s.c)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
