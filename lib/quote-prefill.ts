/**
 * Pure helpers for prefilling the quote form from saved stones, a single stone or a guided result.
 * Unit-tested (tests/unit/quote-prefill.test.ts).
 */
export type RequestKind = 'quote' | 'visit' | 'samples';

export const REQUEST_LABEL: Record<RequestKind, string> = {
  quote: 'Quote request',
  visit: 'Showroom visit',
  samples: 'Sample request',
};

export const parseRequest = (v: string | null): RequestKind =>
  v === 'visit' || v === 'samples' ? v : 'quote';

/** The FormSubmit email subject for each kind of request. */
export const subjectFor = (kind: RequestKind) =>
  kind === 'visit'
    ? 'Showroom Visit Request - S K Stones India'
    : kind === 'samples'
      ? 'Sample Request - S K Stones India'
      : 'Custom Quote Request - S K Stones India';

/** Catalogue category → the form's "Stone Type Interested" option. */
const STONE_TYPE_BY_CATEGORY: Record<string, string> = {
  marbles: 'marbles',
  'granites-group': 'granites',
  granites: 'granites',
  'natural-stones': 'natural-stones',
  'engineered-surfaces': 'engineered-surfaces',
  'wall-claddings': 'wall-claddings',
  tiles: 'tiles',
  'stone-art': 'stone-art',
  'clay-products': 'other',
  'concrete-blocks': 'other',
};

/** Preselect the stone type only when every stone maps to the same option; otherwise leave it to the visitor. */
export function stoneTypeFor(categories: string[]): string {
  const types = new Set(categories.map((c) => STONE_TYPE_BY_CATEGORY[c] ?? 'other'));
  return types.size === 1 ? [...types][0]! : '';
}

/** One readable line for the email: "Absolute Black (Indian Granites); Crema Marfil (Imported Marbles)". */
export const stonesLine = (stones: { name: string; collection: string }[]) =>
  stones.map((s) => `${s.name} (${s.collection})`).join('; ');
