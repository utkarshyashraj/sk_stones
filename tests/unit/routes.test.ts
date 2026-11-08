import { describe, expect, it } from 'vitest';
import catalog from '@/content/generated/catalog.json';
import legacy from '@/content/legacy-urls.json';
import { indexableRoutes, legacyRedirects, noindexRoutes } from '@/lib/routes';
import { productPageSlugs } from '@/lib/ref-catalog';

describe('routes', () => {
  it('serves every reference product page under its reference URL', () => {
    const slugs = productPageSlugs();
    for (const s of ['granites', 'quatrz-surfaces', 'indian-marbles', 'tiles', 'marbles', 'concrete-blocks'])
      expect(slugs).toContain(s);
    expect(slugs).not.toContain('indian-granites');
    expect(slugs).not.toContain('quartz-surfaces');
  });

  it('redirects retired and renamed URLs so nothing 404s', () => {
    const r = new Map(legacyRedirects(legacy.pages).map((x) => [x.from, x.to]));
    expect(r.get('/quartz-surfaces')).toBe('/quatrz-surfaces');
    expect(r.get('/indian-granites')).toBe('/granites');
    expect(r.get('/case-study-ritz-carlton')).toBe('/projects');
    expect(r.get('/case-study-ritz-carlton.html')).toBe('/projects');
    expect(r.has('/search')).toBe(false); // a real (noindex) page again
    expect(r.get('/index.html')).toBe('/');
    expect(r.get('/kota-stones.html')).toBe('/kota-stones');
    const indexable = new Set([...indexableRoutes().map((x) => x.path), ...noindexRoutes]);
    for (const to of r.values()) expect(indexable.has(to), `redirect target ${to}`).toBe(true);
  });

  it('every page product id resolves and every product has a photo', () => {
    const ids = new Set(catalog.products.map((p) => p.id));
    for (const c of catalog.categories) for (const id of c.productIds) expect(ids.has(id), id).toBe(true);
    expect(catalog.products.every((p) => p.image)).toBe(true);
  });
});
