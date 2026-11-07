'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { productsMenu, servicesMenu } from '@/content/nav';
import { withBase } from '@/lib/base-path';
import { site, telHref } from '@/lib/site';
import { Fa } from './Fa';

export type NavKey = 'home' | 'about' | 'services' | 'products' | 'projects' | 'contact' | null;

/**
 * Reference header: brand lockup, desktop nav with the Services dropdown and the Products mega-menu
 * (hover flyouts on desktop, tap-to-open groups at ≤1024px), "Call Us Now" and the mobile "Contact Us" pill.
 * Product pages start in the compact `scrolled` state, as on the reference.
 */
export function Header({ active, startScrolled = false }: { active: NavKey; startScrolled?: boolean }) {
  const [scrolled, setScrolled] = useState(startScrolled);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (startScrolled) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [startScrolled]);

  // Close an open product group when tapping elsewhere (mobile behaviour of the reference mega-menu).
  useEffect(() => {
    if (!openGroup) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpenGroup(null);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [openGroup]);

  const cls = (key: NavKey) => (active === key ? 'active' : undefined);

  return (
    <header ref={ref} className={`header${scrolled ? ' scrolled' : ''}`} id="header">
      <Link aria-label={site.name} className="brand-lockup" href="/">
        {/* eslint-disable-next-line @next/next/no-img-element -- 40×80 logo; a plain img keeps the reference's exact box */}
        <img
          className="brand-mark"
          src={withBase('/images/site/ref-shree-logo-80.webp')}
          alt=""
          width={40}
          height={80}
          decoding="async"
        />
        <span className="brand-text">
          <span className="brand-name">
            S K <span className="brand-stones">Stones</span> India
          </span>
          <span className="brand-formerly">(formerly Shree Stones &amp; Services)</span>
        </span>
      </Link>
      <nav className="desktop-nav">
        <Link className={cls('home')} href="/">
          Home
        </Link>
        <Link className={cls('about')} href="/about">
          About Us
        </Link>
        <div className="nav-dropdown">
          <span className={`nav-link${active === 'services' ? ' active' : ''}`}>
            Services <Fa name="chevron-down" />
          </span>
          <div className="dropdown-menu">
            {servicesMenu.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="nav-dropdown mega-dropdown">
          <span className={`nav-link${active === 'products' ? ' active' : ''}`}>
            Products <Fa name="chevron-down" />
          </span>
          <div className="dropdown-menu mega-menu">
            {productsMenu.map((g) =>
              g.items ? (
                <div key={g.label} className={`mega-item has-sub${openGroup === g.label ? ' open' : ''}`}>
                  {/* An <a> as on the reference (its CSS targets it), but a real button: no fake "#" link. */}
                  <a
                    className="mega-parent"
                    role="button"
                    tabIndex={0}
                    aria-haspopup="true"
                    aria-expanded={openGroup === g.label}
                    onClick={() => {
                      // Parents only open their flyout; on touch widths a tap toggles it.
                      if (window.innerWidth <= 1024) setOpenGroup((o) => (o === g.label ? null : g.label));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setOpenGroup((o) => (o === g.label ? null : g.label));
                      }
                    }}
                  >
                    {g.label} <Fa name="chevron-right" className="sub-arrow" />
                  </a>
                  <div className="mega-submenu">
                    {g.items.map((l) => (
                      <Link key={l.href} href={l.href}>
                        {l.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div key={g.label} className="mega-item">
                  <Link href={g.href!}>{g.label}</Link>
                </div>
              ),
            )}
          </div>
        </div>
        <Link className={cls('projects')} href="/projects">
          Our Projects
        </Link>
        <Link className={cls('contact')} href="/contact">
          Contact Us
        </Link>
      </nav>
      <a href={telHref} className="header-cta">
        <Fa name="phone" /> Call Us Now
      </a>
      <Link className="header-contact-mobile" href="/contact">
        Contact Us
      </Link>
    </header>
  );
}
