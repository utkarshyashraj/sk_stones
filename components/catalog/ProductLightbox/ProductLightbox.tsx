'use client';

import Link from 'next/link';
import { useCallback, useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';
import { StoneMagnifier } from '@/components/catalog/StoneMagnifier/StoneMagnifier';
import { useModalDialog } from '@/components/ui/useModalDialog';
import { useShortlist } from '@/components/shortlist/shortlist-store';
import { toShortlistItem } from '@/components/catalog/ProductCard/ProductCard';
import { enquireHref, productWhatsappHref } from '@/lib/enquiry';
import type { ClientProduct } from '@/lib/types';
import styles from './ProductLightbox.module.css';

interface Props {
  products: ClientProduct[];
  index: number | null;
  names: Record<string, string>;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function ProductLightbox({ products, index, names, onClose, onNavigate }: Props) {
  const open = index !== null && products[index] !== undefined;
  const ref = useModalDialog(open, onClose);
  const p = open ? products[index] : undefined;
  const total = products.length;

  const go = useCallback(
    (delta: number) => {
      if (index === null || total < 2) return;
      onNavigate((index + delta + total) % total);
    },
    [index, total, onNavigate],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      // Keys typed inside another dialog on top (the zoom viewer) belong to it.
      const inDialog = e.target instanceof Element ? e.target.closest('dialog') : null;
      if (inDialog && inDialog !== ref.current) return;
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, go, ref]);

  return (
    <dialog ref={ref} className={styles.dialog} aria-labelledby="lb-title" aria-describedby="lb-specs">
      {p ? <Detail key={p.id} product={p} names={names} /> : null}
      <button type="button" className={styles.close} onClick={onClose} aria-label="Close product details">
        <Icon name="close" size={22} />
      </button>
      {total > 1 && index !== null ? (
        <div className={styles.nav}>
          <button type="button" className={styles.navBtn} onClick={() => go(-1)} aria-label="Previous stone">
            <Icon name="chevron-left" size={22} />
          </button>
          <span className={styles.counter} aria-live="polite">
            {index + 1} of {total}
          </span>
          <button type="button" className={styles.navBtn} onClick={() => go(1)} aria-label="Next stone">
            <Icon name="chevron-right" size={22} />
          </button>
        </div>
      ) : null}
      {/* swipe surface: horizontal swipes on the image navigate */}
      <SwipeCapture onSwipe={go} />
    </dialog>
  );
}

function SwipeCapture({ onSwipe }: { onSwipe: (d: number) => void }) {
  useEffect(() => {
    let start: { x: number; y: number; t: number; el: HTMLElement } | null = null;
    const down = (e: TouchEvent) => {
      const t = e.touches[0];
      const target = e.target as HTMLElement;
      if (t && target.closest('[data-swipe]'))
        start = { x: t.clientX, y: t.clientY, t: Date.now(), el: target };
    };
    const up = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      // A long-press on the image drags the magnifier lens; that is not a swipe.
      if (start?.el.closest('[data-lens-used]')) start = null;
      if (!start || !t) return;
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && Date.now() - start.t < 600)
        onSwipe(dx < 0 ? 1 : -1);
      start = null;
    };
    document.addEventListener('touchstart', down, { passive: true });
    document.addEventListener('touchend', up, { passive: true });
    return () => {
      document.removeEventListener('touchstart', down);
      document.removeEventListener('touchend', up);
    };
  }, [onSwipe]);
  return null;
}

/** Every photo fills the same 4:3 frame; wider photos are cropped at the sides, so they render
 * wider than the frame — ask for a correspondingly larger file so they stay sharp. */
const FRAME = 4 / 3;
function frameSizes(ratio: number) {
  const over = Math.max(1, ratio / FRAME);
  return `(min-width: 1024px) ${Math.round(50 * over)}vw, ${Math.round(100 * over)}vw`;
}

function Detail({ product: p, names }: { product: ClientProduct; names: Record<string, string> }) {
  const { has, toggle } = useShortlist();
  const saved = has(p.id);
  const collectionName = names[p.collection] ?? '';
  const specs: [string, string][] = [
    ['Collection', collectionName],
    ...(p.subcategory && p.category !== p.collection
      ? ([['Category', names[p.category] ?? '']] as [string, string][])
      : []),
    ...(p.finish ? ([['Finish', p.finish]] as [string, string][]) : []),
    ...(p.colours.length ? ([['Colour', p.colours.join(', ')]] as [string, string][]) : []),
    ...(p.applications.length ? ([['Suitable for', p.applications.join(', ')]] as [string, string][]) : []),
    ...(p.origin ? ([['Origin', p.origin]] as [string, string][]) : []),
    ...(p.size ? ([['Size', p.size]] as [string, string][]) : []),
  ];

  return (
    <div className={styles.layout}>
      <div className={styles.media} data-swipe>
        {p.img ? (
          <div className={styles.frame}>
            <StoneMagnifier
              image={p.img}
              alt={`${p.name}${p.finish ? `, ${p.finish} finish` : ''} — ${collectionName}`}
              sizes={frameSizes(p.img.w / p.img.h)}
              fill
            />
          </div>
        ) : (
          <div className={styles.noPhoto}>
            <Icon name="image" size={40} />
            <p>Photo available on request</p>
          </div>
        )}
      </div>
      <div className={styles.info}>
        <p className="eyebrow">{collectionName}</p>
        <h2 id="lb-title" className={styles.title}>
          {p.name}
        </h2>
        <dl id="lb-specs" className={styles.specs}>
          {specs.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p className={styles.note}>
          Thickness, sizes and availability vary by batch — ask us for current stock and a sample.
        </p>
        <div className={styles.actions}>
          <Link
            href={enquireHref(p, collectionName)}
            className="btn btn--primary btn--block"
            prefetch={false}
          >
            <Icon name="send" /> Enquire about this stone
          </Link>
          <button
            type="button"
            className="btn btn--outline btn--block"
            aria-pressed={saved}
            onClick={() => toggle(toShortlistItem(p, collectionName))}
          >
            <Icon name={saved ? 'check' : 'bookmark'} /> {saved ? 'Saved to shortlist' : 'Add to shortlist'}
          </button>
          <a
            className="btn btn--whatsapp btn--block"
            href={productWhatsappHref(p.name, collectionName)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="whatsapp" /> Ask on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
