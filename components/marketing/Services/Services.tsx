import Link from 'next/link';
import { Picture } from '@/components/ui/Picture';
import type { ImageRef } from '@/lib/types';
import styles from './Services.module.css';

export interface ServiceCardData {
  title: string;
  text: string;
  href: string;
  image: ImageRef;
}

export function Services({ items }: { items: ServiceCardData[] }) {
  return (
    <ul className={styles.grid}>
      {items.map((s) => (
        <li key={s.title} className={styles.item}>
          <Link href={s.href} className={styles.card}>
            <Picture
              image={s.image}
              alt=""
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw"
              fill
            />
            <span className={styles.shade} aria-hidden="true" />
            <div className={styles.body}>
              <h3 className={styles.title}>{s.title}</h3>
              <span className={styles.text}>{s.text}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
