/**
 * Single source of truth for business details. Every value here was taken from the legacy
 * site (contact page, footer, LocalBusiness schema in js/seo-schema.js). Nothing is invented.
 * Items marked VERIFY are flagged in docs/AUDIT-REPORT.md for business confirmation.
 */
/**
 * Public origin of the deployed site. Defaults to the business domain; the GitHub Pages build sets
 * NEXT_PUBLIC_SITE_URL (see .github/workflows/pages.yml) so canonicals, the sitemap, structured data
 * and the form's thank-you redirect all point at the address the site is actually served from.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://skstonesindia.com').replace(/\/+$/, '');
/** Scheme + host only (SITE_URL may carry a sub-path); for URLs that already include the base path. */
export const SITE_ORIGIN = new URL(SITE_URL).origin;
/** GitHub Pages build: folder-style URLs (/about/ -> about/index.html). Mirrors next.config.ts. */
export const TRAILING_SLASH = process.env.NEXT_PUBLIC_TRAILING_SLASH === '1';

export const site = {
  name: 'S K Stones India',
  legalName: 'S K Stones India Pvt. Ltd.',
  formerName: 'Shree Stones & Services',
  tagline: 'Premium natural stones, granites and marbles in Bengaluru',
  foundedYear: 2014,
  phone: { display: '+91 70226 30994', e164: '+917022630994' },
  whatsapp: '917022630994',
  email: 'info@skstonesindia.com',
  address: {
    street: '627-628, 15th Main, 80 Feet Road, 5th Cross Rd, 4th Block',
    locality: 'Koramangala',
    city: 'Bengaluru',
    region: 'Karnataka',
    postalCode: '560034',
    country: 'IN',
  },
  geo: { lat: 12.9350616, lng: 77.6283894 },
  /** VERIFY: from legacy structured data (Mon–Sat 09:00–19:00); not shown anywhere else on the legacy site. */
  hours: {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '09:00',
    closes: '19:00',
    label: 'Mon – Sat, 9:00 AM – 7:00 PM',
  },
  maps: {
    place:
      'https://www.google.com/maps/place/S+K+STONES+INDIA+PVT+LTD/@12.9350616,77.6283894,17z/data=!3m1!4b1!4m6!3m5!1s0x3bae150ee079f97f:0x6015233c6ada5afd!8m2!3d12.9350616!4d77.6283894!16s%2Fg%2F11y4103plf',
    embed: 'https://www.google.com/maps?cid=6923478744549710589&hl=en&z=17&output=embed',
  },
  reviewsUrl: 'https://www.google.com/search?q=S+K+Stones+India+Bengaluru+reviews',
  linkedin: 'https://www.linkedin.com/in/shree-kumar-gandhi-8699533a6/',
  /** Lead form relay used by the legacy site — submissions are emailed to `email`. */
  form: {
    action: 'https://formsubmit.co/info@skstonesindia.com',
    thankYouPath: '/thank-you',
  },
  areaServed: ['Bengaluru', 'Karnataka', 'India'],
} as const;

export const fullAddress = `${site.address.street}, Bengaluru, Karnataka ${site.address.postalCode}`;
export const telHref = `tel:${site.phone.e164}`;

export function whatsappHref(message?: string): string {
  const base = `https://wa.me/${site.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function absoluteUrl(path = '/') {
  if (path === '/') return `${SITE_URL}/`;
  const i = path.search(/[?#]/);
  const [p, rest] = i === -1 ? [path, ''] : [path.slice(0, i), path.slice(i)];
  // Page paths get the trailing slash in folder-style builds; files (/sitemap.xml, images) never do.
  const page = TRAILING_SLASH && !p.endsWith('/') && !/\.[a-z0-9]+$/i.test(p) ? `${p}/` : p;
  return `${SITE_URL}${page}${rest}`;
}
