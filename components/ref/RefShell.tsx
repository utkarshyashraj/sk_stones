import type { ReactNode } from 'react';
import { BackToTop } from './BackToTop';
import { Footer, type FooterVariant } from './Footer';
import { Header, type NavKey } from './Header';
import { MobileBottomNav, type TabKey } from './MobileBottomNav';

/**
 * Page frame matching one reference page: the wrapper carries the reference <body> classes and the
 * scoping class of the page's generated stylesheet (styles/ref/<bundle>.css, imported by the page),
 * so header, footer and overlays all render inside it and pick up that page's exact styles.
 */
export function RefShell({
  bundle,
  bodyClass = 'showroom-theme',
  nav,
  tab,
  footer = 'content',
  headerScrolled = false,
  backToTop = true,
  children,
}: {
  bundle: string;
  bodyClass?: string;
  nav: NavKey;
  tab: TabKey;
  footer?: FooterVariant | null;
  headerScrolled?: boolean;
  backToTop?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`ref-${bundle} ${bodyClass}`} data-ref-root="">
      <Header active={nav} startScrolled={headerScrolled} />
      <main id="main">{children}</main>
      {footer ? <Footer variant={footer} /> : null}
      {backToTop ? <BackToTop /> : null}
      <MobileBottomNav active={tab} />
    </div>
  );
}
