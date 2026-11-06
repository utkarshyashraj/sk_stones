import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { whatsappHref } from '@/lib/site';
import styles from './CTA.module.css';

interface Props {
  heading: string;
  text: string;
  primary?: { label: string; href: string };
  whatsappMessage?: string;
}

/**
 * Closing enquiry band: one primary action + WhatsApp (a different channel with a page-specific message).
 * The phone number is already in the header and bottom navigation, so it is not repeated here.
 */
export function CTA({
  heading,
  text,
  primary = { label: 'Request a quote', href: '/contact#quote' },
  whatsappMessage,
}: Props) {
  return (
    <section className={`${styles.cta} veil veil-hero zone-hero`} aria-labelledby="cta-heading">
      <div className={`container ${styles.inner}`}>
        <div>
          <h2 id="cta-heading" className={styles.heading}>
            {heading}
          </h2>
          <p className={styles.text}>{text}</p>
        </div>
        <div className={styles.actions}>
          <Link href={primary.href} className="btn btn--primary">
            {primary.label}
          </Link>
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
