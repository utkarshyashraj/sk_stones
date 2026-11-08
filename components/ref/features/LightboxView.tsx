'use client';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';
import { lockOverlay } from '../overlay-lock';

const MAG_ZOOM = 2.6;
const lensSize = () => (window.innerWidth <= 768 ? 140 : 180);

export interface ViewEntry {
  src: string;
  zoom: string;
  alt: string;
}

/**
 * The reference's fullscreen viewer, controlled: previous/next buttons, ← → keys and horizontal swipes step;
 * a round lens magnifies under the pointer or finger (2.6×); Escape, ✕ or the backdrop close it. Focus moves
 * to ✕ on open and stays inside. `panel` renders under the photo (caption, counter, stone details, actions).
 */
export function LightboxView({
  entries,
  index,
  onStep,
  onClose,
  panel,
  magnifier = true,
  className = '',
}: {
  entries: ViewEntry[];
  index: number;
  onStep: (delta: number) => void;
  onClose: () => void;
  panel: ReactNode;
  magnifier?: boolean;
  /** extra class, e.g. sk-lightbox--stone when the caption carries stone details and actions */
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const touch = useRef({ x: 0, y: 0, suppress: false, magnifying: false });
  const entry = entries[index]!;
  const many = entries.length > 1;

  const hideLens = useCallback(() => {
    touch.current.magnifying = false;
    lens.current?.classList.remove('is-visible');
    frame.current?.classList.remove('is-magnifying');
  }, []);
  const showLens = useCallback(
    (cx: number, cy: number) => {
      const l = lens.current;
      const img = imgRef.current;
      if (!l || !img) return;
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
      l.style.backgroundImage = `url("${entry.zoom}")`;
      l.style.backgroundRepeat = 'no-repeat';
      l.style.backgroundSize = `${r.width * MAG_ZOOM}px ${r.height * MAG_ZOOM}px`;
      l.style.backgroundPosition = `${-(x * MAG_ZOOM - half)}px ${-(y * MAG_ZOOM - half)}px`;
    },
    [entry.zoom, hideLens],
  );

  const keys = useRef({ onStep, onClose });
  useEffect(() => {
    keys.current = { onStep, onClose };
  });
  useEffect(() => {
    const unlock = lockOverlay();
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest?.('input, textarea, select');
      if (e.key === 'Escape') keys.current.onClose();
      else if (e.key === 'ArrowLeft' && !typing) keys.current.onStep(-1);
      else if (e.key === 'ArrowRight' && !typing) keys.current.onStep(1);
      else if (e.key === 'Tab' && box.current) {
        const f = [...box.current.querySelectorAll<HTMLElement>('button, a[href]')].filter(
          (b) => b.style.visibility !== 'hidden' && b.offsetParent !== null,
        );
        if (!f.length) return;
        const i = f.indexOf(document.activeElement as HTMLElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length]!.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      unlock();
    };
  }, []);
  useEffect(hideLens, [index, hideLens]);

  // Non-passive touchmove (React's are passive): while magnifying, or on a mostly vertical drag, the lens
  // follows the finger and the page does not scroll — as on the reference.
  useEffect(() => {
    const el = frame.current;
    if (!el || !magnifier) return;
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
  }, [magnifier, showLens]);

  return (
    <div
      ref={box}
      className={`product-lightbox active sk-lightbox ${className}`}
      role="dialog"
      aria-modal="true"
      aria-label={entry.alt}
      onClick={(e) => {
        const t = e.target as HTMLElement;
        if (t === e.currentTarget || t.classList.contains('product-lightbox-stage')) onClose();
      }}
      onTouchStart={(e) => {
        if ((e.target as HTMLElement).closest('.product-lightbox-frame, .sk-lb-panel')) return;
        const t = e.changedTouches[0]!;
        touch.current = { ...touch.current, x: t.screenX, y: t.screenY, suppress: false };
      }}
      onTouchEnd={(e) => {
        if (touch.current.suppress || touch.current.magnifying) return;
        if ((e.target as HTMLElement).closest('.product-lightbox-frame, .sk-lb-panel')) return;
        const diff = e.changedTouches[0]!.screenX - touch.current.x;
        if (Math.abs(diff) >= 50) onStep(diff > 0 ? -1 : 1);
      }}
    >
      <button
        ref={closeBtn}
        type="button"
        className="product-lightbox-close"
        aria-label="Close"
        onClick={onClose}
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
          onStep(-1);
        }}
      >
        <Icon name="chevron-left" />
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
          {/* eslint-disable-next-line @next/next/no-img-element -- full-size view of an already optimised file */}
          <img ref={imgRef} src={entry.src} alt={entry.alt} className="product-lightbox-img" />
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
          onStep(1);
        }}
      >
        <Icon name="chevron-right" />
      </button>
      {panel}
    </div>
  );
}
