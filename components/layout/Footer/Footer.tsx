import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { BrandLockup } from '@/components/layout/Header/BrandLockup';
import { getNav } from '@/lib/nav';
import { fullAddress, site, telHref, whatsappHref } from '@/lib/site';
import styles from './Footer.module.css';

export function Footer() {
  const nav = getNav();
  const year = new Date().getFullYear();
  return (
    <footer className={`${styles.footer} on-dark`}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.about}>
          <BrandLockup variant="footer" />
          <p className={styles.blurb}>
            Premium granites, marbles and natural stones in Bengaluru since {site.foundedYear}. Supply,
            fabrication and installation for homes, hotels and commercial projects.
          </p>
          <div className={styles.social}>
            <a
              href={whatsappHref('Hi S K Stones India, I have an enquiry.')}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp (opens in a new tab)"
            >
              <Icon name="whatsapp" />
            </a>
            <a
              href={site.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Founder on LinkedIn (opens in a new tab)"
            >
              <Icon name="linkedin" />
            </a>
            <a href={`mailto:${site.email}`} aria-label={`Email ${site.email}`}>
              <Icon name="mail" />
            </a>
          </div>
        </div>

        <nav aria-label="Products" className={styles.col}>
          <h2 className={styles.heading}>Products</h2>
          <ul>
            {nav.products.map((p) => (
              <li key={p.href}>
                <Link href={p.href}>{p.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Services and company" className={styles.col}>
          <h2 className={styles.heading}>Services</h2>
          <ul>
            {nav.services.map((s) => (
              <li key={s.href}>
                <Link href={s.href}>{s.name}</Link>
              </li>
            ))}
          </ul>
          <h2 className={`${styles.heading} ${styles.spaced}`}>Company</h2>
          <ul>
            <li>
              <Link href="/about">About Us</Link>
            </li>
            <li>
              <Link href="/projects">Our Projects</Link>
            </li>
            <li>
              <Link href="/products">All Products</Link>
            </li>
            <li>
              <Link href="/contact">Contact Us</Link>
            </li>
          </ul>
        </nav>

        <div className={styles.col}>
          <h2 className={styles.heading}>Visit or call</h2>
          <address className={styles.contact}>
            <p>
              <Icon name="pin" />
              <span>
                {fullAddress}
                <br />
                <a
                  href={site.maps.place}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mapLink}
                >
                  Open in Google Maps <Icon name="external" size={14} />
                </a>
              </span>
            </p>
            <p>
              <Icon name="phone" />
              <a href={telHref}>{site.phone.display}</a>
            </p>
            <p>
              <Icon name="whatsapp" />
              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer">
                WhatsApp {site.phone.display}
              </a>
            </p>
            <p>
              <Icon name="mail" />
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </p>
            <p>
              <Icon name="clock" />
              <span>{site.hours.label}</span>
            </p>
          </address>
        </div>
      </div>
      <div className={styles.bottom}>
        <div className={`container ${styles.bottomInner}`}>
          <p>
            © {year} {site.legalName}. All rights reserved.
          </p>
          <p>
            <Link href="/contact#quote">Request a quote</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
