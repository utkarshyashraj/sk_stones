import { QuoteForm } from '@/components/forms/QuoteForm/QuoteForm';
import { FAQ } from '@/components/marketing/FAQ/FAQ';
import { PageHero } from '@/components/marketing/PageHero/PageHero';
import { Icon } from '@/components/ui/Icon';
import { contactFaqs } from '@/content/pages';
import { buildMetadata } from '@/lib/seo';
import { fullAddress, site, telHref, whatsappHref } from '@/lib/site';
import styles from './contact.module.css';

export const metadata = buildMetadata({
  title: 'Contact Us & Get a Quote | S K Stones India, Koramangala, Bengaluru',
  description:
    'Request a free stone quote or visit our Koramangala showroom. Call or WhatsApp +91 70226 30994, email info@skstonesindia.com. We reply within 24 hours.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <>
      <PageHero
        crumbs={[
          { name: 'Home', href: '/' },
          { name: 'Contact Us', href: '/contact' },
        ]}
        title={
          <>
            Get in <span className="accent">touch</span>
          </>
        }
        lead={
          <p>
            Reach out for project discussions, product enquiries, or site consultations. Our team is available
            to assist you with timely and professional responses.
          </p>
        }
      />
      <section className="section" aria-label="Contact details and quote form">
        <div className={`container ${styles.layout}`}>
          <div className={styles.info}>
            <ul className={styles.cards}>
              <li>
                <div>
                  <h2>Phone</h2>
                  <a href={telHref}>{site.phone.display}</a>
                </div>
              </li>
              <li>
                <div>
                  <h2>WhatsApp</h2>
                  <a
                    href={whatsappHref('Hi S K Stones India, I have an enquiry.')}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Chat with us
                  </a>
                </div>
              </li>
              <li className={styles.wide}>
                <div>
                  <h2>Email</h2>
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </div>
              </li>
              <li>
                <div>
                  <h2>Showroom hours</h2>
                  <p>{site.hours.label}</p>
                </div>
              </li>
              <li className={styles.wide}>
                <div>
                  <h2>Showroom address</h2>
                  <p>{fullAddress}</p>
                  <a href={site.maps.place} target="_blank" rel="noopener noreferrer" className="link-arrow">
                    Open in Google Maps <Icon name="external" />
                  </a>
                </div>
              </li>
            </ul>
            <div className={styles.map}>
              <iframe
                title="Map showing the S K Stones India showroom in Koramangala, Bengaluru"
                src={site.maps.embed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
          <div id="quote" className={styles.formCol}>
            <QuoteForm />
          </div>
        </div>
      </section>
      <section className="section section--tint" aria-labelledby="faq-title">
        <div className="container">
          <div className="section-head">
            <h2 id="faq-title">Quick answers</h2>
          </div>
          <FAQ items={contactFaqs} />
        </div>
      </section>
    </>
  );
}
