'use client';

import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { useModalDialog } from '@/components/ui/useModalDialog';
import { shortlistEnquiryHref, shortlistWhatsappHref } from '@/lib/enquiry';
import { setShortlistOpen, useShortlist, useShortlistOpen } from './shortlist-store';
import styles from './ShortlistDrawer.module.css';

export function ShortlistDrawer() {
  const open = useShortlistOpen();
  const close = () => setShortlistOpen(false);
  const ref = useModalDialog(open, close);
  const { items, remove, clear } = useShortlist();

  return (
    <dialog ref={ref} className={styles.drawer} aria-labelledby="shortlist-title">
      <div className={styles.head}>
        <h2 id="shortlist-title" className={styles.title}>
          Your shortlist <span className={styles.count}>({items.length})</span>
        </h2>
        <button type="button" className={styles.close} onClick={close} aria-label="Close shortlist">
          <Icon name="close" size={22} />
        </button>
      </div>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <Icon name="bookmark" size={36} />
          <p>No stones shortlisted yet.</p>
          <p className={styles.emptyHint}>
            Tap the bookmark on any stone to save it here, then request one quote for all of them.
          </p>
          <Link href="/products" className="btn btn--primary" onClick={close}>
            Browse stones
          </Link>
        </div>
      ) : (
        <>
          <ul className={styles.list}>
            {items.map((it) => (
              <li key={it.id} className={styles.item}>
                {it.thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element -- pre-optimised thumbnail
                  <img src={it.thumb} alt="" width={64} height={64} loading="lazy" />
                ) : (
                  <span className={styles.noThumb} aria-hidden="true">
                    <Icon name="image" />
                  </span>
                )}
                <span className={styles.itemText}>
                  <span className={styles.itemName}>{it.name}</span>
                  <span className={styles.itemMeta}>{it.collectionName}</span>
                </span>
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => remove(it.id)}
                  aria-label={`Remove ${it.name} from shortlist`}
                >
                  <Icon name="close" size={18} />
                </button>
              </li>
            ))}
          </ul>
          <div className={styles.footer}>
            <Link href={shortlistEnquiryHref} className="btn btn--primary btn--block" onClick={close}>
              <Icon name="send" /> Request a quote for {items.length}{' '}
              {items.length === 1 ? 'stone' : 'stones'}
            </Link>
            <a
              className="btn btn--whatsapp btn--block"
              href={shortlistWhatsappHref(items.map((i) => `${i.name} (${i.collectionName})`))}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="whatsapp" /> Send list on WhatsApp
            </a>
            <button type="button" className={styles.clear} onClick={clear}>
              <Icon name="trash" size={16} /> Clear shortlist
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}
