'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { track } from '@/lib/analytics';
import { openFeature } from './bus';
import { Icon } from './Icon';
import { collectionName, stoneHref, stonesById, stoneThumb, useIndex } from './index-client';
import { savedFormHref, savedWhatsappHref, shareUrl } from './saved-links';
import { pruneUnknown, savedStore, useSaved } from './shortlist-store';
import { showToast } from './toast-store';
import { useDialog } from './useDialog';

/**
 * The saved list: a side panel on desktop, a bottom sheet on phones. Lists every saved stone (photo,
 * name, collection, Remove) and sends the list on: quote form, WhatsApp, showroom visit, sample request, a shareable link; opens the
 * area calculator.
 * Clearing can be undone. Stones no longer in the catalogue are dropped with a notice.
 */
export function SavedPanel({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useDialog(ref, true, onClose);
  const saved = useSaved();
  const { index, error } = useIndex();

  useEffect(() => {
    if (!index) return;
    const [kept, dropped] = pruneUnknown(savedStore.get(), new Set(index.stones.map((s) => s.id)));
    if (dropped) {
      savedStore.set(kept);
      showToast(
        dropped === 1
          ? '1 saved stone is no longer in our catalogue and was removed.'
          : `${dropped} saved stones are no longer in our catalogue and were removed.`,
      );
    }
  }, [index]);

  const stones = index
    ? stonesById(
        index,
        saved.map((e) => e.id),
      )
    : [];
  const ids = saved.map((e) => e.id);

  const share = async () => {
    const url = shareUrl(ids);
    track('list_sent', { channel: 'share', count: ids.length });
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Stones I saved at S K Stones India', url });
        return;
      }
      await navigator.clipboard.writeText(url);
      showToast('Link copied — anyone with it can see these stones.');
    } catch {
      showToast(`Copy this link: ${url}`);
    }
  };
  const clear = () => {
    const before = savedStore.get();
    savedStore.clear();
    showToast('Saved list cleared', { label: 'Undo', run: () => savedStore.set(before) });
  };

  return (
    <>
      <div className="sk-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        className="sk-panel sk-panel--saved"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sk-saved-title"
      >
        <div className="sk-panel-handle" aria-hidden="true" />
        <div className="sk-panel-head">
          <h2 id="sk-saved-title">
            Saved stones <span className="sk-muted">({saved.length})</span>
          </h2>
          <button type="button" className="sk-icon-btn" aria-label="Close saved list" onClick={onClose}>
            <Icon name="times" />
          </button>
        </div>
        <div className="sk-panel-body">
          {!saved.length ? (
            <div className="sk-empty">
              <p>No saved stones yet.</p>
              <p className="sk-muted">
                Tap the bookmark on any stone to keep it here, then ask us for a quote in one step.
              </p>
              <Link className="sk-btn sk-btn--gold" href="/products" onClick={onClose}>
                Browse our stones
              </Link>
            </div>
          ) : error && !index ? (
            <p className="sk-muted">
              We couldn&apos;t load the stone details just now. Your list is safe; you can still ask for a
              quote.
            </p>
          ) : !index ? (
            <p className="sk-muted" aria-busy="true">
              Loading your stones…
            </p>
          ) : (
            <ul className="sk-saved-list">
              {stones.map((s) => {
                const thumb = stoneThumb(s);
                return (
                  <li key={s.id} className="sk-saved-row">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element -- pre-optimised thumbnail
                      <img src={thumb} alt="" width={64} height={64} loading="lazy" />
                    ) : (
                      <span className="sk-thumb-empty" aria-hidden="true" />
                    )}
                    <div className="sk-saved-text">
                      <Link href={stoneHref(s)} onClick={onClose} prefetch={false}>
                        {s.n}
                      </Link>
                      <span className="sk-muted">{collectionName(index, s.c)}</span>
                    </div>
                    <button
                      type="button"
                      className="sk-icon-btn"
                      aria-label={`Remove ${s.n}`}
                      onClick={() => {
                        const before = savedStore.get();
                        savedStore.remove(s.id);
                        track('stone_unsaved', { id: s.id, where: 'saved-list' });
                        showToast(`Removed ${s.n}`, { label: 'Undo', run: () => savedStore.set(before) });
                      }}
                    >
                      <Icon name="trash" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {saved.length ? (
          <div className="sk-panel-foot">
            <Link
              className="sk-btn sk-btn--gold sk-btn--block"
              href={savedFormHref('quote')}
              onClick={() => {
                track('list_sent', { channel: 'quote', count: ids.length });
                onClose();
              }}
            >
              Get a quote for these
            </Link>
            <div className="sk-btn-row">
              <a
                className="sk-btn sk-btn--wa"
                href={index ? savedWhatsappHref(index, stones) : '#'}
                aria-disabled={!index}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!index) e.preventDefault();
                  else track('list_sent', { channel: 'whatsapp', count: ids.length });
                }}
              >
                <Icon name="whatsapp" /> Send on WhatsApp
              </a>
              <Link
                className="sk-btn sk-btn--ghost"
                href={savedFormHref('visit')}
                onClick={() => {
                  track('list_sent', { channel: 'visit', count: ids.length });
                  onClose();
                }}
              >
                Plan a showroom visit
              </Link>
            </div>
            <div className="sk-btn-row">
              <Link
                className="sk-btn sk-btn--ghost"
                href={savedFormHref('samples')}
                onClick={() => {
                  track('list_sent', { channel: 'samples', count: ids.length });
                  onClose();
                }}
              >
                Request samples
              </Link>
              <button
                type="button"
                className="sk-btn sk-btn--ghost"
                onClick={() => openFeature('calculator', { saved: '1' })}
              >
                <Icon name="calculator" /> Calculate area
              </button>
            </div>
            <div className="sk-btn-row sk-btn-row--quiet">
              <button type="button" className="sk-link-btn" onClick={share}>
                <Icon name="share" /> Share list
              </button>
              <button type="button" className="sk-link-btn" onClick={clear}>
                <Icon name="trash" /> Clear list
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
