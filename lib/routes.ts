import { caseStudies, services } from '@/content/pages';
import { allCategories, retiredLegacyPages } from './catalog';

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
    ...services.map((s) => ({ path: `/${s.slug}`, priority: 0.8, changeFrequency: 'monthly' as const })),
    ...caseStudies.map((c) => ({ path: `/${c.slug}`, priority: 0.6, changeFrequency: 'monthly' as const })),
    ...allCategories().map((c) => ({
      path: `/${c.slug}`,
      priority: c.parent ? 0.7 : 0.8,
      changeFrequency: 'monthly' as const,
    })),
  ];
}

/** Public but intentionally not indexed. */
export const noindexRoutes = ['/search', '/thank-you'];

/**
 * 301 redirects for URLs that changed. Legacy `.html` URLs are redirected to their pretty form,
 * plus renamed/retired pages (e.g. /quatrz-surfaces -> /quartz-surfaces).
 */
export function legacyRedirects(legacyHtmlPages: string[]): { from: string; to: string }[] {
  const retired = new Map(retiredLegacyPages().map((r) => [r.slug, `/${r.redirectTo}`]));
  const out: { from: string; to: string }[] = [];
  for (const [slug, to] of retired) out.push({ from: `/${slug}`, to });
  for (const page of legacyHtmlPages) {
    const slug = page.replace(/\.html$/, '');
    const target = slug === 'index' ? '/' : (retired.get(slug) ?? `/${slug}`);
    out.push({ from: `/${slug}.html`, to: target });
  }
  return out;
}
