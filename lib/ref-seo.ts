import type { Metadata } from 'next';
import seo from '@/content/ref/seo.json';
import refImages from '@/content/ref-images.json';
import { imageUrl, pickWidth } from './image-url';
import { getImage } from './images';
import { SITE_ORIGIN } from './site';

type RefSeo = {
  title: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
};

/** Canonical host, as the reference declares it (https://skstonesindia.com/). */
export const CANONICAL_ORIGIN = 'https://skstonesindia.com';
const DEFAULT_OG = 'images/project-luxury-lobby.png'; // the reference homepage's og:image

/**
 * Next.js metadata for a ported page from the reference page's own tags (content/ref/seo.json):
 * its title, description and keywords, Open Graph and Twitter cards (falling back to the page title /
 * description where the reference page has none), canonical on skstonesindia.com. The share image is
 * the self-hosted copy, served from wherever this build is deployed.
 */
export function pageMetadata(refPage: string, path: string, override: Partial<RefSeo> = {}): Metadata {
  const page = { ...(seo as Record<string, RefSeo>)[refPage], ...override } as RefSeo;
  if (!page?.title) throw new Error(`No reference SEO for page "${refPage}"`);
  const canonical = `${CANONICAL_ORIGIN}${path === '/' ? '/' : path}`;
  const ogKey =
    (refImages.images as Record<string, string>)[page.ogImage ?? DEFAULT_OG] ??
    (refImages.images as Record<string, string>)[DEFAULT_OG]!;
  const og = getImage(ogKey);
  const w = pickWidth(og, 1200);
  const image = {
    url: `${SITE_ORIGIN}${imageUrl(og.key, w)}`,
    width: w,
    height: Math.round((og.h / og.w) * w),
  };
  const ogTitle = page.ogTitle ?? page.title;
  const ogDescription = page.ogDescription ?? page.description;
  return {
    title: { absolute: page.title },
    description: page.description,
    keywords: page.keywords,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      siteName: 'S K Stones India',
      locale: 'en_IN',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [image.url],
    },
  };
}
