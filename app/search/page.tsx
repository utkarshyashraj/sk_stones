import { ProductGrid } from '@/components/catalog/ProductGrid/ProductGrid';
import { PageHero } from '@/components/marketing/PageHero/PageHero';
import { allProducts } from '@/lib/catalog';
import { buildMetadata } from '@/lib/seo';

// Utility page: results depend on the query string, so it is excluded from the index and sitemap.
export const metadata = buildMetadata({
  title: 'Search Stones | S K Stones India',
  description:
    'Search and filter every granite, marble, natural stone, quartz, cladding, tile and stone art product from S K Stones India.',
  path: '/search',
  noindex: true,
});

export default function SearchPage() {
  return (
    <>
      <PageHero
        crumbs={[
          { name: 'Home', href: '/' },
          { name: 'Products', href: '/products' },
          { name: 'Search', href: '/search' },
        ]}
        eyebrow="Product finder"
        title={
          <>
            Find your <span className="accent">stone</span>
          </>
        }
        lead={
          <p>
            Search {allProducts().length} stones by name, colour, finish or application, then filter by
            category, collection and more.
          </p>
        }
      />
      <section className="section tone-light">
        <div className="container">
          <ProductGrid
            facets={['category', 'collection', 'colour', 'finish', 'application', 'origin']}
            showCollection
            label="Search results"
            eager={0}
          />
        </div>
      </section>
    </>
  );
}
