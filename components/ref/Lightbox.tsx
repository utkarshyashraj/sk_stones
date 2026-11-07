'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Fa } from './Fa';
import { usePortalRoot } from './useClient';

const MAG_ZOOM = 2.6;
const lensSize = () => (window.innerWidth <= 768 ? 140 : 180);

export interface LightboxItem {
  /** File shown in the viewer. */
  src: string;
  /** Larger file for the magnifier lens. */
  zoom: string;
  /** Caption and alt text. */
  alt: string;
}

/**
 * The reference's fullscreen viewer for product grids and gallery grids: click (or Enter/Space on) an item
 * to open it; previous/next buttons, ← → keys and horizontal swipes step through the grid; a round lens
 * magnifies wherever the pointer or finger is (2.6×); Escape, ✕ or a click on the backdrop closes it and
 * focus returns to the item. `items` (from the server) are in the same order as the grid's elements.
 */
export function Lightbox({
  grid,
  item,
  items,
  magnifier = true,
}: {
  /** Grid container selector (e.g. ".product-grid"). */
  grid: string;
  /** Item selector inside the grid (e.g. ".product-item"). */
  item: string;
  items: LightboxItem[];
  magnifier?: boolean;
}) {
  const entries = items;
  const [index, setIndex] = useState<number | null>(null);
  const root = usePortalRoot();
  const frame = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const touch = useRef({ x: 0, y: 0, suppress: false, magnifying: false });

  // Make the server-rendered grid items open the viewer.
  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>(grid)].flatMap((g) => [
      ...g.querySelectorAll<HTMLElement>(item),
    ]);
    const cleanups = els.slice(0, items.length).map((el, i) => {
      el.classList.add('product-item-clickable');
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', `View ${items[i]!.alt} full screen`);
      const click = () => {
        opener.current = el;
        setIndex(i);
      };
      const key = (ev: KeyboardEvent) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          click();
        }
      };
      el.addEventListener('click', click);
      el.addEventListener('keydown', key);
      return () => {
        el.removeEventListener('click', click);
        el.removeEventListener('keydown', key);
      };
    });
    return () => cleanups.forEach((f) => f());
  }, [grid, item, items]);

  const open = index !== null;
  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (d: number) => setIndex((i) => (i === null ? i : (i + d + entries.length) % entries.length)),
    [entries.length],
  );

  const hideLens = useCallback(() => {
    touch.current.magnifying = false;
    lens.current?.classList.remove('is-visible');
    frame.current?.classList.remove('is-magnifying');
  }, []);
  const showLens = useCallback(
    (cx: number, cy: number) => {
      const l = lens.current;
      const img = imgRef.current;
      if (!l || !img || index === null) return;
      const r = img.getBoundingClientRect();
      const x = cx - r.left;
      const y = cy - r.top;
      if (!r.width || x < 0 || y < 0 || x > r.width || y > r.height) return hideLens();
      const size = lensSize();
      const half = size / 2;
      touch.current.magnifying = true;
      frame.current?.classList.add('is-magnifying');
      l.classList.add('is-visible');
      l.style.width = `${size}px`;
      l.style.height = `${size}px`;
      l.style.left = `${Math.max(8, Math.min(cx - half, window.innerWidth - size - 8))}px`;
      l.style.top = `${Math.max(8, Math.min(cy - half, window.innerHeight - size - 8))}px`;
      l.style.backgroundImage = `url("${entries[index]!.zoom}")`;
      l.style.backgroundRepeat = 'no-repeat';
      l.style.backgroundSize = `${r.width * MAG_ZOOM}px ${r.height * MAG_ZOOM}px`;
      l.style.backgroundPosition = `${-(x * MAG_ZOOM - half)}px ${-(y * MAG_ZOOM - half)}px`;
    },
    [entries, index, hideLens],
  );

  // Open/close side effects: scroll lock, keys, focus in and back out.
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'Tab') {
        // Keep focus inside the viewer.
        const f = [
          ...(frame.current?.closest('.product-lightbox')?.querySelectorAll<HTMLElement>('button') ?? []),
        ].filter((b) => b.style.visibility !== 'hidden');
        if (!f.length) return;
        const i = f.indexOf(document.activeElement as HTMLElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length]!.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      html.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
      opener.current?.focus();
    };
  }, [open, close, step]);

  useEffect(hideLens, [index, hideLens]);

  if (!root || !entries.length) return null;
  const entry = index !== null ? entries[index] : null;
  const many = entries.length > 1;

  return createPortal(
    <div
      className={`product-lightbox${open ? ' active' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={entry ? entry.alt : 'Image viewer'}
      aria-hidden={!open}
      onClick={(e) => {
        const t = e.target as HTMLElement;
        if (t === e.currentTarget || t.classList.contains('product-lightbox-stage')) close();
      }}
      onTouchStart={(e) => {
        if ((e.target as HTMLElement).closest('.product-lightbox-frame')) return;
        touch.current = {
          ...touch.current,
          x: e.changedTouches[0]!.screenX,
          y: e.changedTouches[0]!.screenY,
          suppress: false,
        };
      }}
      onTouchEnd={(e) => {
        if (touch.current.suppress || touch.current.magnifying) return;
        if ((e.target as HTMLElement).closest('.product-lightbox-frame')) return;
        const diff = e.changedTouches[0]!.screenX - touch.current.x;
        if (Math.abs(diff) >= 50) step(diff > 0 ? -1 : 1);
      }}
    >
      <button
        ref={closeBtn}
        type="button"
        className="product-lightbox-close"
        aria-label="Close"
        onClick={close}
      >
        &times;
      </button>
      <button
        type="button"
        className="product-lightbox-nav product-lightbox-prev"
        aria-label="Previous"
        style={{ visibility: many ? 'visible' : 'hidden' }}
        onClick={(e) => {
          e.stopPropagation();
          step(-1);
        }}
      >
        <Fa name="chevron-left" />
      </button>
      <div className="product-lightbox-stage">
        <div
          ref={frame}
          className="product-lightbox-frame"
          onMouseMove={magnifier ? (e) => showLens(e.clientX, e.clientY) : undefined}
          onMouseEnter={magnifier ? (e) => showLens(e.clientX, e.clientY) : undefined}
          onMouseLeave={magnifier ? hideLens : undefined}
          onTouchStart={
            magnifier
              ? (e) => {
                  const t = e.changedTouches[0]!;
                  touch.current = { ...touch.current, x: t.screenX, y: t.screenY, suppress: false };
                  showLens(t.clientX, t.clientY);
                }
              : undefined
          }
          onTouchEnd={magnifier ? hideLens : undefined}
          onTouchCancel={magnifier ? hideLens : undefined}
        >
          {entry ? (
            // eslint-disable-next-line @next/next/no-img-element -- full-size view of an already optimised file
            <img ref={imgRef} src={entry.src} alt={entry.alt} className="product-lightbox-img" />
          ) : null}
          {magnifier ? <div ref={lens} className="product-magnifier" aria-hidden="true" /> : null}
        </div>
      </div>
      <button
        type="button"
        className="product-lightbox-nav product-lightbox-next"
        aria-label="Next"
        style={{ visibility: many ? 'visible' : 'hidden' }}
        onClick={(e) => {
          e.stopPropagation();
          step(1);
        }}
      >
        <Fa name="chevron-right" />
      </button>
      <div className="product-lightbox-meta">
        <p className="product-lightbox-title">{entry?.alt}</p>
        <p className="product-lightbox-counter">{entry ? `${index! + 1} / ${entries.length}` : ''}</p>
        {magnifier ? <p className="product-lightbox-hint">Hover or touch the image to magnify</p> : null}
      </div>
      {open && magnifier ? <TouchMoveGuard frame={frame} touch={touch} showLens={showLens} /> : null}
    </div>,
    root,
  );
}

/**
 * Non-passive touchmove on the frame (React's are passive): while magnifying, or on a mostly vertical drag,
 * the lens follows the finger and the page does not scroll — same as the reference.
 */
function TouchMoveGuard({
  frame,
  touch,
  showLens,
}: {
  frame: React.RefObject<HTMLDivElement | null>;
  touch: React.RefObject<{ x: number; y: number; suppress: boolean; magnifying: boolean }>;
  showLens: (x: number, y: number) => void;
}) {
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const onMove = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = Math.abs(t.screenX - touch.current.x);
      const dy = Math.abs(t.screenY - touch.current.y);
      if (dx > 12 || dy > 12) touch.current.suppress = true;
      if (touch.current.magnifying || dy >= dx) {
        if (e.cancelable) e.preventDefault();
        showLens(t.clientX, t.clientY);
        touch.current.suppress = true;
      }
    };
    el.addEventListener('touchmove', onMove, { passive: false });
    return () => el.removeEventListener('touchmove', onMove);
  }, [frame, touch, showLens]);
  return null;
}
