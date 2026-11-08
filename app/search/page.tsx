import type { Metadata } from 'next';
import { RefShell } from '@/components/ref/RefShell';
import { SearchResults } from '@/components/ref/features/SearchResults';
import '@/styles/ref/product.css';

export const metadata: Metadata = {
  title: { absolute: 'Search stones | S K Stones India' },
  description: 'Search S K Stones India’s granites, marbles, natural stones, tiles and more.',
  robots: { index: false, follow: true },
};

/** Full search results (noindex, not in the sitemap). Results are computed in the browser from the index. */
export default function SearchPage() {
  return (
    <RefShell
      bundle="product"
      nav="products"
      tab="products"
      footer="bottom-only"
      headerScrolled
      backToTop={false}
    >
      <section className="page-hero product-hero-banner product-hero-panel sk-search-hero">
        <div className="product-hero-top">
          <div className="page-hero-content product-hero-panel-inner">
            <p className="page-hero-tagline">
              Find Your <span className="highlight">Stone</span>
            </p>
            <h1>
              Search <span className="highlight">Results</span>
            </h1>
          </div>
        </div>
      </section>
      <section className="product-grid-section" id="product-grid">
        <div className="container">
          <SearchResults />
        </div>
      </section>
    </RefShell>
  );
}
