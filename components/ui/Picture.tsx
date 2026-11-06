import type { CSSProperties } from 'react';
import { preload } from 'react-dom';
import { imageUrl, srcSet } from '@/lib/image-url';
import type { ImageRef } from '@/lib/types';

interface PictureProps {
  image: ImageRef;
  alt: string;
  /** Layout hint for the browser, e.g. "(min-width: 1024px) 33vw, 100vw" */
  sizes: string;
  /** Above-the-fold images: eager + high fetch priority (LCP). */
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  /** When true the image fills its (positioned) parent with object-fit: cover. */
  fill?: boolean;
  style?: CSSProperties;
  /** Set false for eager images that are not the LCP candidate (avoids competing preloads). */
  preloadHint?: boolean;
}

/**
 * Responsive image: AVIF (when generated) + WebP sources with intrinsic width/height so the
 * browser reserves space before load (no layout shift). The dominant colour paints a placeholder.
 */
export function Picture({
  image,
  alt,
  sizes,
  priority,
  className,
  imgClassName,
  fill,
  style,
  preloadHint = true,
}: PictureProps) {
  if (priority && preloadHint) {
    // Hoisted into <head>: the browser starts fetching the LCP image before parsing the body.
    const best = image.avif ? 'avif' : 'webp';
    preload(imageUrl(image.key, image.widths[0] ?? 800, best), {
      as: 'image',
      type: `image/${best}`,
      imageSrcSet: srcSet(image.key, image, best),
      imageSizes: sizes,
      fetchPriority: 'high',
    });
  }
  const fallbackWidth = image.widths.find((w) => w >= 800) ?? image.widths[image.widths.length - 1] ?? 800;
  const fillStyle: CSSProperties = fill
    ? { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }
    : {};
  return (
    <picture className={className} style={fill ? { position: 'absolute', inset: 0 } : undefined}>
      {image.avif ? (
        <source type="image/avif" srcSet={srcSet(image.key, image, 'avif')} sizes={sizes} />
      ) : null}
      <source type="image/webp" srcSet={srcSet(image.key, image)} sizes={sizes} />
      <img
        src={imageUrl(image.key, fallbackWidth)}
        alt={alt}
        width={image.w}
        height={image.h}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        className={imgClassName}
        style={{ backgroundColor: image.color, ...fillStyle, ...style }}
      />
    </picture>
  );
}
