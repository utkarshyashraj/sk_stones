import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { breadcrumbLd, jsonLdScript } from '@/lib/seo';
import type { Crumb } from '@/lib/types';
import styles from './Breadcrumbs.module.css';

/** Visible breadcrumb trail + BreadcrumbList structured data (server-rendered). The last crumb is the current page. */
export function Breadcrumbs({ items, tone = 'dark' }: { items: Crumb[]; tone?: 'dark' | 'light' }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className={`${styles.crumbs} ${tone === 'light' ? styles.light : ''}`}>
        <ol>
          {items.map((c, i) => {
            const last = i === items.length - 1;
            return (
              <li key={c.href}>
                {last ? (
                  <span aria-current="page">{c.name}</span>
                ) : (
                  <>
                    <Link href={c.href}>{c.name}</Link>
                    <Icon name="chevron-right" size={14} className={styles.sep} />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbLd(items))} />
    </>
  );
}
