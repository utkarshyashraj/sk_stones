import catalog from '@/content/generated/catalog.json';
import { servicePages } from '@/content/ref/services';
import { productPageSlugs } from './ref-catalog';

export interface RouteInfo {
  path: string;
  priority: number;
  changeFrequency: 'weekly' | 'monthly';
}

/** Every public, indexable route (used by the sitemap and route verification). */
export function indexableRoutes(): RouteInfo[] {
  return [
    { path: '/', priority: 1, changeFrequency: 'weekly' },
    { path: '/products', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/contact', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/projects', priority: 0.8, changeFrequency: 'monthly' },
    ...Object.keys(servicePages).map((s) => ({
      path: `/${s}`,
      priority: 0.8,
      changeFrequency: 'monthly' as const,
    })),
    ...productPageSlugs().map((s) => ({ path: `/${s}`, priority: 0.7, changeFrequency: 'monthly' as const })),
  ];
}

/** Public but intentionally not indexed. */
export const noindexRoutes = ['/thank-you'];

/**
 * 301 redirects for URLs that changed: legacy `.html` URLs to their pretty form, plus renamed/retired
 * pages (e.g. /quartz-surfaces -> /quatrz-surfaces, /case-study-* -> /projects).
 */
export function legacyRedirects(legacyHtmlPages: string[]): { from: string; to: string }[] {
  const retired = new Map(catalog.retiredLegacyPages.map((r) => [r.slug, `/${r.redirectTo}`]));
  const out: { from: string; to: string }[] = [];
  for (const [slug, to] of retired) out.push({ from: `/${slug}`, to });
  for (const page of legacyHtmlPages) {
    const slug = page.replace(/\.html$/, '');
    const target = slug === 'index' ? '/' : (retired.get(slug) ?? `/${slug}`);
    out.push({ from: `/${slug}.html`, to: target });
  }
  return out;
}
