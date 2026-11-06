import { services } from '@/content/pages';
import { childCategories, topLevelCategories } from './catalog';

export interface NavLink {
  name: string;
  href: string;
}
export interface NavGroup extends NavLink {
  children: NavLink[];
}
export interface NavData {
  services: NavLink[];
  products: NavGroup[];
}

export function getNav(): NavData {
  return {
    services: services.map((s) => ({ name: s.name, href: `/${s.slug}` })),
    products: topLevelCategories().map((c) => ({
      name: c.name,
      href: `/${c.slug}`,
      children: childCategories(c.slug).map((k) => ({ name: k.name, href: `/${k.slug}` })),
    })),
  };
}
