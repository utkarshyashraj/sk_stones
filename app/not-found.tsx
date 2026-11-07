import Link from 'next/link';
import { RefShell } from '@/components/ref/RefShell';
import '@/styles/ref/product.css';

export const metadata = { title: 'Page not found | S K Stones India', robots: { index: false } };

/** 404 in the reference look (the reference itself has no custom 404): its hero panel with two ways back. */
export default function NotFound() {
  return (
    <RefShell bundle="product" nav={null} tab={null} footer="bottom-only" headerScrolled backToTop={false}>
      <section className="page-hero product-hero-banner product-hero-panel">
        <div className="product-hero-top">
          <div className="page-hero-content product-hero-panel-inner">
            <p className="page-hero-tagline">
              Error <span className="highlight">404</span>
            </p>
            <h1>
              Page <span className="highlight">Not Found</span>
            </h1>
            <p className="page-hero-description">
              The page you were looking for has moved or no longer exists. Browse our collections or head back
              home.
            </p>
            <div className="page-hero-actions">
              <Link href="/products" className="btn btn-primary">
                Explore Our Collection
              </Link>
              <Link className="btn btn-outline-light" href="/">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </RefShell>
  );
}
