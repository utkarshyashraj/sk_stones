import { Icon } from '@/components/ui/Icon';
import type { Faq } from '@/content/pages';
import { faqLd, jsonLdScript } from '@/lib/seo';
import styles from './FAQ.module.css';

/** Native <details>/<summary> accordion: keyboard and screen-reader accessible, works without JavaScript. */
export function FAQ({ items, structuredData = true }: { items: Faq[]; structuredData?: boolean }) {
  return (
    <>
      <div className={styles.list}>
        {items.map((f, i) => (
          <details key={f.q} className={styles.item} open={i === 0}>
            <summary className={styles.q}>
              <span>{f.q}</span>
              <Icon name="plus" className={styles.icon} />
            </summary>
            <p className={styles.a}>{f.a}</p>
          </details>
        ))}
      </div>
      {structuredData ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faqLd(items))} />
      ) : null}
    </>
  );
}
