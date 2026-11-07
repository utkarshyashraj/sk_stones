import { FAQ } from '@/components/marketing/FAQ/FAQ';
import type { Faq } from '@/content/pages';
import styles from './HomeFaq.module.css';

/** Sticky left panel (heading) beside an exclusive accordion (one open at a time). */
export function HomeFaq({ eyebrow, title, items }: { eyebrow: string; title: string; items: Faq[] }) {
  return (
    <div className={`container ${styles.grid}`}>
      <div className={styles.panel}>
        <span className={styles.rule} aria-hidden="true" />
        <p className="eyebrow">{eyebrow}</p>
        <h2 id="faq-title" className={styles.title}>
          {title}
        </h2>
      </div>
      <FAQ items={items} group="home-faq" />
    </div>
  );
}
