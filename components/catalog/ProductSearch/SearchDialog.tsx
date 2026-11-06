'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useMemo, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useModalDialog } from '@/components/ui/useModalDialog';
import { imageUrl, pickWidth } from '@/lib/image-url';
import { matchesQuery } from '@/lib/search';
import { closeSearch, useSearchOpen } from './search-store';
import { loadCatalogIndex, type CatalogIndex } from './catalog-index';
import styles from './SearchDialog.module.css';

const POPULAR = [
  { name: 'Marbles', href: '/marbles' },
  { name: 'Granites', href: '/granites' },
  { name: 'Quartz', href: '/quartz-surfaces' },
  { name: 'Wall Claddings', href: '/wall-claddings' },
  { name: 'Tiles', href: '/tiles' },
  { name: 'Cobble Stones', href: '/cobble-stones' },
];

export function SearchDialog() {
  const open = useSearchOpen();
  const ref = useModalDialog(open, closeSearch);
  const router = useRouter();
  const [q, setQ] = useState('');
  const [index, setIndex] = useState<CatalogIndex | null>(null);
  const [error, setError] = useState(false);
  const listId = useId();

  useEffect(() => {
    if (open && !index) {
      loadCatalogIndex()
        .then(setIndex)
        .catch(() => setError(true));
    }
  }, [open, index]);

  const results = useMemo(() => {
    if (!index || q.trim().length < 2) return [];
    return index.products.filter((p) => matchesQuery(p, q, index.names)).slice(0, 8);
  }, [index, q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    closeSearch();
    router.push(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : '/search');
  };

  return (
    <dialog ref={ref} className={styles.dialog} aria-labelledby={`${listId}-title`}>
      <div className={styles.inner}>
        <div className={styles.head}>
          <h2 id={`${listId}-title`} className={styles.title}>
            Search our stones
          </h2>
          <button type="button" className={styles.close} onClick={closeSearch} aria-label="Close search">
            <Icon name="close" size={22} />
          </button>
        </div>
        <form action="/search" method="get" role="search" onSubmit={submit} className={styles.form}>
          <Icon name="search" className={styles.formIcon} />
          <label htmlFor={`${listId}-q`} className="visually-hidden">
            Search by stone name, colour, finish or use
          </label>
          <input
            id={`${listId}-q`}
            name="q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. black granite, travertine, cladding…"
            autoComplete="off"
            autoFocus
            aria-describedby={`${listId}-hint`}
          />
          <button type="submit" className="btn btn--primary btn--sm">
            Search
          </button>
        </form>
        <p id={`${listId}-hint`} className={styles.hint} aria-live="polite">
          {error
            ? 'Instant results are unavailable — press Search to see all matches.'
            : q.trim().length >= 2 && index
              ? `${results.length ? `Top ${results.length} matches` : 'No instant matches'} — press Enter for all results`
              : 'Search across 460+ stones by name, colour, finish or application.'}
        </p>

        {results.length ? (
          <ul className={styles.results}>
            {results.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/${p.collection}#product=${p.id}`}
                  className={styles.result}
                  onClick={closeSearch}
                >
                  {p.img ? (
                    // eslint-disable-next-line @next/next/no-img-element -- pre-optimised thumbnail
                    <img
                      src={imageUrl(p.img.key, pickWidth(p.img, 200))}
                      alt=""
                      width={56}
                      height={56}
                      loading="lazy"
                      style={{ backgroundColor: p.img.color }}
                    />
                  ) : (
                    <span className={styles.noThumb} aria-hidden="true">
                      <Icon name="image" />
                    </span>
                  )}
                  <span>
                    <span className={styles.rName}>{p.name}</span>
                    <span className={styles.rMeta}>{index?.names[p.collection]}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.popular}>
            <p className={styles.popularTitle}>Popular collections</p>
            <ul>
              {POPULAR.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} onClick={closeSearch} className={styles.chip}>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </dialog>
  );
}
