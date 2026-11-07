import catalog from '@/content/generated/catalog.json';
import { servicesMenu } from '@/content/nav';
import { projectBlocks } from '@/content/ref/projects';
import { pickWidth } from './image-url';
import { getImage } from './images';

/**
 * The static search index (written to /data/search-index.json at build time and fetched by the browser on
 * first use of search, filters or the saved list). Short keys keep it small (about 12 KB gzipped).
 */
export interface IndexStone {
  id: string;
  /** name */
  n: string;
  /** collection slug (the page that owns the stone) and category slug */
  c: string;
  k: string;
  /** thumbnail: image key + width, or null */
  img: [string, number] | null;
  /** colours and finishes for matching (business values, else name guesses) */
  col: string[];
  fin: string[];
  /** business-confirmed colours and finishes only (facets never use guesses) */
  colB: string[];
  finB: string[];
  /** applications and origin (business values, else the category's) */
  app: string[];
  o: string | null;
  th: number[];
  fmt: string[];
  syn: string[];
  /** project ids the business says used this stone */
  prj: string[];
}
export interface SearchIndex {
  v: 1;
  /** share of stones with business-confirmed values, per field, and the unlock threshold */
  coverage: { threshold: number; fields: Record<string, number> };
  stones: IndexStone[];
  collections: { s: string; n: string; count: number; hub: boolean }[];
  services: { s: string; n: string }[];
  applications: { v: string; count: number }[];
  projects: { id: string; n: string }[];
}

interface CatProduct {
  id: string;
  name: string;
  collection: string;
  category: string;
  image: string | null;
  colours: string[];
  finishes: string[];
  applications: string[];
  origin: string | null;
  thicknessesMm: number[];
  formats: string[];
  synonyms: string[];
  usedInProjects: string[];
  sources: { colours: string | null; finishes: string | null };
}

export function buildSearchIndex(): SearchIndex {
  const products = catalog.products as unknown as CatProduct[];
  const cats = catalog.categories as unknown as {
    slug: string;
    name: string;
    kind: string;
    hasPage: boolean;
    productIds: string[];
  }[];
  const cov = catalog.attributeCoverage as { threshold: number; fields: Record<string, { share: number }> };
  const appCounts = new Map<string, number>();
  for (const p of products) for (const a of p.applications) appCounts.set(a, (appCounts.get(a) ?? 0) + 1);
  return {
    v: 1,
    coverage: {
      threshold: cov.threshold,
      fields: Object.fromEntries(Object.entries(cov.fields).map(([k, v]) => [k, v.share])),
    },
    stones: products.map((p) => {
      const img = p.image ? getImage(p.image) : null;
      return {
        id: p.id,
        n: p.name,
        c: p.collection,
        k: p.category,
        img: img ? [img.key, pickWidth(img, 400)] : null,
        col: p.colours,
        fin: p.finishes,
        colB: p.sources.colours === 'business' ? p.colours : [],
        finB: p.sources.finishes === 'business' ? p.finishes : [],
        app: p.applications,
        o: p.origin,
        th: p.thicknessesMm,
        fmt: p.formats,
        syn: p.synonyms,
        prj: p.usedInProjects,
      };
    }),
    collections: cats
      .filter((c) => c.hasPage)
      .map((c) => ({ s: c.slug, n: c.name, count: c.productIds.length, hub: c.kind === 'hub' })),
    services: [...servicesMenu, { label: 'Installations', href: '/installations' }].map((s) => ({
      s: s.href.slice(1),
      n: s.label,
    })),
    applications: [...appCounts].map(([v, count]) => ({ v, count })).sort((a, b) => b.count - a.count),
    projects: projectBlocks.map((b) => ({ id: b.id, n: b.name })),
  };
}
