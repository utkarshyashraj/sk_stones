import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';

export const metadata = { title: 'Page not found | S K Stones India', robots: { index: false } };

export default function NotFound() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: '44rem', textAlign: 'center' }}>
        <p className="eyebrow">Error 404</p>
        <h1>We couldn&apos;t find that page</h1>
        <p style={{ marginTop: 'var(--sp-4)', color: 'var(--c-text-muted)' }}>
          The page may have moved. Try searching our stones, or head back to the homepage.
        </p>
        <form
          action="/search"
          method="get"
          role="search"
          style={{ display: 'flex', gap: 'var(--sp-2)', margin: 'var(--sp-8) auto 0', maxWidth: '30rem' }}
        >
          <label htmlFor="nf-q" className="visually-hidden">
            Search stones
          </label>
          <input
            id="nf-q"
            name="q"
            type="search"
            placeholder="Search stones…"
            style={{
              flex: 1,
              minHeight: 48,
              padding: '0 1rem',
              border: '1.5px solid var(--c-border)',
              borderRadius: 'var(--radius-pill)',
            }}
          />
          <button type="submit" className="btn btn--primary">
            <Icon name="search" /> Search
          </button>
        </form>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--sp-3)',
            justifyContent: 'center',
            marginTop: 'var(--sp-6)',
          }}
        >
          <Link href="/" className="btn btn--outline">
            Home
          </Link>
          <Link href="/products" className="btn btn--outline">
            All products
          </Link>
          <Link href="/contact" className="btn btn--outline">
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
}
