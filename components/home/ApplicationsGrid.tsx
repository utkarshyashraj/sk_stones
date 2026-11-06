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
  /** Stones in the catalogue listing this application (what the linked results page shows). */
  count: number;
}

/** One bordered panel per application: image → title → description → "Suited stones" chips. */
export function ApplicationsGrid({ items }: { items: ApplicationTile[] }) {
  return (
    <ul className={styles.grid}>
      {items.map((a) => (
        <li key={a.label} className={`${styles.item} reveal`}>
          <Link href={a.href} className={styles.card}>
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
            <span className={styles.desc}>
              {a.count} stones in our catalogue are suited to this space.{' '}
              <span className={styles.more} aria-hidden="true">
                View stones →
              </span>
            </span>
            {a.recommended.length ? (
              <span className={styles.suited}>
                <span className={styles.suitedLabel}>Suited stones</span>
                <span className={styles.chips}>
                  {a.recommended.map((r) => (
                    <span key={r} className={styles.chip}>
                      {r}
                    </span>
                  ))}
                </span>
              </span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
