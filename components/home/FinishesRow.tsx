import Link from 'next/link';
import { Picture } from '@/components/ui/Picture';
import type { ImageRef } from '@/lib/types';
import styles from './FinishesRow.module.css';

export interface FinishSwatch {
  name: string;
  text: string;
  href: string;
  image: ImageRef;
  stone: string;
}

/** Close-up swatches of the finishes present in the catalogue, each linking to a filtered search. */
export function FinishesRow({ items }: { items: FinishSwatch[] }) {
  return (
    <ul className={styles.row}>
      {items.map((f) => (
        <li key={f.name} className="reveal">
          <Link href={f.href} className={styles.swatch}>
            <span className={`${styles.media} zoom-media`}>
              <Picture
                image={f.image}
                alt={`${f.name} finish — ${f.stone}`}
                sizes="(min-width: 900px) 33vw, 100vw"
                fill
              />
            </span>
            <span className={styles.name}>{f.name}</span>
            <span className={styles.text}>{f.text}</span>
            <span className={styles.stone}>Shown: {f.stone}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
