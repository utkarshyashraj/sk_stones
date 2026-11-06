// Build-time only: imported by Server Components (and tests). Client code receives ImageRef props instead.
import imageData from '@/content/generated/images.json';
import type { ImageMeta, ImageRef } from './types';

const images = imageData as Record<string, ImageMeta>;

export function getImage(key: string): ImageRef {
  const meta = images[key];
  if (!meta)
    throw new Error(`Unknown image key "${key}". Run npm run catalog:build && npm run images:optimize.`);
  return { key, ...meta };
}

export const getSiteImage = (name: string) => getImage(`site/${name}`);
export const hasImage = (key: string) => key in images;
