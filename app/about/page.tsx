import { CTA } from '@/components/marketing/CTA/CTA';
import { PageHero } from '@/components/marketing/PageHero/PageHero';
import { Picture } from '@/components/ui/Picture';
import { about, companyStats } from '@/content/pages';
import { getSiteImage } from '@/lib/images';
import { buildMetadata } from '@/lib/seo';
import styles from './about.module.css';

export const metadata = buildMetadata({
  title: 'About Us | S K Stones India (formerly Shree Stones & Services)',
  description:
    'Meet S K Stones India: 12+ years and 200+ stone projects for hotels, villas, airports and healthcare. Founder Shree Kumar Gandhi and our Bengaluru team.',
  path: '/about',
  image: getSiteImage('team-photo'),
});

export default function AboutPage() {
  const [quote, ...story] = about.founder.paragraphs;
  const figures = companyStats.filter((s) => !s.value.includes('/'));
  return (
    <>
      <PageHero
        crumbs={[
          { name: 'Home', href: '/' },
          { name: 'About Us', href: '/about' },
        ]}
        title={
          <>
            {about.hero.heading} <span className="accent">{about.hero.headingAccent}</span>
          </>
        }
        lead={<p>{about.hero.lead}</p>}
        aside={{ image: getSiteImage('about-showroom'), alt: 'Marble flooring in a modern interior' }}
      >
        <ul className={`dash-list ${styles.points}`}>
          {about.hero.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </PageHero>

      {/* Company story: editorial split — purpose, figures, sectors */}
      <section className="section veil-text" aria-labelledby="purpose-title">
        <div className={`container ${styles.split}`}>
          <div className={styles.media}>
            <Picture
              image={getSiteImage('project-luxury-lobby')}
              alt="Corporate lobby with stone flooring by S K Stones India"
              sizes="(min-width: 1024px) 40vw, 100vw"
              imgClassName={styles.img}
            />
          </div>
          <div>
            <h2 id="purpose-title" className="rule">
              Building purpose through continuous growth
            </h2>
            <ol className={styles.purpose}>
              {about.purpose.map((p, i) => (
                <li key={p.title}>
                  <span className={styles.num} aria-hidden="true">
                    0{i + 1}
                  </span>
                  <div>
                    <h3>{p.title}</h3>
                    <p>{p.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <dl className={styles.figures}>
              {figures.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
            <p className={styles.sectorsLabel}>Trusted by architects, builders &amp; developers across</p>
            <ul className={styles.sectors}>
              {about.sectors.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Founder: dedicated profile */}
      <section className="section" aria-labelledby="founder-title">
        <div className={`container ${styles.founder}`}>
          <div className={styles.founderMedia}>
            <Picture
              image={getSiteImage('ceo-shree-kumar-gandhi')}
              alt="Shree Kumar Gandhi, Founder and CEO"
              sizes="(min-width: 1024px) 30vw, 80vw"
              imgClassName={styles.img}
            />
          </div>
          <div className={styles.founderBody}>
            <h2 id="founder-title">{about.founder.name}</h2>
            <p className={styles.role}>{about.founder.role}</p>
            <blockquote className={styles.pull}>
              <p>{quote}</p>
            </blockquote>
            <div className={`prose ${styles.founderText}`}>
              {story.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section veil-text" aria-labelledby="team-title">
        <div className="container">
          <div className="section-head">
            <h2 id="team-title">Our expert team</h2>
            <p>
              Our skilled designers, engineers, and craftsmen work together to deliver precise stone
              solutions.
            </p>
          </div>
          <figure className={styles.team}>
            <Picture
              image={getSiteImage('team-photo')}
              alt="The S K Stones India team"
              sizes="(min-width: 1024px) 60vw, 100vw"
              imgClassName={styles.img}
            />
            <figcaption>
              <p className={styles.teamNote}>Left to right in the photo:</p>
              <ol className={styles.teamList}>
                {about.team.map((m) => (
                  <li key={m.name}>
                    <strong>{m.name}</strong>
                    <span>{m.role}</span>
                  </li>
                ))}
              </ol>
            </figcaption>
          </figure>
        </div>
      </section>

      <CTA
        heading="Transform your space with premium stone craftsmanship"
        text="Premium natural stones for homes, offices & commercial spaces. Trusted by architects and builders across India."
      />
    </>
  );
}
