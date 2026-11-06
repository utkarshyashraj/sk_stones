import Link from 'next/link';
import { Collections } from '@/components/marketing/Collections/Collections';
import { CTA } from '@/components/marketing/CTA/CTA';
import { FAQ } from '@/components/marketing/FAQ/FAQ';
import { Process } from '@/components/marketing/Process/Process';
import { Testimonials } from '@/components/marketing/Testimonials/Testimonials';
import { VideoFeature } from '@/components/marketing/VideoFeature/VideoFeature';
import { Picture } from '@/components/ui/Picture';
import {
  caseStudies,
  companyStats,
  featuredReview,
  home,
  process,
  services,
  testimonials,
} from '@/content/pages';
import { allProducts, categoryNames, imageOrNull, topLevelCategories } from '@/lib/catalog';
import { getImage, getSiteImage } from '@/lib/images';
import { buildMetadata } from '@/lib/seo';
import styles from './home.module.css';

export const metadata = buildMetadata({
  title: 'S K Stones India | Premium Granite, Marble & Natural Stone in Bengaluru',
  description:
    'Granite, marble and natural stone supplier in Bengaluru since 2014. 460+ stones, fabrication and installation for homes, hotels and commercial projects. Get a free quote.',
  path: '/',
  image: getSiteImage('project-ritz-carlton'),
});

/** Editorial selection of real catalogue stones (photographed at high resolution) for the homepage. */
const HERO_STONES = [
  'imported-marbles-nero-portoro',
  'indian-marbles-rainforest-gold',
  'imported-marbles-travertine-golden',
  'imported-granites-patagonia-green',
];
const FEATURED_STONES = [
  'imported-marbles-spider-black',
  'imported-marbles-honey-onyx',
  'imported-marbles-crema-marfil',
  'imported-granites-roma-imperiale',
  'indian-marbles-rainforest-gold',
  'quartz-surfaces-calacatta-venezia',
  'sand-stones-yellow-fossil-leathered',
  'imported-marbles-nero-portoro',
];

function stone(id: string) {
  const p = allProducts().find((x) => x.id === id);
  if (!p?.image) throw new Error(`Featured stone ${id} missing`);
  return { ...p, img: getImage(p.image), href: `/${p.collection}#product=${p.id}` };
}

/** Service pages + the cladding/elevation category, de-duplicated (the old tiles pointed 7 cards at 5 places). */
const SERVICE_LINKS = [
  ...services.map((s) => ({ name: s.name, href: `/${s.slug}`, text: s.lead })),
  {
    name: 'Elevations & Wall Cladding',
    href: '/wall-claddings',
    text: 'Grand stone elevations and façade cladding that elevate architectural presence with texture, depth, and lasting curb appeal.',
  },
];

