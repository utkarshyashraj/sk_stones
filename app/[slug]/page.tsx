import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/catalog/ProductGrid/ProductGrid';
import { Collections } from '@/components/marketing/Collections/Collections';
import { CTA } from '@/components/marketing/CTA/CTA';
import { PageHero } from '@/components/marketing/PageHero/PageHero';
import { Icon } from '@/components/ui/Icon';
import { Picture } from '@/components/ui/Picture';
import {
  allCategories,
  categoryCrumbs,
  categoryNames,
  categoryOrder,
  childCategories,
  getCategory,
  imageOrNull,
  productsIn,
  toClientProduct,
} from '@/lib/catalog';
import type { FacetKey } from '@/lib/search';
import { buildMetadata, itemListLd, jsonLdScript } from '@/lib/seo';
import { whatsappHref } from '@/lib/site';
import type { Category } from '@/lib/types';
import styles from './category.module.css';

export const dynamicParams = false;

export function generateStaticParams() {
  return allCategories().map((c) => ({ slug: c.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const c = getCategory(slug);
  if (!c) return {};
  return buildMetadata({
    title: c.title,
    description: c.description,
    path: `/${c.slug}`,
    image: imageOrNull(c.cardImage),
  });
}

const collectionCards = (cats: Category[]) =>
  cats.map((k) => ({
    href: `/${k.slug}`,
    name: k.name,
    description: k.cardDescription,
    count: k.productCount,
    image: imageOrNull(k.cardImage),
  }));

export default async function CategoryPage({ params }: Params) {
  const { slug } = await params;
  const c = getCategory(slug);
  if (!c) notFound();

  const products = productsIn(c.slug).map(toClientProduct);
  const children = childCategories(c.slug);
  const parent = c.parent ? getCategory(c.parent) : undefined;
  const siblings = parent ? childCategories(parent.slug).filter((s) => s.slug !== c.slug) : [];
  const heroImage = imageOrNull(c.cardImage);
  const overviewImage = imageOrNull(c.overview?.image ?? null);
  const isHub = c.kind === 'hub';
  const facets: FacetKey[] = isHub
    ? ['collection', 'colour', 'finish', 'application', 'origin']
    : ['colour', 'finish', 'origin'];
  const names = categoryNames();

  return (
    <>
      <PageHero
        crumbs={categoryCrumbs(c.slug)}
        title={c.hero.heading}
        lead={<p>{c.hero.description}</p>}
        aside={heroImage ? { image: heroImage, alt: `${c.name} — S K Stones India` } : null}
        actions={
          <>
            {products.length ? (
              <a href="#products" className="btn btn--primary">
                Explore {products.length} {products.length === 1 ? 'variety' : 'varieties'}{' '}
              </a>
            ) : null}
            <Link
              href={`/contact?${new URLSearchParams({ name: c.name }).toString()}#quote`}
              className={products.length ? 'btn btn--outline' : 'btn btn--primary'}
            >
              Get a quote
            </Link>
          </>
        }
      >
        {c.applications.length ? (
          <ul className={styles.apps} aria-label="Suitable for">
            {c.applications.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        ) : null}
      </PageHero>

      {children.length ? (
        <section className="section section--tint" aria-labelledby="sub-title">
          <div className="container">
            <div className="section-head">
              <h2 id="sub-title">Browse by collection</h2>
            </div>
            <Collections items={collectionCards(children)} compact={children.length > 3} />
          </div>
        </section>
      ) : null}

      {c.overview && (c.overview.paragraphs.length || c.overview.bullets.length) ? (
        <section className="section section--tint" aria-labelledby="overview-title">
          <div className={`container ${styles.overview}`}>
            {overviewImage ? (
              <div className={styles.overviewMedia}>
                <Picture
                  image={overviewImage}
                  alt={`${c.name} overview`}
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  imgClassName={styles.overviewImg}
                />
              </div>
            ) : null}
            <div>
              <h2 id="overview-title">How we select {c.name.toLowerCase()}</h2>
              <div className={`prose ${styles.overviewText}`}>
                {c.overview.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              {c.overview.bullets.length ? (
                <ul className={`dash-list ${styles.bullets}`}>
                  {c.overview.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {products.length ? (
        <section id="products" className="section veil-mid" aria-labelledby="grid-title">
          <div className="container">
            <div className="section-head">
              <h2 id="grid-title">
                {isHub ? `All ${c.name.toLowerCase()}` : `Our ${c.name} collection`}{' '}
                <span className={styles.count}>({products.length})</span>
              </h2>
              <p>Tap any stone for a closer look, save favourites to your shortlist, or enquire directly.</p>
            </div>
            <ProductGrid
              products={products}
              names={names}
              order={categoryOrder()}
              facets={facets}
              showCollection={isHub}
              label={`${c.name} stones`}
            />
          </div>
        </section>
      ) : c.kind === 'enquiry' ? (
        <section className="section veil-text" aria-labelledby="enquire-title">
          <div className={`container ${styles.enquiry}`}>
            <h2 id="enquire-title">Tell us what you need</h2>
            <p>
              Our {c.name.toLowerCase()} range is supplied to order. Share the block size, quantity and site
              location and our team will recommend the right specification and send a quote.
            </p>
            <div className={styles.enquiryActions}>
              <Link
                href={`/contact?${new URLSearchParams({ name: c.name }).toString()}#quote`}
                className="btn btn--primary"
              >
                Request a quote
              </Link>
              <a
                className="btn btn--whatsapp"
                href={whatsappHref(`Hi S K Stones India, I'd like details on ${c.name}.`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="whatsapp" /> Ask on WhatsApp
              </a>
            </div>
          </div>
        </section>
      ) : null}

      {siblings.length ? (
        <section className="section" aria-labelledby="related-title">
          <div className="container">
            <div className="section-head">
              <h2 id="related-title">Related collections</h2>
            </div>
            <Collections items={collectionCards(siblings)} compact />
          </div>
        </section>
      ) : null}

      <CTA
        heading="Need help choosing the right stone?"
        text="Our experts can guide you to the perfect material for your project — visit our Koramangala showroom or talk to us today."
        primary={{
          label: 'Get expert advice',
          href: `/contact?${new URLSearchParams({ name: c.name }).toString()}#quote`,
        }}
        whatsappMessage={`Hi S K Stones India, I need help choosing ${c.name.toLowerCase()}.`}
      />
      {products.length ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(
            itemListLd(
              c.name,
              `/${c.slug}`,
              products.map((p) => ({ name: p.name, image: p.img })),
            ),
          )}
        />
      ) : null}
    </>
  );
}
