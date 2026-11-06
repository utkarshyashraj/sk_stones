import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { whatsappHref } from '@/lib/site';
import styles from './FinalCta.module.css';

/** Closing call to action over the marble (0.45 veil). */
export function FinalCta({ title, text }: { title: string; text: string }) {
  return (
    <section className={`${styles.cta} veil veil-hero zone-hero`} aria-labelledby="final-cta-title">
      <div className={`container ${styles.inner} reveal`}>
        <h2 id="final-cta-title" className={styles.title}>
          {title}
        </h2>
        <p className={styles.text}>{text}</p>
        <div className={styles.actions}>
          <Link href="/contact#quote" className="btn btn--primary">
            Get a quote
          </Link>
          <a
            href={whatsappHref('Hi S K Stones India, I would like a quote.')}
            className="btn btn--whatsapp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="whatsapp" /> WhatsApp us
          </a>
        </div>
      </div>
    </section>
  );
}
