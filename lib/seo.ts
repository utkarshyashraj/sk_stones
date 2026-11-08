import refImages from '@/content/ref-images.json';
import { imageUrl, pickWidth } from './image-url';
import { getImage } from './images';
import { CANONICAL_ORIGIN } from './ref-seo';
import { site, SITE_ORIGIN } from './site';

/** Serialise JSON-LD for a <script type="application/ld+json"> (escapes `<` so it cannot close the tag). */
export const jsonLdScript = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, '\\u003c') });

/**
 * LocalBusiness structured data, as the reference site's js/seo-schema.js declares it — rendered at build time
 * instead of injected by script. The image points at the self-hosted copy of the same photo.
 */
export function localBusinessLd() {
  const img = getImage((refImages.images as Record<string, string>)['images/project-luxury-lobby.png']!);
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: site.name,
    alternateName: site.formerName,
    description:
      'Premium natural stone supplier, fabricator and installer in Bengaluru. Granites, marbles, cladding, flooring and custom stone art since 2014.',
    url: CANONICAL_ORIGIN,
    telephone: '+91-70226-30994',
    email: site.email,
    image: `${SITE_ORIGIN}${imageUrl(img.key, pickWidth(img, 1200))}`,
    priceRange: '₹₹₹',
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
    sameAs: [
      'https://wa.me/917022630994',
      'https://www.google.com/maps/place/S+K+STONES+INDIA+PVT+LTD/@12.9350616,77.6283894,17z',
    ],
    areaServed: site.areaServed,
  };
}

/** FAQPage for a page that shows these questions and answers (the FAQ accordion). */
export function faqPageLd(items: readonly { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };
}

/** BreadcrumbList from site paths (e.g. Home › Products › Marbles › Indian Marbles). */
export function breadcrumbLd(crumbs: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${CANONICAL_ORIGIN}${c.path === '/' ? '/' : c.path}`,
    })),
  };
}
