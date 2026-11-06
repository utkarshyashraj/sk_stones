import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import styles from './not-found.module.css';

export const metadata = { title: 'Page not found | S K Stones India', robots: { index: false } };

export default function NotFound() {
  return (
    <section className="section">
      <div className={`container ${styles.wrap}`}>
        <p className="eyebrow">Error 404</p>
        <h1>We couldn&apos;t find that page</h1>
        <p className={styles.lead}>
          The page may have moved. Try searching our stones, or head back to the homepage.
        </p>
        <form action="/search" method="get" role="search" className={styles.search}>
          <label htmlFor="nf-q" className="visually-hidden">
            Search stones
          </label>
          <input id="nf-q" name="q" type="search" placeholder="Search stones…" />
          <button type="submit" className="btn btn--primary">
            <Icon name="search" /> Search
          </button>
        </form>
        <div className={styles.links}>
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
