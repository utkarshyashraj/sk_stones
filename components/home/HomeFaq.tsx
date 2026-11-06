import { FAQ } from '@/components/marketing/FAQ/FAQ';
import { Icon } from '@/components/ui/Icon';
import type { Faq } from '@/content/pages';
import { telHref, whatsappHref } from '@/lib/site';
import styles from './HomeFaq.module.css';

/** Sticky left panel (heading + help actions) beside an exclusive accordion (one open at a time). */
export function HomeFaq({
  eyebrow,
  title,
  aside,
  items,
}: {
  eyebrow: string;
  title: string;
  aside: string;
  items: Faq[];
}) {
  return (
    <div className={`container ${styles.grid}`}>
      <div className={styles.panel}>
        <span className={styles.rule} aria-hidden="true" />
        <p className="eyebrow">{eyebrow}</p>
        <h2 id="faq-title" className={styles.title}>
          {title}
        </h2>
        <p className={styles.aside}>{aside}</p>
        <div className={styles.actions}>
          <a
            className="btn btn--whatsapp"
            href={whatsappHref('Hi S K Stones India, I have a question.')}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="whatsapp" /> WhatsApp
          </a>
          <a className="btn btn--outline" href={telHref}>
            Call us
          </a>
        </div>
      </div>
      <FAQ items={items} group="home-faq" />
    </div>
  );
}
