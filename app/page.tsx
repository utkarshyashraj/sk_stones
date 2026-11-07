import Link from 'next/link';
import { ApplicationsGrid } from '@/components/home/ApplicationsGrid';
import { CollectionsShowcase } from '@/components/home/CollectionsShowcase';
import { FinalCta } from '@/components/home/FinalCta';
import { FinishesRow } from '@/components/home/FinishesRow';
import { HomeFaq } from '@/components/home/HomeFaq';
import { HomeHero } from '@/components/home/HomeHero';
import { ProcessTimeline } from '@/components/home/ProcessTimeline';
import { ProjectsGallery } from '@/components/home/ProjectsGallery';
import { ShowroomVisit } from '@/components/home/ShowroomVisit';
import { TestimonialsCarousel } from '@/components/home/TestimonialsCarousel';
import { TrustSection } from '@/components/home/TrustSection';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { applications, finishes, homeHero, sectionCopy as copy } from '@/content/home';
import {
  caseStudies,
  companyStats,
  featuredReview,
  home,
  process,
  projectGallery,
  testimonials,
} from '@/content/pages';
import { allCategories, allProducts, imageOrNull, topLevelCategories } from '@/lib/catalog';
import { getImage, getSiteImage } from '@/lib/images';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'S K Stones India | Premium Granite, Marble & Natural Stone in Bengaluru',
  description:
    'Granite, marble and natural stone supplier in Bengaluru since 2014. 460+ stones, fabrication and installation for homes, hotels and commercial projects. Get a free quote.',
  path: '/',
  image: getSiteImage('project-ritz-carlton'),
});

const product = (id: string) => {
  const p = allProducts().find((x) => x.id === id);
  if (!p?.image) throw new Error(`Homepage references unknown product ${id}`);
  return { ...p, img: getImage(p.image) };
};

/** First sentence (or clause) of a category's own card description, for the collection cards. */
const descriptor = (text?: string) => text?.split(/,|—/)[0]?.trim();

