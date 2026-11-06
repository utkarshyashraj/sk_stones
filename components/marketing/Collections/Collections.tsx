import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { Picture } from '@/components/ui/Picture';
import type { ImageRef } from '@/lib/types';
import styles from './Collections.module.css';

export interface CollectionCardData {
  href: string;
  name: string;
  description?: string;
  count: number;
  image: ImageRef | null;
}

/** Category / collection cards. Headings are h2 or h3 depending on the surrounding outline. */
export function Collections({
  items,
  headingLevel = 3,
  compact,
}: {
  items: CollectionCardData[];
  headingLevel?: 2 | 3;
  compact?: boolean;
}) {
  const H = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <ul className={`${styles.grid} ${compact ? styles.compact : ''}`}>
      {items.map((c) => (
        <li key={c.href}>
          <Link href={c.href} className={styles.card}>
            <div className={styles.media}>
              {c.image ? (
                <Picture
                  image={c.image}
                  alt=""
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                  fill
                />
              ) : (
                <span className={styles.placeholder} aria-hidden="true">
                  <Icon name="grid" size={30} />
                </span>
              )}
              <span className={styles.count}>
                {c.count > 0 ? `${c.count} ${c.count === 1 ? 'variety' : 'varieties'}` : 'Enquire for range'}
              </span>
            </div>
            <div className={styles.body}>
              <H className={styles.name}>{c.name}</H>
              {c.description ? <p className={styles.desc}>{c.description}</p> : null}
              <span className={styles.more} aria-hidden="true">
                Explore <Icon name="arrow-right" size={16} />
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
