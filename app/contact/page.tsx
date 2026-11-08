import { ContactFormModal } from '@/components/ref/ContactFormModal';
import { FAQAccordion } from '@/components/ref/FAQAccordion';
import { Fa } from '@/components/ref/Fa';
import { JsonLd } from '@/components/ref/JsonLd';
import { RefShell } from '@/components/ref/RefShell';
import { pageMetadata } from '@/lib/ref-seo';
import { faqPageLd, localBusinessLd } from '@/lib/seo';
import { site, telHref, whatsappHref } from '@/lib/site';
import '@/styles/ref/contact.css';

export const metadata = pageMetadata('contact', '/contact');

const quickAnswers = [
  {
    q: 'How quickly will I receive a quote?',
    a: 'We typically respond within 24 hours on business days. For urgent projects, call or WhatsApp us directly at +91 70226 30994.',
  },
  {
    q: 'What details should I include in my enquiry?',
    a: 'Stone type, approximate quantity or area (sq. ft.), site location, thickness/size requirements, and whether you need supply only or full installation.',
  },
  {
    q: 'Can I schedule a showroom visit?',
    a: 'Yes — walk in during business hours or mention your preferred date in the form. Our Koramangala showroom has live stone samples across granites, marbles, and claddings.',
  },
];

export default function ContactPage() {
  return (
    <RefShell bundle="contact" nav="contact" tab="more" footer="grid">
      <JsonLd data={localBusinessLd()} />
      <JsonLd data={faqPageLd(quickAnswers)} />
      <section className="contact-section">
        <div className="contact-intro">
          <h1>
            Get In <span>Touch</span>
          </h1>
          <p>
            Reach out for project discussions, product enquiries, or site consultations. Choose your nearest
            location — our team is ready to assist with timely, professional responses.
          </p>
        </div>
        <div className="contact-cities">
          {site.offices.map((o) => {
            const id = `city-${o.city.toLowerCase()}`;
            return (
              <article key={o.city} className="contact-city-card" aria-labelledby={id}>
                <p className="contact-city-label">
                  <Fa name="map-marker-alt" /> Location
                </p>
                <h2 id={id}>{o.city}</h2>
                <div className="contact-blocks">
                  <div className="contact-block">
                    <div className="contact-icon">
                      <Fa name="phone" />
                    </div>
                    <div>
                      <h4>Phone</h4>
                      <a href={telHref}>{site.phone.display}</a>
                    </div>
                  </div>
                  <div className="contact-block">
                    <div className="contact-icon">
                      <Fa name="envelope" />
                    </div>
                    <div>
                      <h4>Email</h4>
                      <a href={`mailto:${site.email}`}>{site.email}</a>
                    </div>
                  </div>
                  <div className="contact-block">
                    <div className="contact-icon">
                      <Fa name="map-marker-alt" />
                    </div>
                    <div>
                      <h4>Address</h4>
                      <p>{o.address}</p>
                    </div>
                  </div>
                </div>
                <div className="contact-map">
                  <iframe
                    src={o.mapEmbed}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={o.mapTitle}
                  />
                </div>
                <button type="button" className="open-form-btn" data-location={o.city} data-open-form="">
                  <Fa name="file-alt" /> Open Form
                </button>
              </article>
            );
          })}
        </div>
        <div className="follow-us">
          <p>Follow us:</p>
          <div className="social-row">
            <a
              href={site.linkedin}
              className="social-btn linkedin"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <Fa name="linkedin-in" />
            </a>
            <a
              href={whatsappHref()}
              className="social-btn whatsapp"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <Fa name="whatsapp" />
            </a>
            <a href={`mailto:${site.email}`} className="social-btn email" aria-label="Email">
              <Fa name="envelope" />
            </a>
          </div>
        </div>
      </section>
      <ContactFormModal />

      <section className="faq-section" id="faq">
        <div className="faq-container">
          <div className="section-header">
            <h2
              style={{
                fontFamily: 'var(--font-playfair), serif',
                fontSize: '2rem',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              Quick <span style={{ color: 'var(--gold)' }}>Answers</span>
            </h2>
          </div>
          <FAQAccordion items={quickAnswers} />
        </div>
      </section>
    </RefShell>
  );
}
