'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Icon } from '@/components/ui/Icon';
import { setShortlistOpen, useShortlist } from '@/components/shortlist/shortlist-store';
import { openSearch } from '@/components/catalog/ProductSearch/search-store';
import type { NavData } from '@/lib/nav';
import { site, telHref, whatsappHref } from '@/lib/site';
import dynamic from 'next/dynamic';
import { BottomNav } from '../MobileNavigation/MobileNavigation';
import { BrandLockup } from './BrandLockup';
import styles from './Header.module.css';

type MenuId = 'services' | 'products' | null;

const subscribeScroll = (cb: () => void) => {
  window.addEventListener('scroll', cb, { passive: true });
  return () => window.removeEventListener('scroll', cb);
};
/** true once the page has scrolled a little (server: false, so the homepage header starts transparent). */
const useScrolled = () =>
  useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > 24,
    () => false,
  );

// The drawer (full nav tree) is code-split and mounted on first open.
const MobileNavigation = dynamic(
  () => import('../MobileNavigation/MobileNavigation').then((m) => m.MobileNavigation),
  {
    ssr: false,
  },
);

export function SiteHeader({ nav }: { nav: NavData }) {
  const pathname = usePathname() || '/';
  // Homepage keeps contact actions to a minimum: header Contact Us, floating WhatsApp, final CTA, footer.
  const isHome = pathname === '/';
  const scrolled = useScrolled();
  const [open, setOpen] = useState<MenuId>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSeen, setMobileSeen] = useState(false);
  if (mobileOpen && !mobileSeen) setMobileSeen(true);
  const navRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const hoverOpenedAt = useRef(0);
  // A click that lands right after a hover-open must not immediately close the menu again.
  const toggleMenu = (id: Exclude<MenuId, null>) => {
    if (open === id && Date.now() - hoverOpenedAt.current < 700) return;
    setOpen(open === id ? null : id);
  };
  const { count } = useShortlist();

  const serviceHrefs = nav.services.map((s) => s.href);
  const productHrefs = [
    '/products',
    '/search',
    ...nav.products.flatMap((g) => [g.href, ...g.children.map((c) => c.href)]),
  ];
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
  const servicesActive = serviceHrefs.some(isActive);
  const productsActive = productHrefs.some(isActive);
  const projectsActive = isActive('/projects') || pathname.startsWith('/case-study-');

  const close = useCallback((returnFocus?: MenuId) => {
    setOpen(null);
    if (returnFocus) document.getElementById(`nav-btn-${returnFocus}`)?.focus();
  }, []);

  // Close menus when the route changes (state adjusted during render — no effect needed).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(null);
    setMobileOpen(false);
  }

  // Close on outside click and Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(open);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  // Hover intent for mouse users only (touch and keyboard use the buttons).
  const hoverProps = (id: Exclude<MenuId, null>) => ({
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      window.clearTimeout(closeTimer.current);
      if (open !== id) hoverOpenedAt.current = Date.now();
      setOpen(id);
    },
    onPointerLeave: (e: React.PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      closeTimer.current = window.setTimeout(() => setOpen((cur) => (cur === id ? null : cur)), 180);
    },
  });

  const onPanelBlur = (id: Exclude<MenuId, null>) => (e: React.FocusEvent<HTMLLIElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen((cur) => (cur === id ? null : cur));
  };

  return (
    <>
      <header className={`${styles.header} ${!scrolled && !open ? styles.transparent : ''} on-dark`}>
        <div className={`container ${styles.bar}`}>
          <BrandLockup />

          <nav ref={navRef} className={styles.desktopNav} aria-label="Main">
            <ul className={styles.navList}>
              <li>
                <Link href="/" className={styles.navLink} aria-current={isActive('/') ? 'page' : undefined}>
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className={styles.navLink}
                  aria-current={isActive('/about') ? 'page' : undefined}
                >
                  About Us
                </Link>
              </li>
              <li className={styles.hasMenu} {...hoverProps('services')} onBlur={onPanelBlur('services')}>
                <button
                  id="nav-btn-services"
                  type="button"
                  className={`${styles.navLink} ${servicesActive ? styles.activeParent : ''}`}
                  aria-expanded={open === 'services'}
                  aria-controls="nav-panel-services"
                  onClick={() => toggleMenu('services')}
                >
                  Services <Icon name="chevron-down" size={16} className={styles.chev} />
                </button>
                <div id="nav-panel-services" className={styles.dropdown} hidden={open !== 'services'}>
                  <ul className={styles.dropdownList}>
                    {nav.services.map((s) => (
                      <li key={s.href}>
                        <Link
                          href={s.href}
                          className={styles.dropdownLink}
                          aria-current={isActive(s.href) ? 'page' : undefined}
                        >
                          {s.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
              <li className={styles.hasMenu} {...hoverProps('products')} onBlur={onPanelBlur('products')}>
                <button
                  id="nav-btn-products"
                  type="button"
                  className={`${styles.navLink} ${productsActive ? styles.activeParent : ''}`}
                  aria-expanded={open === 'products'}
                  aria-controls="nav-panel-products"
                  onClick={() => toggleMenu('products')}
                >
                  Products <Icon name="chevron-down" size={16} className={styles.chev} />
                </button>
                <div id="nav-panel-products" className={styles.mega} hidden={open !== 'products'}>
                  <div className={styles.megaHead}>
                    <p className={styles.megaTitle}>Explore our stone collections</p>
                    <Link href="/products" className="link-arrow">
                      View all products <Icon name="arrow-right" />
                    </Link>
                  </div>
                  <ul className={styles.megaGrid}>
                    {nav.products.map((g) => (
                      <li key={g.href} className={styles.megaGroup}>
                        <Link
                          href={g.href}
                          className={styles.megaParent}
                          aria-current={isActive(g.href) ? 'page' : undefined}
                        >
                          {g.name}
                        </Link>
                        {g.children.length ? (
                          <ul>
                            {g.children.map((c) => (
                              <li key={c.href}>
                                <Link
                                  href={c.href}
                                  className={styles.megaChild}
                                  aria-current={isActive(c.href) ? 'page' : undefined}
                                >
                                  {c.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
              <li>
                <Link
                  href="/projects"
                  className={styles.navLink}
                  aria-current={projectsActive ? 'page' : undefined}
                >
                  Our Projects
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className={styles.navLink}
                  aria-current={isActive('/contact') ? 'page' : undefined}
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </nav>

          <div className={styles.actions}>
            <button type="button" className={styles.iconBtn} onClick={openSearch} aria-label="Search stones">
              <Icon name="search" />
            </button>
            <button
              type="button"
              className={`${styles.iconBtn} ${styles.shortlistBtn}`}
              onClick={() => setShortlistOpen(true)}
              aria-label={`Shortlist, ${count} ${count === 1 ? 'stone' : 'stones'}`}
            >
              <Icon name="bookmark" />
              {count > 0 ? (
                <span className={styles.badge} aria-hidden="true">
                  {count}
                </span>
              ) : null}
            </button>
            {isHome ? null : (
              <>
                <a
                  className={`${styles.iconBtn} ${styles.whatsapp}`}
                  href={whatsappHref('Hi S K Stones India, I have an enquiry.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat on WhatsApp (opens in a new tab)"
                >
                  <Icon name="whatsapp" />
                </a>
                <a className={`btn btn--outline btn--sm ${styles.phone}`} href={telHref}>
                  <Icon name="phone" /> {site.phone.display}
                </a>
              </>
            )}
            <button
              type="button"
              className={`${styles.iconBtn} ${styles.menuBtn}`}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Icon name="menu" size={24} />
            </button>
          </div>
        </div>
      </header>
      {mobileSeen ? (
        <MobileNavigation
          nav={nav}
          isActive={isActive}
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          showWhatsapp={!isHome}
        />
      ) : null}
      <BottomNav isActive={isActive} productsActive={productsActive} />
    </>
  );
}
