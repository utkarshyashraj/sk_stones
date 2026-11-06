import { describe, expect, it } from 'vitest';
import legacy from '@/content/legacy-urls.json';
import { caseStudies, services } from '@/content/pages';
import { allCategories } from '@/lib/catalog';
import { indexableRoutes, legacyRedirects } from '@/lib/routes';
import { breadcrumbLd, buildMetadata, jsonLdScript, localBusinessLd } from '@/lib/seo';

describe('page metadata', () => {
  const pages = [
    ...allCategories().map((c) => ({ title: c.title, description: c.description })),
    ...services.map((s) => ({ title: s.title, description: s.description })),
    ...caseStudies.map((c) => ({ title: c.title, description: c.description })),
  ];

  it('every catalog, service and case-study page has a unique title and description', () => {
    expect(new Set(pages.map((p) => p.title)).size).toBe(pages.length);
    expect(new Set(pages.map((p) => p.description)).size).toBe(pages.length);
  });

  it('descriptions are a useful length and never the old template text', () => {
    for (const p of pages) {
      expect(p.description.length, p.title).toBeGreaterThanOrEqual(90);
      expect(p.description.length, p.title).toBeLessThanOrEqual(175);
      expect(p.description).not.toMatch(/Explore our .* collection at S K Stones India/);
    }
  });

  it('builds canonical, Open Graph and robots metadata', () => {
    const m = buildMetadata({ title: 'T', description: 'D', path: '/marbles' });
    expect(m.alternates?.canonical).toBe('/marbles');
    expect(m.openGraph?.url).toBe('/marbles');
    expect(m.robots).toEqual({ index: true, follow: true });
    expect(buildMetadata({ title: 'T', description: 'D', path: '/x', noindex: true }).robots).toEqual({
      index: false,
      follow: true,
    });
  });
});

describe('sitemap routes', () => {
  const routes = indexableRoutes().map((r) => r.path);
  it('includes every public page exactly once, with pretty URLs and no duplicate homepage', () => {
    expect(new Set(routes).size).toBe(routes.length);
    expect(routes).toContain('/');
    expect(routes.some((r) => r.endsWith('.html') || r === '/index')).toBe(false);
    expect(routes).not.toContain('/search');
    expect(routes).not.toContain('/thank-you');
    expect(routes.length).toBe(5 + services.length + caseStudies.length + allCategories().length);
  });
});

describe('legacy redirects', () => {
  const rules = legacyRedirects(legacy.pages);
  const map = new Map(rules.map((r) => [r.from, r.to]));
  it('redirects every legacy .html URL', () => {
    for (const page of legacy.pages) expect(map.has(`/${page}`)).toBe(true);
    expect(map.get('/index.html')).toBe('/');
    expect(map.get('/kota-stones.html')).toBe('/kota-stones');
  });
  it('redirects the misspelt quartz URL and retired empty pages', () => {
    expect(map.get('/quatrz-surfaces')).toBe('/quartz-surfaces');
    expect(map.get('/quatrz-surfaces.html')).toBe('/quartz-surfaces');
    expect(map.get('/indian-marble-unpolished')).toBe('/indian-marbles');
  });
  it('never redirects to a missing route', () => {
    const live = new Set(indexableRoutes().map((r) => r.path));
    for (const r of rules) expect(live.has(r.to) || r.to === '/thank-you', `${r.from} -> ${r.to}`).toBe(true);
  });
});

describe('structured data', () => {
  it('escapes "<" to prevent script injection', () => {
    expect(jsonLdScript({ a: '</script>' }).__html).not.toContain('</script>');
  });
  it('LocalBusiness and BreadcrumbList use absolute URLs and real business data', () => {
    const lb = localBusinessLd();
    expect(lb.telephone).toBe('+917022630994');
    expect(lb.address.postalCode).toBe('560034');
    const bc = breadcrumbLd([
      { name: 'Home', href: '/' },
      { name: 'Marbles', href: '/marbles' },
    ]);
    expect(bc.itemListElement[1]!.item).toBe('https://skstonesindia.com/marbles');
  });
});
