import { projectBlocks } from '@/content/ref/projects';
import { fullAndZoom, categoryName, imageOf, type RefProduct } from './ref-catalog';
import { imageUrl, pickWidth } from './image-url';
import type { ImageRef } from './types';

/**
 * What the fullscreen viewer needs per photo, published by the server as inline JSON next to each grid
 * (components/ref/LightboxData.tsx) so the viewer opens without fetching anything.
 * Stone details carry only facts: business-confirmed colours/finishes (never name guesses), and
 * applications/origin from the business or, failing that, the stone's category.
 */
export interface StoneDetail {
  colours: string[];
  finishes: string[];
  applications: string[];
  origin: string | null;
  thicknessesMm: number[];
  formats: string[];
  usedInProjects: { id: string; name: string }[];
}
export interface LightboxItem {
  src: string;
  zoom: string;
  alt: string;
  /** product grids only */
  id?: string;
  c?: string;
  cn?: string;
  thumb?: string;
  d?: StoneDetail;
}
export interface LightboxGroup {
  grid: string;
  item: string;
  items: LightboxItem[];
}

export function stoneItem(p: RefProduct): LightboxItem {
  const img = imageOf(p.image)!;
  const { full, zoom } = fullAndZoom(img);
  return {
    src: full,
    zoom,
    alt: p.name,
    id: p.id,
    c: p.collection,
    cn: categoryName(p.collection),
    thumb: imageUrl(img.key, pickWidth(img, 400)),
    d: {
      colours: p.sources.colours === 'business' ? p.colours : [],
      finishes: p.sources.finishes === 'business' ? p.finishes : [],
      applications: p.applications,
      origin: p.origin,
      thicknessesMm: p.thicknessesMm,
      formats: p.formats,
      usedInProjects: p.usedInProjects
        .map((id) => projectBlocks.find((b) => b.id === id))
        .filter((b) => b !== undefined)
        .map((b) => ({ id: b.id, name: b.name })),
    },
  };
}

export function galleryItem(img: ImageRef, alt: string): LightboxItem {
  const { full, zoom } = fullAndZoom(img);
  return { src: full, zoom, alt };
}
