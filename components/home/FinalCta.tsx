import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { Picture } from '@/components/ui/Picture';
import { whatsappHref } from '@/lib/site';
import type { ImageRef } from '@/lib/types';
import styles from './FinalCta.module.css';

/** Full-bleed slab photograph with a dark overlay and the two enquiry actions. */
export function FinalCta({ title, text, slab }: { title: string; text: string; slab: ImageRef }) {
  return (
    <section className={styles.cta} aria-labelledby="final-cta-title">
      <div className={styles.media} aria-hidden="true">
        <Picture image={slab} alt="" sizes="100vw" fill />
      </div>
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
