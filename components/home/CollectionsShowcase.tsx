import Link from 'next/link';
import { Picture } from '@/components/ui/Picture';
import type { ImageRef } from '@/lib/types';
import styles from './CollectionsShowcase.module.css';

export interface ShowcaseItem {
  href: string;
  name: string;
  descriptor?: string;
  count: number;
  image: ImageRef | null;
}

/**
 * Editorial collection cards: one large tile beside four, then rows of four.
 * Horizontal scroll-snap on phones. Hover: slow zoom + "View stones" reveal.
 */
export function CollectionsShowcase({ items }: { items: ShowcaseItem[] }) {
  return (
    <ul className={styles.grid}>
      {items.map((c, i) => (
        <li key={c.href} className={`${styles.item} ${i === 0 ? styles.large : ''}`}>
          <Link href={c.href} className={styles.card}>
            <span className={`${styles.media} zoom-media`}>
              {c.image ? (
                <Picture
                  image={c.image}
                  alt=""
                  sizes={i === 0 ? '(min-width: 1024px) 50vw, 85vw' : '(min-width: 1024px) 25vw, 85vw'}
                  fill
                />
              ) : null}
            </span>
            <span className={styles.body}>
              <span className={styles.name}>{c.name}</span>
              {c.descriptor ? <span className={styles.descriptor}>{c.descriptor}</span> : null}
              <span className={styles.meta}>
                <span>{c.count > 0 ? `${c.count} stones` : 'Supplied to order'}</span>
                <span className={styles.view} aria-hidden="true">
                  View stones →
                </span>
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
