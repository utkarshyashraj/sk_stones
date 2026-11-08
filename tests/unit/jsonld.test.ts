import { describe, expect, it } from 'vitest';
import { faqs } from '@/content/ref/home';
import { breadcrumbLd, faqPageLd, jsonLdScript, localBusinessLd } from '@/lib/seo';
import { categoryTrail, getRefCategory } from '@/lib/ref-catalog';

const ORIGIN = 'https://skstonesindia.com';

describe('structured data', () => {
  it('LocalBusiness carries the business details from lib/site', () => {
    const ld = localBusinessLd();
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('LocalBusiness');
    expect(ld.name).toBe('S K Stones India');
    expect(ld.telephone).toMatch(/^\+91/);
    expect(ld.address).toMatchObject({
      '@type': 'PostalAddress',
      postalCode: '560034',
      addressCountry: 'IN',
    });
    expect(ld.geo['@type']).toBe('GeoCoordinates');
    expect(ld.url.startsWith(ORIGIN)).toBe(true);
  });

  it('FAQPage: one Question with an acceptedAnswer per FAQ item', () => {
    const ld = faqPageLd(faqs);
    expect(ld['@type']).toBe('FAQPage');
    expect(ld.mainEntity).toHaveLength(faqs.length);
    for (const [i, q] of ld.mainEntity.entries()) {
      expect(q['@type']).toBe('Question');
      expect(q.name).toBe(faqs[i]!.q);
      expect(q.acceptedAnswer).toEqual({ '@type': 'Answer', text: faqs[i]!.a });
      expect(q.name.length).toBeGreaterThan(0);
    }
  });

  it('BreadcrumbList for a collection page: Home › Products › parent › collection, absolute URLs', () => {
    const ld = breadcrumbLd(categoryTrail(getRefCategory('indian-marbles')!));
    expect(ld['@type']).toBe('BreadcrumbList');
    expect(ld.itemListElement.map((e) => e.name)).toEqual(['Home', 'Products', 'Marbles', 'Indian Marbles']);
    expect(ld.itemListElement.map((e) => e.position)).toEqual([1, 2, 3, 4]);
    expect(ld.itemListElement.map((e) => e.item)).toEqual([
      `${ORIGIN}/`,
      `${ORIGIN}/products`,
      `${ORIGIN}/marbles`,
      `${ORIGIN}/indian-marbles`,
    ]);
    for (const e of ld.itemListElement) expect(e['@type']).toBe('ListItem');
  });

  it('serialises safely inside a script tag', () => {
    const html = jsonLdScript({ text: '</script><script>alert(1)</script>' }).__html;
    expect(html).not.toContain('<');
    expect(JSON.parse(html)).toEqual({ text: '</script><script>alert(1)</script>' });
  });
});
