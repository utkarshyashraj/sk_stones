'use client';

import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Picture } from '@/components/ui/Picture';
import { useModalDialog } from '@/components/ui/useModalDialog';
import type { ImageRef } from '@/lib/types';
import styles from './Gallery.module.css';

export function Gallery({ images, label }: { images: { image: ImageRef; alt: string }[]; label: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const close = useCallback(() => setIndex(null), []);
  const ref = useModalDialog(index !== null, close);
  const go = useCallback(
    (d: number) => setIndex((i) => (i === null ? i : (i + d + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, go]);

  const current = index !== null ? images[index] : undefined;

  return (
    <>
      <ul className={styles.grid} aria-label={label}>
        {images.map((g, i) => (
          <li key={g.image.key} className={styles.item}>
            <button
              type="button"
              className={styles.thumb}
              onClick={() => setIndex(i)}
              aria-label={`View larger: ${g.alt}`}
              aria-haspopup="dialog"
            >
              <Picture
                image={g.image}
                alt=""
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                fill
              />
              <span className={styles.zoom} aria-hidden="true">
                <Icon name="expand" size={18} />
              </span>
            </button>
          </li>
        ))}
      </ul>
      <dialog ref={ref} className={styles.dialog} aria-label={current ? current.alt : label}>
        {current ? (
          <figure className={styles.figure}>
            <Picture
              image={current.image}
              alt={current.alt}
              sizes="100vw"
              priority
              preloadHint={false}
              imgClassName={styles.full}
            />
            <figcaption className={styles.caption}>
              {current.alt}
              <span className={styles.counter}>
                {(index ?? 0) + 1} / {images.length}
              </span>
            </figcaption>
          </figure>
        ) : null}
        <button
          type="button"
          className={`${styles.ctrl} ${styles.close}`}
          onClick={close}
          aria-label="Close image"
        >
          <Icon name="close" size={22} />
        </button>
        {images.length > 1 ? (
          <>
            <button
              type="button"
              className={`${styles.ctrl} ${styles.prev}`}
              onClick={() => go(-1)}
              aria-label="Previous image"
            >
              <Icon name="chevron-left" size={24} />
            </button>
            <button
              type="button"
              className={`${styles.ctrl} ${styles.next}`}
              onClick={() => go(1)}
              aria-label="Next image"
            >
              <Icon name="chevron-right" size={24} />
            </button>
          </>
        ) : null}
      </dialog>
    </>
  );
}
