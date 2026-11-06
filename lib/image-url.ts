import type { ImageMeta } from './types';

/** Pure helpers shared by server and client components (no JSON imports here). */
export const imageUrl = (key: string, width: number, ext: 'webp' | 'avif' = 'webp') =>
  `/images/${key}-${width}.${ext}`;

export const srcSet = (key: string, meta: Pick<ImageMeta, 'widths'>, ext: 'webp' | 'avif' = 'webp') =>
  meta.widths.map((w) => `${imageUrl(key, w, ext)} ${w}w`).join(', ');

/** The smallest rendition at least `target` px wide (or the largest available). */
export const pickWidth = (meta: Pick<ImageMeta, 'widths'>, target: number) =>
  meta.widths.find((w) => w >= target) ?? meta.widths[meta.widths.length - 1] ?? target;
