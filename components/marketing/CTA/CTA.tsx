import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { telHref, whatsappHref } from '@/lib/site';
import styles from './CTA.module.css';

interface Props {
  heading: string;
  text: string;
  primary?: { label: string; href: string };
  whatsappMessage?: string;
}

/** Closing enquiry band used across pages: quote form, call and WhatsApp. */
export function CTA({
  heading,
  text,
  primary = { label: 'Get a free quote', href: '/contact#quote' },
  whatsappMessage,
}: Props) {
  return (
    <section className={`${styles.cta} on-dark`} aria-labelledby="cta-heading">
      <div className={`container ${styles.inner}`}>
        <div>
          <h2 id="cta-heading" className={styles.heading}>
            {heading}
          </h2>
          <p className={styles.text}>{text}</p>
        </div>
        <div className={styles.actions}>
          <Link href={primary.href} className="btn btn--primary">
            {primary.label} <Icon name="arrow-right" />
          </Link>
          <a href={telHref} className="btn btn--outline">
            <Icon name="phone" /> Call now
          </a>
          <a
            href={whatsappHref(whatsappMessage ?? 'Hi S K Stones India, I would like a quote.')}
            className="btn btn--whatsapp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="whatsapp" /> WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
