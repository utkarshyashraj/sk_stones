import type { Metadata } from 'next';
import { imageUrl, pickWidth } from './image-url';
import { absoluteUrl, site, SITE_URL } from './site';
import type { Crumb, ImageRef } from './types';

interface PageSeo {
  title: string;
  description: string;
  path: string;
  image?: ImageRef | null;
  noindex?: boolean;
  type?: 'website' | 'article';
}

const DEFAULT_OG = { url: '/images/site/project-ritz-carlton-1024.webp', width: 1024, height: 672 };

export function ogImage(image?: ImageRef | null) {
  if (!image) return DEFAULT_OG;
  const w = pickWidth(image, 1200);
  return { url: imageUrl(image.key, w), width: w, height: Math.round((image.h / image.w) * w) };
}

export function buildMetadata({
  title,
  description,
  path,
  image,
  noindex,
  type = 'website',
}: PageSeo): Metadata {
  const og = ogImage(image);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type,
      url: path,
      title,
      description,
      siteName: site.name,
      locale: 'en_IN',
      images: [{ url: og.url, width: og.width, height: og.height, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [og.url] },
  };
}

// ---------- JSON-LD ----------
export const jsonLdScript = (data: object) => ({ __html: JSON.stringify(data).replace(/</g, '\\u003c') });

export function localBusinessLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': `${SITE_URL}/#business`,
    name: site.name,
    legalName: site.legalName,
    alternateName: site.formerName,
    description:
      'Premium natural stone supplier, fabricator and installer in Bengaluru. Granites, marbles, cladding, flooring and custom stone art since 2014.',
    url: SITE_URL,
    telephone: site.phone.e164,
    email: site.email,
    image: absoluteUrl(DEFAULT_OG.url),
    logo: absoluteUrl('/images/site/sk-mark-transparent-480.webp'),
    foundingDate: String(site.foundedYear),
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: site.hours.days,
      opens: site.hours.opens,
      closes: site.hours.closes,
    },
    hasMap: site.maps.place,
    sameAs: [site.maps.place, site.linkedin],
    areaServed: site.areaServed,
    knowsAbout: ['Granite', 'Marble', 'Natural stone', 'Stone cladding', 'Stone flooring', 'Stone art'],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: site.phone.e164,
      contactType: 'sales',
      areaServed: 'IN',
      availableLanguage: ['en', 'hi', 'kn'],
    },
    slogan: site.tagline,
  };
}

export function breadcrumbLd(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.href),
    })),
  };
}

/**
 * Category pages list their stones as an ItemList. Products carry no price, availability or
 * reviews on this site, so schema.org Product (which Google expects with offers/reviews) is
 * intentionally not used — see docs/AUDIT-REPORT.md.
 */
export function itemListLd(name: string, path: string, items: { name: string; image: ImageRef | null }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url: absoluteUrl(path),
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      ...(it.image ? { image: absoluteUrl(imageUrl(it.image.key, pickWidth(it.image, 800))) } : {}),
    })),
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}