export default function HomePage() {
  const categories = topLevelCategories();
  const names = categoryNames();
  const heroStones = HERO_STONES.map(stone);
  const featured = FEATURED_STONES.map(stone);
  const [leadCase, ...otherCases] = caseStudies;
  const figures = companyStats.filter((s) => !s.value.includes('/'));

  return (
    <>
      {/* 1. Hero — who we are, what we offer, one clear next step */}
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroText}>
            <h1 id="hero-title" className={styles.heroTitle}>
              {home.hero.heading} <span className="accent">{home.hero.headingAccent}</span>
            </h1>
            <p className={styles.heroLead}>
              Granite, marble and natural stone — sourced, fabricated and installed for homes, hotels and
              commercial projects across India.
            </p>
            <div className={styles.heroActions}>
              <Link href="/contact#quote" className="btn btn--primary">
                Request a quote
              </Link>
              <Link href="/products" className="btn btn--outline">
                Explore 460+ stones
              </Link>
            </div>
            <p className={styles.heroFacts}>Since 2014 · Showroom in Koramangala, Bengaluru</p>
          </div>
          <ul className={styles.mosaic} aria-label="Stones from our collection">
            {heroStones.map((s, i) => (
              <li key={s.id} className={styles[`tile${i}`]}>
                <Link href={s.href} className={styles.tileLink}>
                  <Picture
                    image={s.img}
                    alt={`${s.name} — ${names[s.collection]}`}
                    sizes="(min-width: 1024px) 26vw, 50vw"
                    priority={i === 0}
                    fill
                  />
                  <span className={styles.tileName}>{s.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 2. Product discovery */}
      <section className="section tone-light" aria-labelledby="categories-title">
        <div className="container">
          <div className={styles.headRow}>
            <div className="section-head">
              <h2 id="categories-title">Browse by category</h2>
              <p>Nine categories, from marbles and granites to cladding, tiles and handcrafted stone art.</p>
            </div>
            <Link href="/products" className="link-arrow">
              All products
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

      {/* 3. Featured stones */}
      <section className="section" aria-labelledby="featured-title">
        <div className="container">
          <div className={styles.headRow}>
            <div className="section-head">
              <h2 id="featured-title">
                Featured <span className="accent">stones</span>
              </h2>
              <p>A few of the slabs architects ask for most — tap any stone for a closer look.</p>
            </div>
            <Link href="/search" className="link-arrow">
              Search the full catalogue
            </Link>
          </div>
          <ul className={styles.featured}>
            {featured.map((s) => (
              <li key={s.id}>
                <Link href={s.href} className={styles.stoneCard}>
                  <span className={styles.stoneMedia}>
                    <Picture image={s.img} alt="" sizes="(min-width: 1024px) 23vw, 46vw" fill />
                  </span>
                  <span className={styles.stoneName}>{s.name}</span>
                  <span className={styles.stoneMeta}>{names[s.collection]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4. Why choose us */}
      <section className="section tone-light" aria-labelledby="why-title">
        <div className={`container ${styles.why}`}>
          <div className={styles.whyIntro}>
            <h2 id="why-title" className="rule">
              Why architects &amp; builders choose us
            </h2>
            <p>
              Our stone expertise, sourcing strength, and design-driven approach help homeowners, architects,
              and builders achieve flawless results.
            </p>
          </div>
          <ol className={styles.pillars}>
            {home.about.pillars.map((p, i) => (
              <li key={p.title}>
                <span className={styles.pillarNum} aria-hidden="true">
                  0{i + 1}
                </span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className={`container ${styles.processWrap}`}>
          <h3 className={styles.processTitle}>How we work</h3>
          <Process steps={process} />
        </div>
      </section>

      {/* 5. Projects & services */}
      <section className="section" aria-labelledby="projects-title">
        <div className="container">
          <div className={styles.headRow}>
            <div className="section-head">
              <h2 id="projects-title">Projects &amp; applications</h2>
              <p>
                Hotels, villas, airports and hospitals — supplied, fabricated and installed by our own teams.
              </p>
            </div>
            <Link href="/projects" className="link-arrow">
              All projects
            </Link>
          </div>
          <div className={styles.projects}>
            <Link href={`/${leadCase!.slug}`} className={`${styles.project} ${styles.projectLead}`}>
              <span className={styles.projectMedia}>
                <Picture
                  image={getSiteImage(leadCase!.images[0]!.key)}
                  alt=""
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  fill
                />
              </span>
              <span className={styles.projectSector}>{leadCase!.sector}</span>
              <span className={styles.projectTitle}>{leadCase!.cardTitle}</span>
              <span className={styles.projectText}>{leadCase!.cardText}</span>
            </Link>
            {otherCases.map((c) => (
              <Link key={c.slug} href={`/${c.slug}`} className={styles.project}>
                <span className={styles.projectMedia}>
                  <Picture
                    image={getSiteImage(c.images[0]!.key)}
                    alt=""
                    sizes="(min-width: 1024px) 30vw, 100vw"
                    fill
                  />
                </span>
                <span className={styles.projectSector}>{c.sector}</span>
                <span className={styles.projectTitle}>{c.cardTitle}</span>
              </Link>
            ))}
          </div>
          <div className={styles.servicesBlock}>
            <h3 className={styles.servicesTitle}>Services</h3>
            <ul className={styles.services}>
              {SERVICE_LINKS.map((s) => (
                <li key={s.href}>
                  <Link href={s.href}>
                    <span className={styles.serviceName}>{s.name}</span>
                    <span className={styles.serviceText}>{s.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 6. Company story & credibility */}
      <section className="section tone-light" aria-labelledby="story-title">
        <div className={`container ${styles.story}`}>
          <div className={styles.storyMedia}>
            <VideoFeature title={home.about.video.title} />
            <p className={styles.storyCaption}>{home.about.video.text}</p>
          </div>
          <div>
            <h2 id="story-title" className="rule">
              {home.about.heading} <span className="accent">{home.about.headingAccent}</span>
            </h2>
            <p className={styles.storyText}>{home.about.text}</p>
            <dl className={styles.figures}>
              {figures.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
            <Link href="/about" className="link-arrow">
              Our story &amp; team
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Testimonials */}
      <section className="section" aria-labelledby="reviews-title">
        <div className="container">
          <div className="section-head">
            <h2 id="reviews-title">What our clients say</h2>
          </div>
          <Testimonials items={testimonials} featured={featuredReview} />
        </div>
      </section>

      {/* 8. FAQ */}
      <section className="section tone-light" aria-labelledby="faq-title">
        <div className={`container ${styles.faq}`}>
          <div className="section-head">
            <h2 id="faq-title">Frequently asked questions</h2>
          </div>
          <FAQ items={home.faqs} />
        </div>
      </section>

      {/* 9. Enquiry */}
      <CTA
        heading="Planning a project? Let's talk stone."
        text="Share your space, stone preference and quantities — our team replies within 24 hours with guidance and a tailored quote."
      />
    </>
  );
}
