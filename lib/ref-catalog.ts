import catalog from '@/content/generated/catalog.json';
import { imageUrl, pickWidth } from './image-url';
import { getImage } from './images';
import type { ImageRef } from './types';

/** Catalogue access for the reference-style product pages (content/generated/catalog.json). */
interface RefHero {
  tagline: string;
  taglineHtml: string;
  h1: string;
  h1Html: string;
  description: string;
}
export interface RefCategory {
  slug: string;
  name: string;
  kind: string;
  hasPage: boolean;
  /** The reference page this category was taken from (its SEO tags live under that name). */
  legacySource: string | null;
  refPage: {
    title: string;
    metaDescription: string;
    hero: RefHero;
    gridTitle: string;
    countLabel: string;
  } | null;
  overview: { html: string; image: string | null } | null;
  productIds: string[];
}
export interface RefProduct {
  id: string;
  name: string;
  image: string | null;
  collection: string;
  category: string;
  colours: string[];
  finishes: string[];
  applications: string[];
  origin: string | null;
  thicknessesMm: number[];
  formats: string[];
  synonyms: string[];
  usedInProjects: string[];
  /** where each value came from: business (confirmed), guess (from the name) or category */
  sources: Record<
    'colours' | 'finishes' | 'applications' | 'origin',
    'business' | 'guess' | 'category' | null
  >;
}
export interface CardPage {
  title: string;
  hero: RefHero;
  gridTitle: string;
  countLabel: string;
  cards: { name: string; description: string; href: string; image: string | null }[];
}

const categories = catalog.categories as unknown as RefCategory[];
const products = new Map((catalog.products as unknown as RefProduct[]).map((p) => [p.id, p]));
const cardPages = (catalog as unknown as { cardPages: Record<string, CardPage> }).cardPages;

/** Every route rendered by the shared product template, in catalogue order. */
export const productPageSlugs = () => categories.filter((c) => c.hasPage).map((c) => c.slug);
export const getRefCategory = (slug: string) => categories.find((c) => c.slug === slug && c.hasPage);
export const productsOf = (c: RefCategory) => c.productIds.map((id) => products.get(id)!).filter(Boolean);
export const productById = (id: string) => products.get(id);
export const allRefProducts = () => [...products.values()];
export const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;
/** Share of stones with business-confirmed values per field, and the unlock threshold (0.8). */
export const attributeCoverage = () =>
  (
    catalog as unknown as {
      attributeCoverage: { threshold: number; fields: Record<string, { share: number }> };
    }
  ).attributeCoverage;
export const cardPage = (slug: string): CardPage | undefined => cardPages[slug];

/** URLs the lightbox uses: the on-screen file and a larger one for the magnifier lens. */
export function fullAndZoom(img: ImageRef) {
  return {
    full: imageUrl(img.key, pickWidth(img, 1200)),
    zoom: imageUrl(img.key, img.zoom ?? img.widths.at(-1) ?? 1200),
  };
}
export const imageOf = (key: string | null) => (key ? getImage(key) : null);
