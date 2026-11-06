'use client';

import { useEffect } from 'react';
import { useShortlist } from '@/components/shortlist/shortlist-store';

/** After a successful enquiry the shortlist has been sent, so it is emptied. */
export function ClearShortlistOnArrival() {
  const { clear, count } = useShortlist();
  useEffect(() => {
    if (count > 0 && document.referrer.includes('formsubmit')) clear();
  }, [clear, count]);
  return null;
}
