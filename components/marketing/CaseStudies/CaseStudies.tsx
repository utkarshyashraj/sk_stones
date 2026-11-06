import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { Picture } from '@/components/ui/Picture';
import type { ImageRef } from '@/lib/types';
import styles from './CaseStudies.module.css';

export interface CaseStudyCardData {
  href: string;
  sector: string;
  title: string;
  text: string;
  image: ImageRef;
}

export function CaseStudies({ items }: { items: CaseStudyCardData[] }) {
  return (
    <ul className={styles.grid}>
      {items.map((c) => (
        <li key={c.href}>
          <Link href={c.href} className={styles.card}>
            <div className={styles.media}>
              <Picture image={c.image} alt="" sizes="(min-width: 1024px) 33vw, 100vw" fill />
            </div>
            <div className={styles.body}>
              <p className={styles.sector}>{c.sector}</p>
              <h3 className={styles.title}>{c.title}</h3>
              <p className={styles.text}>{c.text}</p>
              <span className={styles.more} aria-hidden="true">
                Read case study <Icon name="arrow-right" size={16} />
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
