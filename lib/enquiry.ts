import { whatsappHref } from './site';

/** Link to the quote form with one stone prefilled. Name travels in the URL so the form needs no catalog data. */
export const enquireHref = (p: { id: string; name: string }, collectionName?: string) => {
  const params = new URLSearchParams({
    stone: p.id,
    name: collectionName ? `${p.name} (${collectionName})` : p.name,
  });
  return `/contact?${params.toString()}#quote`;
};

export const shortlistEnquiryHref = '/contact?from=shortlist#quote';

export const productWhatsappHref = (name: string, collectionName?: string) =>
  whatsappHref(
    `Hi S K Stones India, I'm interested in ${name}${collectionName ? ` (${collectionName})` : ''}. Please share details and pricing.`,
  );

export const shortlistWhatsappHref = (names: string[]) =>
  whatsappHref(
    `Hi S K Stones India, I'd like a quote for these stones:\n${names.map((n, i) => `${i + 1}. ${n}`).join('\n')}`,
  );
