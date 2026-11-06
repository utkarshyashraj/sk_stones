'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { whatsappHref } from '@/lib/site';
import styles from './GlobalOverlays.module.css';
import { useSearchOpen } from '@/components/catalog/ProductSearch/search-store';
import { useShortlistOpen } from '@/components/shortlist/shortlist-store';

// Code-split: these modals are downloaded and mounted only the first time they are opened,
// keeping them out of every page's initial JavaScript and hydration work.
const SearchDialog = dynamic(
  () => import('@/components/catalog/ProductSearch/SearchDialog').then((m) => m.SearchDialog),
  {
    ssr: false,
  },
);
const ShortlistDrawer = dynamic(
  () => import('@/components/shortlist/ShortlistDrawer').then((m) => m.ShortlistDrawer),
  {
    ssr: false,
  },
);

export function GlobalOverlays() {
  const searchOpen = useSearchOpen();
  const shortlistOpen = useShortlistOpen();
  const [seen, setSeen] = useState({ search: false, shortlist: false });
  if ((searchOpen && !seen.search) || (shortlistOpen && !seen.shortlist)) {
    setSeen({ search: seen.search || searchOpen, shortlist: seen.shortlist || shortlistOpen });
  }
  return (
    <>
      {seen.search ? <SearchDialog /> : null}
      {seen.shortlist ? <ShortlistDrawer /> : null}
      <a
        className={styles.whatsapp}
        href={whatsappHref('Hi S K Stones India, I have an enquiry.')}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp (opens in a new tab)"
      >
        <Icon name="whatsapp" size={26} />
      </a>
    </>
  );
}
