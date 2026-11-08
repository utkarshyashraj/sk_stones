import { servicePages, type ServiceSlug } from '@/content/ref/services';
import { galleryItem } from '@/lib/lightbox-items';
import { Enhance } from './Enhance';
import { Fa } from './Fa';
import { LightboxData } from './LightboxData';
import { RefImg, refImage } from './RefImg';
import { RefShell } from './RefShell';
import { ServiceFAQ } from './ServiceFAQ';

const html = (h: string) => ({ __html: h }); // reference headings: gold words in <span>, built from the snapshot

/**
 * Shared layout of the reference's four service pages (Landscaping, Flooring Executions, Elevations,
 * Installations): split hero, count-up stats, feature cards, work gallery (fullscreen viewer) and FAQ.
 */
export function ServicePageTemplate({ slug }: { slug: ServiceSlug }) {
  const p = servicePages[slug];
  return (
    <RefShell bundle={slug} bodyClass={p.bodyClass} nav={null} tab="services" footer="grid">
      <Enhance />
      <section className="hero service-hero">
        <div className="service-hero-top">
          <div className="service-hero-layout">
            <div className="service-hero-inner">
              <h1 className="service-hero-title">
                {p.title.map((t) => (
                  <span key={t.text} className={t.tone}>
                    {t.text}
                  </span>
                ))}
              </h1>
            </div>
            <div className="service-hero-photo">
              <RefImg src={p.heroImage} alt={p.heroAlt} sizes="(min-width: 1025px) 45vw, 100vw" priority />
            </div>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="stats-grid">
          {p.stats.map((s) => (
            <div key={s.label} className="stat-item">
              <h3>
                <span className="counter" data-target={s.target}>
                  {s.target}
                </span>
                <span>{s.suffix}</span>
              </h3>
              <p>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={p.featureSectionClass}>
        <div className="container">
          <div className="section-header">
            <h2 dangerouslySetInnerHTML={html(p.featuresTitleHtml)} />
          </div>
          <p className="mobile-swipe-hint features-swipe-hint" aria-hidden="true">
            <Fa name="arrow-right" />
          </p>
          <div className="features-grid">
            {p.features.map((f) => (
              <div key={f.titleHtml} className="feature-card">
                <h3 dangerouslySetInnerHTML={html(f.titleHtml)} />
                <p>{f.text}</p>
                <ul>
                  {f.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 dangerouslySetInnerHTML={html(p.galleryTitleHtml)} />
          </div>
          <p className="mobile-swipe-hint gallery-swipe-hint" aria-hidden="true">
            <Fa name="arrow-right" />
          </p>
          <div className="gallery-grid">
            {p.gallery.map((g) => (
              <div
                key={g.image}
                className="gallery-item"
                role="button"
                tabIndex={0}
                data-sk-click=""
                aria-label={`View photo: ${g.alt}`}
              >
                <RefImg src={g.image} alt={g.alt} sizes="(min-width: 1025px) 33vw, 80vw" />
              </div>
            ))}
          </div>
        </div>
        <LightboxData
          grid=".gallery-grid"
          item=".gallery-item"
          items={p.gallery.map((g) => galleryItem(refImage(g.image), g.alt))}
        />
      </section>

      <section className="faq-section">
        <div className="container">
          <div className="section-header">
            <h2 dangerouslySetInnerHTML={html(p.faqTitleHtml)} />
          </div>
          <ServiceFAQ items={p.faqs} />
        </div>
      </section>
    </RefShell>
  );
}
