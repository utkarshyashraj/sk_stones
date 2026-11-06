'use client';

import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { useModalDialog } from '@/components/ui/useModalDialog';
import { setShortlistOpen, useShortlist } from '@/components/shortlist/shortlist-store';
import { openSearch } from '@/components/catalog/ProductSearch/search-store';
import type { NavData } from '@/lib/nav';
import { site, telHref, whatsappHref } from '@/lib/site';
import styles from './MobileNavigation.module.css';

interface Props {
  nav: NavData;
  isActive: (href: string) => boolean;
  open: boolean;
  onClose: () => void;
}

export function MobileNavigation({ nav, isActive, open, onClose }: Props) {
  const ref = useModalDialog(open, onClose);
  const current = (href: string) => (isActive(href) ? ('page' as const) : undefined);

  return (
    <dialog ref={ref} id="mobile-menu" className={`${styles.drawer} on-dark`} aria-label="Site menu">
      <div className={styles.head}>
        <span className={styles.title}>Menu</span>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close menu">
          <Icon name="close" size={24} />
        </button>
      </div>

      <form action="/search" method="get" role="search" className={styles.search} onSubmit={onClose}>
        <label htmlFor="mobile-search" className="visually-hidden">
          Search stones
        </label>
        <Icon name="search" />
        <input
          id="mobile-search"
          name="q"
          type="search"
          placeholder="Search 460+ stones…"
          autoComplete="off"
        />
      </form>

      <nav aria-label="Mobile" className={styles.nav}>
        <ul className={styles.list}>
          <li>
            <Link href="/" className={styles.link} aria-current={current('/')}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/about" className={styles.link} aria-current={current('/about')}>
              About Us
            </Link>
          </li>
          <li>
            <details className={styles.group} open={nav.services.some((s) => isActive(s.href))}>
              <summary className={styles.link}>
                Services <Icon name="chevron-down" className={styles.chev} />
              </summary>
              <ul className={styles.sub}>
                {nav.services.map((s) => (
                  <li key={s.href}>
                    <Link href={s.href} className={styles.subLink} aria-current={current(s.href)}>
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          </li>
          <li>
            <details className={styles.group}>
              <summary className={styles.link}>
                Products <Icon name="chevron-down" className={styles.chev} />
              </summary>
              <ul className={styles.sub}>
                <li>
                  <Link href="/products" className={styles.subLink} aria-current={current('/products')}>
                    All products
                  </Link>
                </li>
                {nav.products.map((g) => (
                  <li key={g.href}>
                    <Link
                      href={g.href}
                      className={`${styles.subLink} ${styles.subParent}`}
                      aria-current={current(g.href)}
                    >
                      {g.name}
                    </Link>
                    {g.children.length ? (
                      <ul className={styles.subSub}>
                        {g.children.map((c) => (
                          <li key={c.href}>
                            <Link href={c.href} className={styles.subLink} aria-current={current(c.href)}>
                              {c.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            </details>
          </li>
          <li>
            <Link href="/projects" className={styles.link} aria-current={current('/projects')}>
              Our Projects
            </Link>
          </li>
          <li>
            <Link href="/contact" className={styles.link} aria-current={current('/contact')}>
              Contact Us
            </Link>
          </li>
        </ul>
      </nav>

      <div className={styles.ctas}>
        <a className="btn btn--primary btn--block" href={telHref}>
          <Icon name="phone" /> Call {site.phone.display}
        </a>
        <a
          className="btn btn--whatsapp btn--block"
          href={whatsappHref('Hi S K Stones India, I have an enquiry.')}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="whatsapp" /> WhatsApp us
        </a>
      </div>
    </dialog>
  );
}

export function BottomNav({
  isActive,
  productsActive,
}: {
  isActive: (href: string) => boolean;
  productsActive: boolean;
}) {
  const { count } = useShortlist();
  return (
    <nav className={styles.bottom} aria-label="Quick actions">
      <Link href="/" className={styles.bItem} aria-current={isActive('/') ? 'page' : undefined}>
        <Icon name="home" />
        <span>Home</span>
      </Link>
      <Link href="/products" className={styles.bItem} aria-current={productsActive ? 'page' : undefined}>
        <Icon name="grid" />
        <span>Products</span>
      </Link>
      <button type="button" className={styles.bItem} onClick={openSearch}>
        <Icon name="search" />
        <span>Search</span>
      </button>
      <button
        type="button"
        className={styles.bItem}
        onClick={() => setShortlistOpen(true)}
        aria-label={`Shortlist, ${count} ${count === 1 ? 'stone' : 'stones'}`}
      >
        <span className={styles.bIconWrap}>
          <Icon name="bookmark" />
          {count > 0 ? (
            <span className={styles.bBadge} aria-hidden="true">
              {count}
            </span>
          ) : null}
        </span>
        <span aria-hidden="true">Shortlist</span>
      </button>
      <a href={telHref} className={`${styles.bItem} ${styles.bCall}`}>
        <Icon name="phone" />
        <span>Call</span>
      </a>
    </nav>
  );
}
