import { getNav } from '@/lib/nav';
import { SiteHeader } from './SiteHeader';

/** Server wrapper: builds navigation from the catalog taxonomy at build time. */
export function Header() {
  return <SiteHeader nav={getNav()} />;
}
