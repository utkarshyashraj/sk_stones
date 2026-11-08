import type { FilterStone } from './filters';
import type { LightboxItem } from './lightbox-items';
import type { IndexStone, SearchIndex } from './search-index';

/** Filter records from a product grid's published items (business-confirmed values only for colour/finish). */
export function fromLightboxItems(items: LightboxItem[]): FilterStone[] {
  return items
    .filter((it) => it.id)
    .map((it, order) => ({
      id: it.id!,
      name: it.alt,
      c: it.c ?? '',
      cn: it.cn ?? '',
      colours: it.d?.colours ?? [],
      finishes: it.d?.finishes ?? [],
      applications: it.d?.applications ?? [],
      origin: it.d?.origin ?? null,
      thicknessesMm: it.d?.thicknessesMm ?? [],
      formats: it.d?.formats ?? [],
      order,
    }));
}

/** Filter records from index stones (search results), keeping their current order as the reference order. */
export function fromIndexStones(index: SearchIndex, stones: IndexStone[]): FilterStone[] {
  const names = new Map(index.collections.map((c) => [c.s, c.n]));
  return stones.map((s, order) => ({
    id: s.id,
    name: s.n,
    c: s.c,
    cn: names.get(s.c) ?? s.c,
    colours: s.colB,
    finishes: s.finB,
    applications: s.app,
    origin: s.o,
    thicknessesMm: s.th,
    formats: s.fmt,
    order,
  }));
}
