import Link from 'next/link';
import { BrandLockup } from '@/components/layout/Header/BrandLockup';
import { site, telHref } from '@/lib/site';
import styles from './Footer.module.css';

/**
 * Compact footer. Product and service menus live in the header; quote/WhatsApp CTAs appear in each
 * page's closing section — so the footer carries only identity, essential contact facts and key links.
 */
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.top}`}>
        <BrandLockup variant="footer" />
        <nav aria-label="Footer" className={styles.nav}>
          <Link href="/products">Products</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>
      <div className={`container ${styles.bottom}`}>
        <address className={styles.contact}>
          <a href={site.maps.place} target="_blank" rel="noopener noreferrer">
            {site.address.locality}, {site.address.city} {site.address.postalCode}
          </a>
          <a href={telHref}>{site.phone.display}</a>
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <span>{site.hours.label}</span>
        </address>
        <p className={styles.copy}>
          © {year} {site.legalName}
        </p>
      </div>
    </footer>
  );
}
