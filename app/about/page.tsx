import Link from 'next/link';
import { AboutEnhance } from '@/components/ref/AboutEnhance';
import { Enhance } from '@/components/ref/Enhance';
import { Fa } from '@/components/ref/Fa';
import { RefImg } from '@/components/ref/RefImg';
import { RefShell } from '@/components/ref/RefShell';
import {
  aboutMarquee,
  founderParagraphs,
  purposeCards,
  team,
  trustedLogos,
  whyChoose,
} from '@/content/ref/about';
import { getSiteImage } from '@/lib/images';
import { pageMetadata } from '@/lib/ref-seo';
import '@/styles/ref/about.css';

export const metadata = pageMetadata('about', '/about');

const SwipeHint = ({ className = '' }: { className?: string }) => (
  <p className={`mobile-swipe-hint${className ? ` ${className}` : ''}`} aria-hidden="true">
    <Fa name="arrow-right" />
  </p>
);

export default function AboutPage() {
  return (
    <RefShell bundle="about" nav="about" tab="about">
      <Enhance />
      <AboutEnhance />
      <section className="about-hero">
        <div className="about-hero-grid">
          <div className="about-hero-content">
            <h1>
              <span>Premium</span> Stones For Every <span>Vision,</span> Every <span>Space.</span>
            </h1>
          </div>
          <div className="about-hero-image">
            <RefImg
              src="images/about-hero-banner.jpg"
              alt="Luxury Interior"
              sizes="(min-width: 1025px) 50vw, 100vw"
              priority
            />
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-content">
          {aboutMarquee.flatMap((m, i) => [<span key={`m${i}`}>{m}</span>, <span key={`s${i}`}>★</span>])}
        </div>
      </div>

      <section className="trusted-section reveal" aria-label="Trusted by">
        <div className="trusted-inner">
          <p className="trusted-label">Trusted By Leading Brands &amp; Institutions</p>
        </div>
        <div className="trusted-band">
          <SwipeHint />
          <div className="trusted-logos trusted-logos--clients">
            {trustedLogos.map((l) => (
              <div key={l.alt} className="trusted-logo-card">
                <RefImg src={l.image} alt={l.alt} sizes="160px" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="purpose-section">
        <div className="purpose-grid">
          <div className="purpose-image" id="purposeImage">
            <RefImg
              src="images/project-luxury-lobby.png"
              alt="Corporate Lobby"
              sizes="(min-width: 1025px) 50vw, 100vw"
            />
          </div>
          <div className="purpose-feature-content" id="purposeContent">
            <h2>
              Building <span>Purpose</span> Through Continuous <span>Growth</span>
            </h2>
            <SwipeHint className="purpose-swipe-hint" />
            <div className="purpose-cards">
              {purposeCards.map((c, i) => (
                <div key={c.title} className="purpose-card">
                  <div className="purpose-card-number">
                    /0{i + 1} <Fa name={c.icon} />
                  </div>
                  <div className="purpose-card-content">
                    <h3>{c.title}</h3>
                    <p>{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="why-section">
        <div className="why-container">
          <div className="section-header">
            <h2>
              Why Choose <span>S K Stones India?</span>
            </h2>
            <p>
              Committed to quality, precision, and client satisfaction. Our expertise spans across
              residential, commercial, and architectural projects.
            </p>
          </div>
          <SwipeHint className="why-swipe-hint" />
          <div className="why-cards">
            {whyChoose.map((c) => (
              <div key={c.title} className="why-card">
                <div className="why-card-icon">
                  <Fa name={c.icon} />
                </div>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="founder-section">
        <div className="founder-grid">
          <div className="founder-image" id="founderImage">
            <RefImg
              src="images/ceo-shree-kumar-gandhi.png?v=2"
              alt="Shree Kumar Gandhi, Founder & CEO"
              sizes="(min-width: 1025px) 40vw, 90vw"
            />
          </div>
          <div className="founder-content" id="founderContent">
            <h2>Shree Kumar Gandhi</h2>
            <p className="designation">Founder &amp; CEO, S K Stones India Pvt. Ltd.</p>
            {founderParagraphs.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="team-section" id="team">
        <div className="section-header">
          <h2>
            Our Expert <span>Team</span>
          </h2>
        </div>
        <div className="team-layout">
          <div className="team-photo visible" id="teamPhoto">
            <div className="team-photo-panel">
              <div className="team-photo-frame">
                {/* The reference design's team photo (skstone.netlify.app/about). */}
                <RefImg
                  image={getSiteImage('ref-team-photo')}
                  alt="S K Stones India Team"
                  sizes="(min-width: 1025px) 50vw, 100vw"
                />
              </div>
            </div>
          </div>
          <div className="team-right">
            <div className="team-grid">
              <div className="team-founder" id="teamFounder" data-delay="0">
                <span className="team-num">01</span>
                <span className="team-badge">
                  <Fa name="crown" /> Founder
                </span>
                <h4>Shree Kumar Gandhi</h4>
                <p>Founder &amp; CEO</p>
              </div>
              {team.map((m, i) => (
                <div key={m.name} className="team-card" data-delay={120 + i * 100}>
                  <span className="team-num">0{i + 2}</span>
                  <h4>{m.name}</h4>
                  <p>{m.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section reveal">
        <div className="cta-content">
          <h2>
            Transform Your Space With Premium <span className="cta-gold">Stone Craftsmanship</span>
          </h2>
          <p>
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
    </RefShell>
  );
}
