'use client';

import { useRef } from 'react';
import { Icon } from '@/components/ui/Icon';
import styles from './TestimonialsCarousel.module.css';

interface Review {
  quote: string;
  name: string;
}

/** "Ar." is the professional prefix for registered architects in India — the only role derivable from the data. */
const roleOf = (name: string) => (/^Ar\.\s/.test(name) ? 'Architect' : null);

/**
 * One featured quote, then a carousel of the remaining reviews: max 3 visible on desktop, 1 on phones.
 * Manual (no auto-advance, so nothing moves without the user — WCAG 2.2.2); keyboard and swipe scrollable.
 */
export function TestimonialsCarousel({
  featured,
  items,
}: {
  featured: Review & { heading: string };
  items: Review[];
}) {
  const track = useRef<HTMLUListElement>(null);
  const move = (dir: number) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector('li');
    const step = card ? card.getBoundingClientRect().width + 24 : el.clientWidth;
    el.scrollBy({
      left: dir * step,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  };

  return (
    <div className={styles.wrap}>
      <figure className={`${styles.featured} reveal`}>
        <span className={styles.mark} aria-hidden="true">
          “
        </span>
        <blockquote>
          <p>{featured.quote}</p>
        </blockquote>
        <figcaption>
          <span className={styles.featuredName}>{featured.name}</span>
          <span className={styles.featuredRole}>{featured.heading}</span>
        </figcaption>
      </figure>

      <div
        className={styles.carousel}
        role="region"
        aria-roledescription="carousel"
        aria-label="Client reviews"
      >
        <ul
          ref={track}
          className={styles.track}
          tabIndex={0}
          aria-label="Reviews — scroll or use the buttons"
        >
          {items.map((t, i) => (
            <li
              key={t.name}
              className={styles.card}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${items.length}`}
            >
              <blockquote className={styles.quote}>
                <p>“{t.quote}”</p>
              </blockquote>
              <p className={styles.name}>
                {t.name}
                {roleOf(t.name) ? <span className={styles.role}> · {roleOf(t.name)}</span> : null}
              </p>
            </li>
          ))}
        </ul>
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.ctrl}
            onClick={() => move(-1)}
            aria-label="Previous reviews"
          >
            <Icon name="chevron-left" />
          </button>
          <button type="button" className={styles.ctrl} onClick={() => move(1)} aria-label="Next reviews">
            <Icon name="chevron-right" />
          </button>
        </div>
      </div>
    </div>
  );
}