export default function HomePage() {
  const trust = companyStats.filter((s) => !s.value.includes('/')); // 12+ · 200+ · 50+ (the unsourced 4.9/5 is omitted)

  const collections = topLevelCategories().map((c) => ({
    href: `/${c.slug}`,
    name: c.name,
    descriptor: descriptor(c.cardDescription),
    count: c.productCount,
    image: imageOrNull(c.cardImage),
  }));

  // Recommended collections per application come from catalogue data (top-level first, else collections).
  const cats = allCategories();
  const products = allProducts();
  const appTiles = applications.map((a) => {
    const top = cats.filter((c) => !c.parent && c.applications.includes(a.application) && c.productCount > 0);
    const rec = (
      top.length ? top : cats.filter((c) => c.applications.includes(a.application) && c.productCount > 0)
    ).map((c) => c.name);
    return {
      label: a.label,
      href: `/search?${new URLSearchParams({ application: a.application }).toString()}`,
      image: imageOrNull(a.image),
      recommended: rec.slice(0, 4),
      // Same filter the tile links to (product-level applications), so the number matches the results page.
      count: products.filter((p) => p.applications.includes(a.application)).length,
    };
  });

  const projects = caseStudies.map((c) => {
    const fact = (label: string) => c.facts.find((f) => f.label.toLowerCase().startsWith(label))?.value;
    return {
      href: `/${c.slug}`,
      title: c.cardTitle,
      sector: c.sector,
      facts: [
        fact('material'),
        c.facts[0] ? `${c.facts[0].value} ${c.facts[0].label.toLowerCase()}` : undefined,
      ].filter((x): x is string => Boolean(x)),
      image: getSiteImage(c.images[0]!.key),
    };
  });
  // Homepage strip leaves out the cheetah art piece (still shown in the full /projects gallery).
  const strip = projectGallery
    .filter((g) => g.key !== 'cheetah-stone-art')
    .slice(0, 4)
    .map((g) => ({ image: getSiteImage(g.key), alt: g.alt }));

  const finishSwatches = finishes.map((f) => {
    const p = product(f.productId);
    return {
      name: f.name,
      text: f.text,
      stone: p.name,
      image: p.img,
      href: `/search?finish=${encodeURIComponent(f.filter)}`,
    };
  });

  return (
    <>
      {/* ===== Dark zone: hero + collections ===== */}
      <HomeHero
        heading={home.hero.heading}
        headingAccent={home.hero.headingAccent}
        subhead={homeHero.subhead}
        primary={homeHero.primary}
        secondary={homeHero.secondary}
        trust={trust}
      />
      <section className="section veil-mid" aria-labelledby="collections-title">
        <div className="container">
          <SectionHeader
            id="collections-title"
            eyebrow={copy.collections.eyebrow}
            title={copy.collections.title}
            intro={copy.collections.intro}
            aside={
              <Link href="/products" className="link-arrow">
                All products →
              </Link>
            }
          />
          <CollectionsShowcase items={collections} />
        </div>
      </section>

      {/* ===== Light zone: trust, applications, process ===== */}
      <section className="section veil-text" aria-labelledby="trust-title">
        <TrustSection
          eyebrow={copy.trust.eyebrow}
          heading={home.about.heading}
          headingAccent={home.about.headingAccent}
          text={home.about.text}
          videoTitle={home.about.video.title}
          videoCaption={home.about.video.text}
          stats={trust}
        />
      </section>
      <section className="section veil-mid" aria-labelledby="applications-title">
        <div className="container">
          <SectionHeader
            id="applications-title"
            eyebrow={copy.applications.eyebrow}
            title={copy.applications.title}
            intro={copy.applications.intro}
          />
          <ApplicationsGrid items={appTiles} />
        </div>
      </section>
      <section className="section veil-text" aria-labelledby="process-title">
        <div className="container">
          <SectionHeader
            id="process-title"
            eyebrow={copy.process.eyebrow}
            title={
              <>
                {copy.process.title} <span className="accent">{copy.process.titleAccent}</span>
              </>
            }
          />
          <ProcessTimeline steps={process} />
        </div>
      </section>

      {/* ===== Dark zone: projects + testimonials ===== */}
      <section className="section veil-mid" aria-labelledby="projects-title">
        <div className="container">
          <SectionHeader
            id="projects-title"
            eyebrow={copy.projects.eyebrow}
            title={
              <>
                {copy.projects.title} <span className="accent">{copy.projects.titleAccent}</span>
              </>
            }
            intro={copy.projects.intro}
            aside={
              <Link href="/projects" className="btn btn--outline">
                View all projects
              </Link>
            }
          />
          <ProjectsGallery projects={projects} strip={strip} />
        </div>
      </section>
      <section className="section veil-mid" aria-labelledby="testimonials-title">
        <div className="container">
          <SectionHeader
            id="testimonials-title"
            eyebrow={copy.testimonials.eyebrow}
            title={copy.testimonials.title}
          />
          <TestimonialsCarousel featured={featuredReview} items={testimonials} />
        </div>
      </section>

      {/* ===== Light zone: finishes, showroom, FAQ ===== */}
      <section className="section veil-mid" aria-labelledby="finishes-title">
        <div className="container">
          <SectionHeader
            id="finishes-title"
            eyebrow={copy.finishes.eyebrow}
            title={copy.finishes.title}
            intro={copy.finishes.intro}
          />
          <FinishesRow items={finishSwatches} />
        </div>
      </section>
      <section id="showroom" className="section veil-text" aria-labelledby="showroom-title">
        <ShowroomVisit
          eyebrow={copy.showroom.eyebrow}
          title={copy.showroom.title}
          titleAccent={copy.showroom.titleAccent}
        />
      </section>
      <section className="section veil-text" aria-labelledby="faq-title">
        <HomeFaq eyebrow={copy.faq.eyebrow} title={copy.faq.title} aside={copy.faq.aside} items={home.faqs} />
      </section>

      {/* ===== Dark zone: final CTA (+ footer) ===== */}
      <FinalCta title={copy.finalCta.title} text={copy.finalCta.text} />
    </>
  );
}
