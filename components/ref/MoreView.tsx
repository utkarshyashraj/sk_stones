'use client';

import { useEffect } from 'react';

/**
 * Reference homepage "More" view: on phones, /?view=more shows the sections the default mobile homepage
 * hides (Who We Are, Process, Trust, FAQ, Reviews) and scrolls to the requested one. On wider screens the
 * parameter is dropped from the URL. Toggles the class on the page wrapper (the reference used <html>).
 */
export function MoreView() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') !== 'more') return;
    const root = document.querySelector('[data-ref-root]');
    if (window.matchMedia('(max-width: 1024px)').matches) {
      root?.classList.add('mobile-more-view');
      if (window.location.hash)
        requestAnimationFrame(() =>
          document
            .querySelector(window.location.hash)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        );
    } else window.history.replaceState(null, '', window.location.pathname + window.location.hash);
    return () => root?.classList.remove('mobile-more-view');
  }, []);
  return null;
}
