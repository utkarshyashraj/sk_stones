import Link from 'next/link';
import { CaseStudies } from '@/components/marketing/CaseStudies/CaseStudies';
import { CTA } from '@/components/marketing/CTA/CTA';
import { Gallery } from '@/components/marketing/Gallery/Gallery';
import { PageHero } from '@/components/marketing/PageHero/PageHero';
import { Stats } from '@/components/marketing/Stats/Stats';
import { Icon } from '@/components/ui/Icon';
import { caseStudies, type CaseStudy } from '@/content/pages';
import { getSiteImage } from '@/lib/images';
import { buildMetadata } from '@/lib/seo';
import styles from './templates.module.css';

const bySlug = (slug: string): CaseStudy => {
  const c = caseStudies.find((x) => x.slug === slug);
  if (!c) throw new Error(`Unknown case study ${slug}`);
  return c;
};

export const caseStudyMetadata = (slug: string) => {
  const c = bySlug(slug);
  return buildMetadata({
    title: c.title,
    description: c.description,
    path: `/${c.slug}`,
    image: getSiteImage(c.images[0]!.key),
    type: 'article',
  });
};

export function CaseStudyView({ slug }: { slug: string }) {
  const c = bySlug(slug);
  const others = caseStudies.filter((x) => x.slug !== c.slug);
  return (
    <>
      <PageHero
        crumbs={[
          { name: 'Home', href: '/' },
          { name: 'Projects', href: '/projects' },
          { name: c.cardTitle, href: `/${c.slug}` },
        ]}
        eyebrow={`Case study · ${c.sector}`}
        title={c.heading}
        lead={<p>{c.lead}</p>}
        background={getSiteImage(c.images[0]!.key)}
      >
        <div className={styles.facts}>
          <Stats items={c.facts} />
        </div>
      </PageHero>
      <section className="section" aria-label="Case study details">
        <div className={`container ${styles.caseBody}`}>
          <div className={styles.caseText}>
            {c.sections.map((s) => (
              <section key={s.heading} aria-labelledby={`cs-${s.heading.replace(/\W+/g, '-')}`}>
                <h2 id={`cs-${s.heading.replace(/\W+/g, '-')}`}>{s.heading}</h2>
                {s.paragraphs?.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                {s.list ? (
                  <ul className={styles.scope}>
                    {s.list.map((l) => (
                      <li key={l}>
                        <Icon name="check" size={16} /> {l}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
            <Link href="/projects" className="link-arrow">
              <Icon name="chevron-left" /> All projects
            </Link>
          </div>
          <div>
            <Gallery
              label={`${c.cardTitle} photos`}
              images={c.images.map((g) => ({ image: getSiteImage(g.key), alt: g.alt }))}
            />
          </div>
        </div>
      </section>
      <section className="section section--dark" aria-labelledby="more-cases">
        <div className="container">
          <div className="section-head">
            <h2 id="more-cases">More case studies</h2>
          </div>
          <CaseStudies
            items={others.map((o) => ({
              href: `/${o.slug}`,
              sector: o.sector,
              title: o.cardTitle,
              text: o.cardText,
              image: getSiteImage(o.images[0]!.key),
            }))}
          />
        </div>
      </section>
      <CTA
        heading={c.cta.heading}
        text={c.cta.text}
        primary={{ label: c.cta.button, href: '/contact#quote' }}
        whatsappMessage={c.cta.whatsapp}
      />
    </>
  );
}
