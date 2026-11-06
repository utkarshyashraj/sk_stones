'use client';

import { SearchDialog } from '@/components/catalog/ProductSearch/SearchDialog';
import { ShortlistDrawer } from '@/components/shortlist/ShortlistDrawer';

/** Site-wide modal surfaces opened from the header, bottom nav and product cards. */
export function GlobalOverlays() {
  return (
    <>
      <SearchDialog />
      <ShortlistDrawer />
    </>
  );
}
