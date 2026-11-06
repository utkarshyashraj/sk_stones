import Link from 'next/link';
import { Collections } from '@/components/marketing/Collections/Collections';
import { CTA } from '@/components/marketing/CTA/CTA';
import { PageHero } from '@/components/marketing/PageHero/PageHero';
import { Icon } from '@/components/ui/Icon';
import { allProducts, childCategories, imageOrNull, topLevelCategories } from '@/lib/catalog';
import { buildMetadata } from '@/lib/seo';
import styles from './products.module.css';

export const metadata = buildMetadata({
  title: 'All Products | Granites, Marbles, Natural Stones & More | S K Stones India',
  description:
    'Explore 460+ stones from S K Stones India: marbles, granites, natural stones, quartz and acrylic surfaces, wall claddings, tiles, clay products and stone art.',
  path: '/products',
});

export default function ProductsPage() {
  const categories = topLevelCategories();
  const total = allProducts().length;
  return (
    <>
      <PageHero
        crumbs={[
          { name: 'Home', href: '/' },
          { name: 'Products', href: '/products' },
        ]}
        title={
          <>
            Our <span className="accent">products</span>
          </>
        }
        lead={
          <p>
            We offer a curated range of premium marbles, granites, natural stones, engineered surfaces, stone
            art, and cladding solutions selected for quality, durability, and design versatility.
          </p>
        }
        actions={
          <>
            <Link href="/search" className="btn btn--primary">
              <Icon name="search" /> Search all {total} stones
            </Link>
            <Link href="/contact#quote" className="btn btn--outline">
              Get in touch
            </Link>
          </>
        }
      />
      <section className="section" aria-labelledby="cats-title">
        <div className="container">
          <div className="section-head">
            <h2 id="cats-title">Shop by category</h2>
            <p>
              Nine categories and {categories.reduce((n, c) => n + childCategories(c.slug).length, 0)}{' '}
              collections. Every stone can be viewed up close, shortlisted and enquired about.
            </p>
          </div>
          <Collections
            headingLevel={3}
            items={categories.map((c) => ({
              href: `/${c.slug}`,
              name: c.name,
              description: c.cardDescription,
              count: c.productCount,
              image: imageOrNull(c.cardImage),
            }))}
          />
        </div>
      </section>
      <section className="section section--tint" aria-labelledby="index-title">
        <div className="container">
          <div className="section-head">
            <h2 id="index-title">All collections at a glance</h2>
          </div>
          <div className={styles.index}>
            {categories.map((c) => (
              <div key={c.slug} className={styles.group}>
                <h3>
                  <Link href={`/${c.slug}`}>{c.name}</Link>
                </h3>
                {childCategories(c.slug).length ? (
                  <ul>
                    {childCategories(c.slug).map((k) => (
                      <li key={k.slug}>
                        <Link href={`/${k.slug}`}>
                          {k.name} <span>({k.productCount})</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.single}>
                    {c.productCount ? `${c.productCount} varieties` : 'Supplied to order'}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      <CTA
        heading="Not sure which stone suits your space?"
        text="Tell us about your project and our specialists will shortlist the right materials for you."
      />
    </>
  );
}
