import type { Metadata } from 'next';
import { RefShell } from '@/components/ref/RefShell';
import { SharedList } from '@/components/ref/features/SharedList';
import '@/styles/ref/product.css';

export const metadata: Metadata = {
  title: { absolute: 'Shared stone list | S K Stones India' },
  description: 'A list of stones shared from S K Stones India.',
  robots: { index: false, follow: true },
};

/** Read-only page for a shared saved list (/saved?ids=…). Not indexed, not in the sitemap. */
export default function SavedPage() {
  return (
    <RefShell
      bundle="product"
      nav="products"
      tab="products"
      footer="bottom-only"
      headerScrolled
      backToTop={false}
    >
      <section className="page-hero product-hero-banner product-hero-panel">
        <div className="product-hero-top">
          <div className="page-hero-content product-hero-panel-inner">
            <p className="page-hero-tagline">
              Shared <span className="highlight">Selection</span>
            </p>
            <h1>
              A Stone <span className="highlight">List</span> For You
            </h1>
            <p className="page-hero-description">
              Someone picked these stones from our collection. Save them to your own list, then ask us for a
              quote in one step.
            </p>
          </div>
        </div>
      </section>
      <section className="product-grid-section" id="product-grid">
        <div className="container">
          <SharedList />
        </div>
      </section>
    </RefShell>
  );
}
