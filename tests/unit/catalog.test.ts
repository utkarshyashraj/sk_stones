import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import corrections from '@/content/catalog-corrections.json';
import imageMeta from '@/content/generated/images.json';
import { allCategories, allProducts, ancestors, categoryCrumbs, productsIn, scopeOf } from '@/lib/catalog';
import { imageUrl } from '@/lib/image-url';

const ROOT = path.resolve(__dirname, '../..');
const products = allProducts();
const categories = allCategories();
const meta = imageMeta as Record<string, { widths: number[]; avif: boolean }>;

describe('catalog integrity', () => {
  it('contains every unique legacy product (460)', () => {
    expect(products).toHaveLength(460);
  });

  it('has unique, URL-safe product ids', () => {
    const ids = products.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it('assigns every product to an existing collection, category and subcategory', () => {
    const slugs = new Set(categories.map((c) => c.slug));
    for (const p of products) {
      expect(slugs.has(p.collection)).toBe(true);
      expect(slugs.has(p.category)).toBe(true);
      if (p.subcategory) expect(slugs.has(p.subcategory)).toBe(true);
    }
  });

  it('has an optimised image on disk for every product photo (no remote URLs)', () => {
    const withImage = products.filter((p) => p.image);
    expect(withImage.length).toBe(459);
    for (const p of withImage) {
      const m = meta[p.image!];
      expect(m, p.id).toBeDefined();
      for (const w of m!.widths)
        expect(fs.existsSync(path.join(ROOT, 'public', imageUrl(p.image!, w))), `${p.id} @${w}`).toBe(true);
    }
  });

  it('only "Kadpa Black Leather" lacks a photo (documented in corrections)', () => {
    expect(products.filter((p) => !p.image).map((p) => p.name)).toEqual(['Kadpa Black Leather']);
  });

  it('never references the old staging host in generated content', () => {
    const generated = fs.readFileSync(path.join(ROOT, 'content/generated/catalog.json'), 'utf8');
    expect(generated).not.toContain('hostingersite.com');
  });

  it('derives attributes only from product names / category copy', () => {
    for (const p of products) {
      const name = p.name.toLowerCase();
      if (p.finish === 'Polished') expect(name).toMatch(/polish/);
      if (p.finish === 'Leather') expect(name).toMatch(/leather/);
    }
  });
});

describe('legacy label corrections', () => {
  const byLegacyFile = (collection: string, fragment: string) =>
    products.find(
      (p) =>
        p.collection === collection &&
        p.image &&
        meta[p.image] &&
        p.legacy.page &&
        fragmentMatch(p, fragment),
    );
  const fragmentMatch = (p: (typeof products)[number], fragment: string) => {
    const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/generated/image-jobs.json'), 'utf8')) as {
      key: string;
      url: string | null;
    }[];
    return raw.find((j) => j.key === p.image)?.url?.includes(fragment) ?? false;
  };

  it('maps every corrected Kota Stones and Feature Wall image to its verified name', () => {
    for (const [collection, fix] of Object.entries(corrections.relabel)) {
      for (const [fragment, name] of Object.entries(fix.byImage)) {
        const matches = products.filter((p) => p.collection === collection && fragmentMatch(p, fragment));
        expect(matches.length, `${collection}/${fragment}`).toBe(1);
        expect(matches[0]!.name).toBe(name);
      }
    }
  });

  it('fixes the shifted SHABAD-YELLOW-LEATHER label (was "Kota Mirror Polished")', () => {
    const p = byLegacyFile('kota-stones', 'SHABAD-YELLOW-LEATHER');
    expect(p?.name).toBe('Shabad Yellow Leather');
    expect(p?.legacy.name).toBe('Kota Mirror Polished');
  });

  it('corrects the "Leathere" and "Flawor" typos', () => {
    const names = products.map((p) => p.name).join(' | ');
    expect(names).not.toMatch(/Leathere\b|Flawor|Leatherd/);
    expect(names).toContain('Flower Embossed Wall');
  });
});

describe('category hierarchy', () => {
  it('hub product lists are the union of their collections', () => {
    for (const c of categories.filter((x) => x.kind === 'hub')) {
      const kids = c.children.flatMap((k) => productsIn(k).map((p) => p.id));
      expect(new Set(productsIn(c.slug).map((p) => p.id))).toEqual(new Set(kids));
    }
  });

  it('builds breadcrumbs Home > Products > parent > child', () => {
    expect(categoryCrumbs('indian-marbles').map((c) => c.name)).toEqual([
      'Home',
      'Products',
      'Marbles',
      'Indian Marbles',
    ]);
    expect(ancestors('quartz-surfaces').map((c) => c.slug)).toEqual([
      'engineered-surfaces',
      'quartz-surfaces',
    ]);
    expect(scopeOf('tiles').size).toBe(8);
  });

  it('uses the corrected quartz slug and consistent Kota naming', () => {
    const slugs = categories.map((c) => c.slug);
    expect(slugs).toContain('quartz-surfaces');
    expect(slugs).not.toContain('quatrz-surfaces');
    expect(categories.find((c) => c.slug === 'kota-stones')?.name).toBe('Kota & Limestones');
  });
});
