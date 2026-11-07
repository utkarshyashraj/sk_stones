'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Fa } from './Fa';
import { usePortalRoot } from './useClient';

/**
 * Projects page viewer (the reference's simpler lightbox, separate from the product one): any project photo
 * opens it; ‹ › step through every photo on the page and wrap around; Escape, ✕ or the backdrop close it.
 * Also applies the reference's staggered fade-in to project headers and photos.
 */
export function ProjectsLightbox({ images }: { images: { src: string; alt: string }[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const root = usePortalRoot();
  const closeRef = useRef<HTMLSpanElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const items = [...document.querySelectorAll<HTMLElement>('.project-item')].slice(0, images.length);
    const off = items.map((el, i) => {
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', `View photo: ${images[i]!.alt}`);
      const open = () => {
        opener.current = el;
        setIndex(i);
      };
      const key = (e: globalThis.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      };
      el.addEventListener('click', open);
      el.addEventListener('keydown', key);
      return () => {
        el.removeEventListener('click', open);
        el.removeEventListener('keydown', key);
      };
    });

    // Staggered reveal (projects-reveal.js).
    const reveal = [...document.querySelectorAll<HTMLElement>('.project-block-header, .project-item')];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let io: IntersectionObserver | null = null;
    if (!reduce && 'IntersectionObserver' in window) {
      reveal.forEach((el, i) => {
        el.classList.add('projects-reveal');
        el.style.transitionDelay = `${(i % 6) * 0.08}s`;
      });
      io = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add('visible');
            io!.unobserve(e.target);
          }),
        { threshold: 0.12, rootMargin: '0px 0px -32px 0px' },
      );
      reveal.forEach((el) => io!.observe(el));
    }
    return () => {
      off.forEach((f) => f());
      io?.disconnect();
    };
  }, [images]);

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (d: number) => setIndex((i) => (i === null ? i : (i + d + images.length) % images.length)),
    [images.length],
  );
  useEffect(() => {
    if (index === null) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      html.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
      opener.current?.focus();
    };
  }, [index === null, close, step]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!root) return null;
  const cur = index !== null ? images[index] : null;
  // The reference uses <span>s for these controls; kept (with button semantics) so its CSS applies unchanged.
  const ctl = (
    cls: string,
    label: string,
    act: () => void,
    child: React.ReactNode,
    ref?: React.Ref<HTMLSpanElement>,
  ) => (
    <span
      ref={ref}
      className={cls}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        act();
      }}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          act();
        }
      }}
    >
      {child}
    </span>
  );
  return createPortal(
    <div
      className={`lightbox${cur ? ' active' : ''}`}
      id="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={cur ? cur.alt : 'Project photo'}
      aria-hidden={!cur}
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      {ctl('lightbox-close', 'Close', close, '×', closeRef)}
      {ctl('lightbox-nav lightbox-prev', 'Previous photo', () => step(-1), <Fa name="chevron-left" />)}
      {/* eslint-disable-next-line @next/next/no-img-element -- full-size view of an optimised file */}
      {cur ? <img src={cur.src} alt={cur.alt} id="lightboxImg" /> : null}
      {ctl('lightbox-nav lightbox-next', 'Next photo', () => step(1), <Fa name="chevron-right" />)}
    </div>,
    root,
  );
}
