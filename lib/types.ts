export interface ImageMeta {
  w: number;
  h: number;
  widths: number[];
  avif: boolean;
  color: string;
  /** Width of the magnifier rendition (catalog only); null = the largest srcset width is full size. */
  zoom?: number | null;
}

/** An optimised image reference: key -> /images/<key>-<width>.webp */
export interface ImageRef extends ImageMeta {
  key: string;
}

export type CategoryKind = 'hub' | 'collection' | 'enquiry';

export interface Category {
  slug: string;
  name: string;
  parent: string | null;
  kind: CategoryKind;
  order: number;
  title: string;
  description: string;
  hero: { eyebrow: string; heading: string; description: string };
  cardDescription?: string;
  applications: string[];
  origin?: string;
  legacySlugs?: string[];
  legacySource: string | null;
  overview: { paragraphs: string[]; bullets: string[]; image: string | null } | null;
  cardImage: string | null;
  productCount: number;
  children: string[];
}

export interface Product {
  id: string;
  name: string;
  /** Top-level category slug (e.g. "marbles") */
  category: string;
  /** Second-level slug, or null when the product sits directly in a top-level category */
  subcategory: string | null;
  /** The leaf collection page the product belongs to */
  collection: string;
  image: string | null;
  colours: string[];
  finish: string | null;
  applications: string[];
  origin: string | null;
  size: string | null;
  tags: string[];
  legacy: { page: string; index: number | null; name: string | null };
}

/** Lean product shape shipped to the browser (no legacy provenance). */
export interface ClientProduct {
  id: string;
  name: string;
  category: string;
  subcategory: string | null;
  collection: string;
  img: ImageRef | null;
  colours: string[];
  finish: string | null;
  applications: string[];
  origin: string | null;
  size: string | null;
  tags: string[];
}

export interface Crumb {
  name: string;
  href: string;
}
