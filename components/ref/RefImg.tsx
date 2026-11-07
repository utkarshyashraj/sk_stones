import type { CSSProperties } from 'react';
import { preload } from 'react-dom';
import refImages from '@/content/ref-images.json';
import { imageUrl, srcSet } from '@/lib/image-url';
import { getImage } from '@/lib/images';
import type { ImageRef } from '@/lib/types';

const MAP = refImages.images as Record<string, string>;

/** The optimised, self-hosted copy of an image the reference page referenced by `src`. */
export function refImage(src: string): ImageRef {
  const key = MAP[src];
  if (!key) throw new Error(`Reference image not registered: ${src} (run scripts/collect-ref-images.mjs)`);
  return getImage(key);
}

/**
 * A reference <img>, kept as a single <img> element (no <picture> wrapper) so the reference CSS —
 * which targets `.card img`, `.x > img` and so on — applies exactly. Serves responsive WebP renditions
 * of the self-hosted copy; lazy unless `priority`.
 */
export function RefImg({
  src,
  image,
  alt,
  sizes = '100vw',
  priority = false,
  className,
  style,
  id,
}: {
  src?: string;
  image?: ImageRef;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
  id?: string;
}) {
  const img = image ?? refImage(src!);
  if (priority)
    preload(imageUrl(img.key, img.widths[0] ?? 800), {
      as: 'image',
      type: 'image/webp',
      imageSrcSet: srcSet(img.key, img),
      imageSizes: sizes,
      fetchPriority: 'high',
    });
  const fallback = img.widths.find((w) => w >= 800) ?? img.widths.at(-1) ?? 800;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- pre-optimised WebP set; see header comment
    <img
      id={id}
      src={imageUrl(img.key, fallback)}
      srcSet={srcSet(img.key, img)}
      sizes={sizes}
      alt={alt}
      width={img.w}
      height={img.h}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={className}
      style={style}
    />
  );
}
