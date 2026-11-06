import Link from 'next/link';
import { Collections } from '@/components/marketing/Collections/Collections';
import { CTA } from '@/components/marketing/CTA/CTA';
import { FAQ } from '@/components/marketing/FAQ/FAQ';
import { Gallery } from '@/components/marketing/Gallery/Gallery';
import { PageHero } from '@/components/marketing/PageHero/PageHero';
import { Stats } from '@/components/marketing/Stats/Stats';
import { services, type ServicePage } from '@/content/pages';
import { getCategory, imageOrNull } from '@/lib/catalog';
import { getSiteImage } from '@/lib/images';
import { buildMetadata } from '@/lib/seo';
import type { Category } from '@/lib/types';
import styles from './templates.module.css';

export const serviceBySlug = (slug: string): ServicePage => {
  const s = services.find((x) => x.slug === slug);
  if (!s) throw new Error(`Unknown service ${slug}`);
  return s;
};

export const serviceMetadata = (slug: string) => {
  const s = serviceBySlug(slug);
  return buildMetadata({
    title: s.title,
    description: s.description,
    path: `/${s.slug}`,
    image: getSiteImage(s.heroImage),
  });
};

export function ServicePageView({ slug }: { slug: string }) {
  const s = serviceBySlug(slug);
  const related = s.relatedCategories.map(getCategory).filter((c): c is Category => Boolean(c));
  const others = services.filter((x) => x.slug !== s.slug);
  return (
    <>
      <PageHero
        crumbs={[
          { name: 'Home', href: '/' },
          { name: s.name, href: `/${s.slug}` },
        ]}
        title={s.heading}
        lead={<p>{s.lead}</p>}
        aside={{ image: getSiteImage(s.heroImage), alt: s.gallery.images[0]?.alt ?? s.name }}
        actions={
          <>
            <Link
              href={`/contact?${new URLSearchParams({ name: `${s.name} service` }).toString()}#quote`}
              className="btn btn--primary"
            >
              Get a quote
            </Link>
          </>
        }
      />
      <section className="section section--dark" aria-labelledby="approach-title">
        <div className="container">
          <Stats items={s.stats} />
          <div className={`section-head ${styles.approachHead}`}>
            <h2 id="approach-title">{s.approach.heading}</h2>
            <p>{s.approach.text}</p>
          </div>
          <ul className={styles.pillars}>
            {s.approach.pillars.map((p) => (
              <li key={p.title} className={styles.pillar}>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
                <ul className="dash-list">
                  {p.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="section" aria-labelledby="work-title">
        <div className="container">
          <div className="section-head">
            <h2 id="work-title">{s.gallery.heading}</h2>
            <p>{s.gallery.text}</p>
          </div>
          <Gallery
            label={s.gallery.heading}
            images={s.gallery.images.map((g) => ({ image: getSiteImage(g.key), alt: g.alt }))}
          />
        </div>
      </section>
      {related.length ? (
        <section className="section section--tint" aria-labelledby="materials-title">
          <div className="container">
            <div className="section-head">
              <h2 id="materials-title">Popular stones for {s.name.toLowerCase()}</h2>
            </div>
            <Collections
              compact
              items={related.map((c) => ({
                href: `/${c.slug}`,
                name: c.name,
                description: c.cardDescription,
                count: c.productCount,
                image: imageOrNull(c.cardImage),
              }))}
            />
          </div>
        </section>
      ) : null}
      <section className="section" aria-labelledby="faq-title">
        <div className={`container ${styles.faqGrid}`}>
          <div className="section-head">
            <h2 id="faq-title">Frequently asked questions</h2>
            <p>{s.faqIntro}</p>
            <div className={styles.otherServices}>
              <p>Other services</p>
              <ul>
                {others.map((o) => (
                  <li key={o.slug}>
                    <Link href={`/${o.slug}`} className="link-arrow">
                      {o.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <FAQ items={s.faqs} />
        </div>
      </section>
      <CTA
        heading={s.cta.heading}
        text={s.cta.text}
        whatsappMessage={`Hi S K Stones India, I'd like a quote for ${s.name.toLowerCase()}.`}
      />
    </>
  );
}
