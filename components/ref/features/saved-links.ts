import type { SearchIndex, IndexStone } from '@/lib/search-index';
import { absoluteUrl, whatsappHref } from '@/lib/site';
import { collectionName, stoneHref } from './index-client';

export type RequestKind = 'quote' | 'visit' | 'samples';

const INTRO: Record<RequestKind, string> = {
  quote: "I'd like a quote for these stones",
  visit: "I'd like to see these stones at your showroom",
  samples: "I'd like samples of these stones",
};

/** Numbered list "Name (Collection) – link" for WhatsApp and the quote form. */
export function stoneLines(index: SearchIndex, stones: IndexStone[], withLinks = true): string[] {
  return stones.map(
    (s, i) =>
      `${i + 1}. ${s.n} (${collectionName(index, s.c)})${withLinks ? ` – ${absoluteUrl(stoneHref(s))}` : ''}`,
  );
}

export function savedWhatsappHref(index: SearchIndex, stones: IndexStone[], kind: RequestKind = 'quote') {
  return whatsappHref(`Hi S K Stones India, ${INTRO[kind]}:\n${stoneLines(index, stones).join('\n')}`);
}

/** Read-only page anyone can open to see (and save) the same stones. */
export const shareUrl = (ids: string[]) =>
  `${absoluteUrl('/saved')}?ids=${ids.map(encodeURIComponent).join(',')}`;

/** The quote form, prefilled from the saved list, for a quote, a showroom visit or a sample request. */
export const savedFormHref = (kind: RequestKind = 'quote') =>
  kind === 'quote' ? '/contact?saved=1' : `/contact?saved=1&request=${kind}`;
