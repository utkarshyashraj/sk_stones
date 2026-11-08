import Link from 'next/link';
import { Enhance } from '@/components/ref/Enhance';
import { FAQAccordion } from '@/components/ref/FAQAccordion';
import { Fa } from '@/components/ref/Fa';
import { HomeVideo } from '@/components/ref/HomeVideo';
import { LightboxData } from '@/components/ref/LightboxData';
import { MoreView } from '@/components/ref/MoreView';
import { RefImg, refImage } from '@/components/ref/RefImg';
import { RefShell } from '@/components/ref/RefShell';
import { SectionHeading } from '@/components/ref/SectionHeading';
import { ServiceCard } from '@/components/ref/ServiceCard';
import {
  faqs,
  featuredReview,
  gallery,
  marquee,
  processSteps,
  reviews,
  services,
  stats,
  trustImage,
  whoWeAre,
  whyCards,
} from '@/content/ref/home';
import { galleryItem } from '@/lib/lightbox-items';
import { pageMetadata } from '@/lib/ref-seo';
import { site } from '@/lib/site';
import '@/styles/ref/home.css';

export const metadata = pageMetadata('index', '/');

const SLIDERS = [
  {
    slider: 'servicesSlider',
    left: 'servicesScrollLeft',
    right: 'servicesScrollRight',
    item: '.service-slide',
    gap: 25,
  },
  {
    slider: 'testimonialSlider',
    left: 'testScrollLeft',
    right: 'testScrollRight',
    item: '.testimonial-card',
    gap: 25,
  },
];

const SwipeHint = () => (
  <p className="mobile-swipe-hint" aria-hidden="true">
    <Fa name="arrow-right" />
  </p>
);

