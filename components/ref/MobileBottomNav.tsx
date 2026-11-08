'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { mobileMoreSheet, mobileProductsSheet, servicesMenu, type NavLink } from '@/content/nav';
import { withBase } from '@/lib/base-path';
import { site, telHref, whatsappHref } from '@/lib/site';
import { Fa } from './Fa';
import { lockOverlay } from './overlay-lock';
import { useClientValue } from './useClient';

export type TabKey = 'home' | 'about' | 'products' | 'services' | 'projects' | 'more' | null;
type Sheet = 'products' | 'services' | 'more';

const ICON: Record<Exclude<TabKey, null>, ReactNode> = {
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </>
  ),
  about: (
    <>
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5.5 19.5c1.6-3.2 4-4.75 6.5-4.75s4.9 1.55 6.5 4.75" />
    </>
  ),
  products: (
    <>
      <path d="M6 7h12l1 13H5L6 7z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
      <path d="M9 11v2" />
      <path d="M15 11v2" />
    </>
  ),
  services: (
    <>
      <path d="M14.7 6.3 17.7 9.3" />
      <path d="M5.5 14.5 15 5a3.5 3.5 0 0 1 4 4 3.5 3.5 0 0 1 0 4L9.5 18.5h-4v-4z" />
    </>
  ),
  projects: (
    <>
      <rect x="3.5" y="4.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="4.5" width="7" height="7" rx="1.2" />
      <rect x="3.5" y="12.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="12.5" width="7" height="7" rx="1.2" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1.75" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.75" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.75" fill="currentColor" stroke="none" />
    </>
  ),
};
const svg = (k: Exclude<TabKey, null>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    {ICON[k]}
  </svg>
);

/**
 * Reference mobile navigation (≤1024px): a fixed bottom bar — Home, About Us, Projects navigate;
 * Products, Services and More open bottom sheets. Escape, the overlay or ✕ close a sheet; the page
 * behind does not scroll while one is open. Rendered inside the page wrapper so its styles apply.
 */
export function MobileBottomNav({ active }: { active: TabKey }) {
  const [open, setOpen] = useState<Sheet | null>(null);
  // The homepage's "More" view (?view=more on phones) highlights the More tab, as on the reference.
  const moreView = useClientValue(
    () =>
      new URLSearchParams(window.location.search).get('view') === 'more' &&
      window.matchMedia('(max-width: 1024px)').matches,
    false,
  );
  const tab: TabKey = moreView ? 'more' : active;
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const unlock = lockOverlay();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    const onResize = () => window.innerWidth > 1024 && setOpen(null);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    sheetRef.current?.querySelector<HTMLElement>('.mnav-sheet-close')?.focus();
    return () => {
      unlock();
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  const item = (key: Sheet, label: string) => (
    <button
      type="button"
      className={`mnav-item${tab === key ? ' is-active' : ''}`}
      data-mnav={key}
      aria-haspopup="dialog"
      aria-expanded={open === key}
      onClick={() => setOpen((o) => (o === key ? null : key))}
    >
      {svg(key)}
      <span>{label}</span>
      {key === 'more' ? (
        <span className="sk-tab-badge" data-sk-saved-count="" data-count="0" aria-hidden="true">
          0
        </span>
      ) : null}
    </button>
  );
  const link = (key: 'home' | 'about' | 'projects', label: string, href: string) => (
    <Link href={href} className={`mnav-item${tab === key ? ' is-active' : ''}`} data-mnav={key}>
      {svg(key)}
      <span>{label}</span>
    </Link>
  );
  const links = (list: NavLink[]) =>
    list.map((l) => (
      <Link key={l.href} className="mnav-sheet-link" href={l.href} onClick={() => setOpen(null)}>
        {l.label}
      </Link>
    ));
  const sheet = (key: Sheet, title: string, body: ReactNode) => (
    <div
      ref={open === key ? sheetRef : undefined}
      className={`mnav-sheet${open === key ? ' is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      hidden={open !== key}
    >
      <div className="mnav-sheet-handle" aria-hidden="true" />
      <div className="mnav-sheet-header">
        <h2>{title}</h2>
        <button type="button" className="mnav-sheet-close" aria-label="Close" onClick={() => setOpen(null)}>
          &times;
        </button>
      </div>
      <div className="mnav-sheet-body">{body}</div>
    </div>
  );

  return (
    <>
      <nav className="mobile-bottom-nav" id="mobileBottomNav" aria-label="Primary mobile navigation">
        {link('home', 'Home', '/')}
        {link('about', 'About Us', '/about')}
        {item('products', 'Products')}
        {item('services', 'Services')}
        {link('projects', 'Projects', '/projects')}
        {item('more', 'More')}
      </nav>
      <div className="mnav-sheet-root" id="mnavSheetRoot">
        <div
          className={`mnav-sheet-overlay${open ? ' is-open' : ''}`}
          hidden={!open}
          onClick={() => setOpen(null)}
        />
        {sheet('products', 'Products', links(mobileProductsSheet))}
        {sheet('services', 'Services', links(servicesMenu))}
        {sheet(
          'more',
          'More',
          <>
            <button
              type="button"
              className="mnav-sheet-link sk-sheet-saved"
              data-sk-open="saved"
              data-sk-click=""
              onClick={() => setOpen(null)}
            >
              Saved stones (
              <span data-sk-saved-count="" data-count="0">
                0
              </span>
              )
            </button>
            <div className="mnav-sheet-section">
              <p className="mnav-sheet-section-title">From the homepage</p>
              {/* Full page loads (as on the reference): the homepage reads ?view=more on load. */}
              {mobileMoreSheet.map((l) => (
                <a key={l.href} className="mnav-sheet-link" href={withBase(l.href)}>
                  {l.label}
                </a>
              ))}
            </div>
            <div className="mnav-sheet-section">
              <p className="mnav-sheet-section-title">Connect</p>
              <div className="mnav-social">
                <a href={site.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <Fa name="linkedin-in" />
                </a>
                <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                  <Fa name="whatsapp" />
                </a>
                <a href={`mailto:${site.email}`} aria-label="Email">
                  <Fa name="envelope" />
                </a>
                <a href={telHref} aria-label="Call">
                  <Fa name="phone" />
                </a>
              </div>
            </div>
          </>,
        )}
      </div>
    </>
  );
}
