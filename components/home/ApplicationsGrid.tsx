import Link from 'next/link';
import { Picture } from '@/components/ui/Picture';
import type { ImageRef } from '@/lib/types';
import styles from './ApplicationsGrid.module.css';

export interface ApplicationTile {
  label: string;
  href: string;
  image: ImageRef | null;
  /** Collections whose catalogue data lists this application. */
  recommended: string[];
}

export function ApplicationsGrid({ items }: { items: ApplicationTile[] }) {
  return (
    <ul className={styles.grid}>
      {items.map((a) => (
        <li key={a.label} className="reveal">
          <Link href={a.href} className={styles.tile}>
            <span className={`${styles.media} zoom-media`}>
              {a.image ? (
                <Picture
                  image={a.image}
                  alt=""
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  fill
                />
              ) : null}
            </span>
            <span className={styles.label}>{a.label}</span>
            {a.recommended.length ? (
              <span className={styles.recommended}>
                <span className={styles.recLabel}>Suited stones</span> {a.recommended.join(' · ')}
              </span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
