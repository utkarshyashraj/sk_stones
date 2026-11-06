import { CaseStudies } from '@/components/marketing/CaseStudies/CaseStudies';
import { CTA } from '@/components/marketing/CTA/CTA';
import { Gallery } from '@/components/marketing/Gallery/Gallery';
import { PageHero } from '@/components/marketing/PageHero/PageHero';
import { caseStudies, projectGallery } from '@/content/pages';
import { getSiteImage } from '@/lib/images';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Our Projects & Case Studies | S K Stones India',
  description:
    'Stone projects by S K Stones India: luxury hotel façade cladding, villa marble flooring, airport and hospital lobbies, wall cladding and custom stone art.',
  path: '/projects',
  image: getSiteImage('project-ritz-carlton'),
});

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        crumbs={[
          { name: 'Home', href: '/' },
          { name: 'Projects', href: '/projects' },
        ]}
        title={
          <>
            Our <span className="accent">projects</span>
          </>
        }
        lead={
          <p>
            Featured case studies and our full project gallery — premium natural stones for homes, offices &
            commercial spaces. Trusted by architects and builders across India.
          </p>
        }
        background={getSiteImage('gallery-hotel-reception')}
      />
      <section className="section section--dark" aria-labelledby="cases-title">
        <div className="container">
          <div className="section-head">
            <h2 id="cases-title">How we deliver at scale</h2>
          </div>
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
      </section>
      <section className="section tone-light" aria-labelledby="gallery-title">
        <div className="container">
          <div className="section-head">
            <h2 id="gallery-title">See the craft</h2>
          </div>
          <Gallery
            label="Project gallery"
            images={projectGallery.map((g) => ({ image: getSiteImage(g.key), alt: g.alt }))}
          />
        </div>
      </section>
      <CTA
        heading="Ready to start your project?"
        text="Let us help you transform your space with premium stone craftsmanship."
      />
    </>
  );
}
