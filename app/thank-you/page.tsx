import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { buildMetadata } from '@/lib/seo';
import { telHref, whatsappHref } from '@/lib/site';
import { ClearShortlistOnArrival } from './ClearShortlistOnArrival';
import styles from './thank-you.module.css';

export const metadata = buildMetadata({
  title: 'Thank You | S K Stones India',
  description: 'Your quote request has been received. Our team will get back to you within 24 hours.',
  path: '/thank-you',
  noindex: true,
});

export default function ThankYouPage() {
  return (
    <section className={`section ${styles.wrap}`}>
      <ClearShortlistOnArrival />
      <div className={`container ${styles.card}`}>
        <span className={styles.icon} aria-hidden="true">
          <Icon name="check" size={32} />
        </span>
        <h1>Thank you!</h1>
        <p className={styles.lead}>
          Your quote request has been received. Our team at S K Stones India will review your details and get
          back to you within 24 hours.
        </p>
        <p>For urgent enquiries, call us directly or message on WhatsApp.</p>
        <div className={styles.actions}>
          <Link href="/" className="btn btn--outline">
            Back to home
          </Link>
          <Link href="/products" className="btn btn--outline">
            Explore stones
          </Link>
          <a href={telHref} className="btn btn--primary">
            <Icon name="phone" /> Call now
          </a>
          <a
            href={whatsappHref('Hi S K Stones India, I just sent a quote request.')}
            className="btn btn--whatsapp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="whatsapp" /> Chat on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