export default function HomePage() {
  return (
    <RefShell bundle="home" bodyClass="showroom-theme page-home" nav="home" tab="home">
      <MoreView />
      <Enhance sliders={SLIDERS} />

      <div className="mobile-more-intro home-defer-mobile" id="mobileMoreIntro">
        <h1>More from S K Stones</h1>
        <p>Who we are, our process, trust, FAQs, and client reviews.</p>
      </div>

      {/* 1. Hero */}
      <section
        className="sk-manifesto sk-manifesto-hero home-primary-mobile"
        id="manifesto"
        aria-label="S K Stones identity"
      >
        <div className="sk-manifesto-inner sk-manifesto-inner--copy-only">
          <div className="sk-manifesto-panel sk-manifesto-copy">
            <div className="manifesto-copy-inner">
              <p className="manifesto-eyebrow">S K Stones India</p>
              <h1>
                <span className="manifesto-line">
                  Uncompromising <span className="gold gold-shimmer">Quality.</span>
                </span>
                <span className="manifesto-line">
                  Exceptional <span className="gold gold-shimmer">Surfaces.</span>
                </span>
              </h1>
              <p className="manifesto-lead">
                Premium granite, marble &amp; natural stone — for homes, hotels &amp; commercial spaces.
              </p>
              <p className="manifesto-trust-pill">
                <span>Architects</span>
                <span className="manifesto-trust-dot" aria-hidden="true" />
                <span>Builders</span>
                <span className="manifesto-trust-dot" aria-hidden="true" />
                <span>Developers</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Marquee */}
      <div className="marquee home-primary-mobile" aria-hidden="true">
        <div className="marquee-content">
          {marquee.flatMap((m, i) => [<span key={`m${i}`}>{m}</span>, <span key={`s${i}`}>★</span>])}
        </div>
      </div>

      {/* 3. Behind the Stone video + Who We Are */}
      <section className="about-section reveal" id="about">
        <div className="about-container">
          <div className="about-logo-area">
            <div className="about-video-frame">
              <HomeVideo />
            </div>
            <div className="about-video-note">
              <span className="about-video-note-label">
                <Fa name="film" /> Behind the Stone
              </span>
              <h3>From Quarry to Finish</h3>
              <p>
                This video takes you through how we source, cut, and prepare every slab — the same precision
                and care that goes into every residential and commercial project we deliver.
              </p>
            </div>
          </div>
          <div className="about-content home-defer-mobile" id="who-we-are">
            <span className="section-label">Who We Are</span>
            <h2>
              Built On <span>Trust.</span> Proven By <span>Results.</span>
            </h2>
            <p>
              From selecting the perfect stone to flawless installation, we bring craftsmanship, consistency,
              and reliability to every project.
            </p>
            <ul className="about-list">
              {whoWeAre.points.map((p) => (
                <li key={p}>
                  <Fa name="check" /> {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Our Services */}
      <section className="services-slider-section reveal home-primary-mobile">
        <div className="services-slider-container">
          <SectionHeading
            className="services-slider-header"
            label="What We Do"
            title={
              <>
                Our <span>Services</span>
              </>
            }
          />
          <SwipeHint />
          <div className="services-wrap">
            <button
              type="button"
              className="testimonial-scroll-btn left"
              id="servicesScrollLeft"
              aria-label="Scroll services left"
            >
              <Fa name="chevron-left" />
            </button>
            <div className="services-slider" id="servicesSlider">
              {services.map((s) => (
                <ServiceCard key={s.title} {...s} />
              ))}
            </div>
            <button
              type="button"
              className="testimonial-scroll-btn right"
              id="servicesScrollRight"
              aria-label="Scroll services right"
            >
              <Fa name="chevron-right" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Our Process */}
      <section className="process-section reveal home-defer-mobile" id="process">
        <SectionHeading
          label="Our Process"
          title={
            <>
              From Vision to <span>Masterpiece</span>
            </>
          }
        />
        <SwipeHint />
        <div className="process-steps">
          {processSteps.map((s, i) => (
            <div
              key={s.num}
              className="process-step"
              style={{ '--step-delay': `${0.05 + i * 0.1}s` } as React.CSSProperties}
            >
              <div className="process-step-num">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Stats (count up from 0) + DFA Architects review */}
      <section className="trust-section reveal home-defer-mobile" id="trust">
        <div className="trust-container">
          <h2>
            Built on <span>Trust.</span> Proven by <span>Results.</span>
          </h2>
          <div className="trust-grid">
            <div className="trust-image">
              <RefImg src={trustImage} alt="Interior" sizes="(min-width: 1025px) 300px, 90vw" />
            </div>
            <SwipeHint />
            <div className="stats-grid">
              {stats.map((s) => (
                <div key={s.label} className="stat-item">
                  <div className="stat-number">
                    <span
                      className="counter"
                      data-target={s.target}
                      data-decimal={s.decimal ? 'true' : undefined}
                    >
                      {s.decimal ? s.target.toFixed(1) : s.target}
                    </span>
                    <sup>{s.suffix}</sup>
                  </div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="trust-text">
              <h3>{featuredReview.heading}</h3>
              <p>{featuredReview.text}</p>
              <div className="trust-author">
                <div className="trust-author-icon" aria-hidden="true">
                  <Fa name="quote-right" />
                </div>
                <div>
                  <span className="trust-author-label">Review by</span>
                  <span className="trust-author-name">{featuredReview.author}</span>
                  <span className="trust-author-meta">{featuredReview.meta}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Why Architects & Builders Choose */}
      <section className="why-section reveal home-primary-mobile">
        <div className="why-container">
          <SectionHeading
            underline={false}
            title={
              <>
                Why <span>Architects</span> &amp; <span>Builders</span> Choose S K Stones India?
              </>
            }
          />
          <SwipeHint />
          <div className="why-cards">
            {whyCards.map((c) => (
              <div key={c.title} className="why-card">
                <div className="why-card-image">
                  <RefImg src={c.image} alt={c.alt} sizes="(min-width: 1025px) 200px, 40vw" />
                </div>
                <div className="why-card-content">
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. See the Craft */}
      <section className="gallery-section home-primary-mobile" id="gallery">
        <SectionHeading
          title={
            <>
              See the <span>Craft</span>
            </>
          }
        />
        <SwipeHint />
        <div className="gallery-grid">
          {gallery.map((g) => (
            <div
              key={g.image}
              className="gallery-item"
              role="button"
              tabIndex={0}
              data-sk-click=""
              aria-label={`View photo: ${g.alt}`}
            >
              <RefImg src={g.image} alt={g.alt} sizes="(min-width: 1025px) 400px, 80vw" />
            </div>
          ))}
        </div>
        <LightboxData
          grid=".gallery-grid"
          item=".gallery-item"
          items={gallery.map((g) => galleryItem(refImage(g.image), g.alt))}
        />
      </section>

      {/* 9. FAQ */}
      <section className="faq-section reveal home-defer-mobile" id="faq">
        <div className="faq-container">
          <SectionHeading
            label="Got Questions?"
            title={
              <>
                Frequently Asked <span>Questions</span>
              </>
            }
          />
          <FAQAccordion items={faqs} />
          <div className="faq-cta">
            <p>Still have questions? We&apos;re happy to help.</p>
            <Link className="btn btn-primary" href="/contact">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* 10. CTA banner */}
      <section className="cta-section reveal home-primary-mobile">
        <div className="cta-content">
          <h2 className="cta-title">
            <span className="cta-line cta-line-1">Transform Your Space With</span>
            <span className="cta-line cta-line-2">
              Premium <span className="cta-gold">Stone Craftsmanship</span>
            </span>
          </h2>
          <div className="cta-underline" />
          <p className="cta-desc">
            Premium natural stones for homes, offices &amp; commercial spaces. Trusted by architects and
            builders across India.
          </p>
          <div className="cta-actions">
            <Link className="btn btn-primary" href="/contact">
              Get Started Today
            </Link>
          </div>
        </div>
      </section>

      {/* 11. Client Reviews */}
      <section className="testimonials-section home-defer-mobile" id="testimonials">
        <SectionHeading
          title={
            <>
              Client <span>Reviews</span>
            </>
          }
        >
          <a
            href={site.googleReviews}
            target="_blank"
            rel="noopener noreferrer"
            className="reviews-google-link"
          >
            <Fa name="google" /> Read More Reviews on Google
          </a>
        </SectionHeading>
        <SwipeHint />
        <div className="testimonial-wrap">
          <button
            type="button"
            className="testimonial-scroll-btn left"
            id="testScrollLeft"
            aria-label="Scroll reviews left"
          >
            <Fa name="chevron-left" />
          </button>
          <div className="testimonial-slider" id="testimonialSlider">
            {reviews.map((r) => (
              <div key={r.name} className="testimonial-card">
                <Fa name="quote-left" className="quote-icon" />
                <p>{r.text}</p>
                <h4>{r.name}</h4>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="testimonial-scroll-btn right"
            id="testScrollRight"
            aria-label="Scroll reviews right"
          >
            <Fa name="chevron-right" />
          </button>
        </div>
      </section>
    </RefShell>
  );
}
