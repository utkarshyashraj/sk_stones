import Link from 'next/link';
import { preload } from 'react-dom';
import { CaseStudies } from '@/components/marketing/CaseStudies/CaseStudies';
import { Collections } from '@/components/marketing/Collections/Collections';
import { CTA } from '@/components/marketing/CTA/CTA';
import { FAQ } from '@/components/marketing/FAQ/FAQ';
import { Process } from '@/components/marketing/Process/Process';
import { Services } from '@/components/marketing/Services/Services';
import { Stats } from '@/components/marketing/Stats/Stats';
import { Testimonials } from '@/components/marketing/Testimonials/Testimonials';
import { VideoFeature } from '@/components/marketing/VideoFeature/VideoFeature';
import { Icon } from '@/components/ui/Icon';
import { caseStudies, companyStats, featuredReview, home, process, testimonials } from '@/content/pages';
import { imageOrNull, topLevelCategories } from '@/lib/catalog';
import { getSiteImage } from '@/lib/images';
import { buildMetadata } from '@/lib/seo';
import { site } from '@/lib/site';
import styles from './home.module.css';

export const metadata = buildMetadata({
  title: 'S K Stones India | Premium Granite, Marble & Natural Stone in Bengaluru',
  description:
    'Granite, marble and natural stone supplier in Bengaluru since 2014. 460+ stones, fabrication and installation for homes, hotels and commercial projects. Get a free quote.',
  path: '/',
  image: getSiteImage('about-showroom'),
});

export default function HomePage() {
  // Hero backdrop is a CSS background (discovered late) — fetch it immediately.
  preload('/images/textures/nero-portoro-slab-960.avif', {
    as: 'image',
    type: 'image/avif',
    imageSrcSet:
      '/images/textures/nero-portoro-slab-960.avif 960w, /images/textures/nero-portoro-slab-1920.avif 1920w',
    imageSizes: '100vw',
    fetchPriority: 'high',
  });
  const categories = topLevelCategories();
  return (
    <>
      {/* 1. Hero */}
      <section className={`${styles.hero} stone-hero`} aria-labelledby="hero-title">
        <div className={`container ${styles.heroInner}`}>
          <h1 id="hero-title" className={styles.heroTitle}>
            {home.hero.heading} <span className="accent">{home.hero.headingAccent}</span>
          </h1>
          <p className={styles.heroLead}>{home.hero.lead}</p>
          <div className={styles.heroActions}>
            <Link href="/contact#quote" className="btn btn--primary">
              Get a Quote
            </Link>
            <Link href="/products" className="btn btn--outline">
              Browse Stones
            </Link>
          </div>
          <div className={styles.heroStats}>
            <Stats items={companyStats} />
          </div>
        </div>
      </section>

      {/* 2. Featured collections */}
      <section className="section" aria-labelledby="collections-title">
        <div className="container">
          <div className={styles.headRow}>
            <div className="section-head">
              <h2 id="collections-title">
                460+ stones, <span className="accent">one showroom</span>
              </h2>
              <p>
                Granites, marbles, natural stones, quartz, claddings, tiles and handcrafted stone art —
                sourced for quality, durability and design versatility.
              </p>
            </div>
            <Link href="/products" className="link-arrow">
              View all products
            </Link>
          </div>
          <Collections
            dense
            items={categories.map((c) => ({
              href: `/${c.slug}`,
              name: c.name,
              count: c.productCount,
              image: imageOrNull(c.cardImage),
            }))}
          />
        </div>
      </section>

      {/* 3. About */}
      <section className="section" aria-labelledby="about-title">
        <div className={`container ${styles.about}`}>
          <div className={styles.aboutMedia}>
            <VideoFeature title={home.about.video.title} />
            <div className={styles.videoNote}>
              <h3>{home.about.video.title}</h3>
              <p>{home.about.video.text}</p>
            </div>
          </div>
          <div>
            <h2 id="about-title">
              {home.about.heading} <span className="accent">{home.about.headingAccent}</span>
            </h2>
            <p className={styles.aboutText}>{home.about.text}</p>
            <ul className={styles.pillars}>
              {home.about.pillars.map((p) => (
                <li key={p.title}>
                  <div>
                    <h3>{p.title}</h3>
                    <p>{p.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link href="/about" className="link-arrow">
              More about S K Stones India
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Services & process */}
      <section className="section section--tint" aria-labelledby="services-title">
        <div className="container">
          <div className="section-head">
            <h2 id="services-title">
              Supply, fabrication <span className="accent">&amp; installation</span>
            </h2>
            <p>
              From floors and façades to landscapes and bespoke stone art — one team from selection to
              handover.
            </p>
          </div>
          <Services items={home.services.map((s) => ({ ...s, image: getSiteImage(s.image) }))} />
          <div className={styles.processHead}>
            <h3 className={styles.processTitle}>From vision to masterpiece</h3>
          </div>
          <Process steps={process} />
        </div>
      </section>

      {/* 5. Projects */}
      <section className="section section--tint" aria-labelledby="projects-title">
        <div className="container">
          <div className={styles.headRow}>
            <div className="section-head">
              <h2 id="projects-title">
                Trusted for hotels, villas <span className="accent">&amp; infrastructure</span>
              </h2>
            </div>
            <Link href="/projects" className="link-arrow">
              See all projects
            </Link>
          </div>
          <div className={`${styles.caseWrap} on-dark`}>
            <CaseStudies
              items={caseStudies.map((c) => ({
                href: `/${c.slug}`,
                sector: c.sector,
                title: c.cardTitle,
                text: c.cardText,
                image: getSiteImage(c.images[0]!.key),
              }))}
            />
          </div>
        </div>
      </section>

      {/* 6. Testimonials */}
      <section className="section" aria-labelledby="reviews-title">
        <div className="container">
          <div className={styles.headRow}>
            <div className="section-head">
              <h2 id="reviews-title">What architects and homeowners say</h2>
            </div>
            <a href={site.reviewsUrl} className="link-arrow" target="_blank" rel="noopener noreferrer">
              Read more reviews on Google <Icon name="external" />
            </a>
          </div>
          <Testimonials items={testimonials} featured={featuredReview} />
        </div>
      </section>

      {/* 7. FAQ + CTA */}
      <section className="section" aria-labelledby="faq-title">
        <div className={`container ${styles.faq}`}>
          <div className="section-head">
            <h2 id="faq-title">Frequently asked questions</h2>
          </div>
          <FAQ items={home.faqs} />
        </div>
      </section>
      <CTA
        heading="Transform your space with premium stone craftsmanship"
        text="Premium natural stones for homes, offices & commercial spaces. Trusted by architects and builders across India."
      />
    </>
  );
}
