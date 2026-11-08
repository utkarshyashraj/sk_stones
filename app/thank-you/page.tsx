import Link from 'next/link';
import { Fa } from '@/components/ref/Fa';
import { ClearSavedOffer } from '@/components/ref/features/ClearSavedOffer';
import '@/styles/ref/features.css';
import { pageMetadata } from '@/lib/ref-seo';
import { telHref, whatsappHref } from '@/lib/site';
import '@/styles/ref/thank-you.css';

// Where the contact form lands after FormSubmit; not for search results.
export const metadata = {
  ...pageMetadata('thank-you', '/thank-you'),
  robots: { index: false, follow: true },
};

/** Reference thank-you page: a standalone confirmation box (no header, footer or mobile bar). */
export default function ThankYouPage() {
  return (
    <div className="ref-thank-you showroom-theme" data-ref-root="">
      <main id="main" className="thank-box">
        <div className="thank-icon" aria-hidden="true">
          <Fa name="check" />
        </div>
        <h1>
          Thank <span>You!</span>
        </h1>
        <p>
          Your quote request has been received. Our team at S K Stones India will review your details and get
          back to you within 24 hours.
        </p>
        <p>For urgent enquiries, call us directly or message on WhatsApp.</p>
        <div className="actions">
          <Link className="btn btn-primary" href="/">
            Back to Home
          </Link>
          <Link className="btn btn-outline" href="/products">
            Explore Stones
          </Link>
          <a href={telHref} className="btn btn-outline">
            <Fa name="phone" /> Call Now
          </a>
        </div>
        <ClearSavedOffer />
        <p className="wa-note">
          Prefer WhatsApp?{' '}
          <a href={whatsappHref()} target="_blank" rel="noopener noreferrer">
            Chat with us →
          </a>
        </p>
      </main>
    </div>
  );
}
