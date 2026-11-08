import { describe, expect, it } from 'vitest';
import { parseRequest, REQUEST_LABEL, stonesLine, stoneTypeFor, subjectFor } from '@/lib/quote-prefill';

describe('quote form prefill', () => {
  it('preselects the stone type only when every stone shares one', () => {
    expect(stoneTypeFor(['granites-group', 'granites-group'])).toBe('granites');
    expect(stoneTypeFor(['marbles'])).toBe('marbles');
    expect(stoneTypeFor(['marbles', 'granites-group'])).toBe('');
    expect(stoneTypeFor(['clay-products', 'concrete-blocks'])).toBe('other');
    expect(stoneTypeFor([])).toBe('');
  });
  it('writes one readable stones line for the email', () => {
    expect(
      stonesLine([
        { name: 'Tan Brown', collection: 'Indian Granites' },
        { name: 'Crema Marfil', collection: 'Imported Marbles' },
      ]),
    ).toBe('Tan Brown (Indian Granites); Crema Marfil (Imported Marbles)');
  });
  it('maps request kinds to labels and email subjects', () => {
    expect(parseRequest('visit')).toBe('visit');
    expect(parseRequest('samples')).toBe('samples');
    expect(parseRequest('anything')).toBe('quote');
    expect(REQUEST_LABEL.samples).toBe('Sample request');
    expect(subjectFor('visit')).toMatch(/Showroom Visit/);
    expect(subjectFor('quote')).toMatch(/Custom Quote/);
  });
});
