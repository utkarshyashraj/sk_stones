'use client';

import Link from 'next/link';
import { memo } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Picture } from '@/components/ui/Picture';
import { useShortlist, type ShortlistItem } from '@/components/shortlist/shortlist-store';
import { enquireHref } from '@/lib/enquiry';
import { imageUrl, pickWidth } from '@/lib/image-url';
import type { ClientProduct } from '@/lib/types';
import styles from './ProductCard.module.css';

export const toShortlistItem = (p: ClientProduct, collectionName: string): ShortlistItem => ({
  id: p.id,
  name: p.name,
  collectionName,
  thumb: p.img ? imageUrl(p.img.key, pickWidth(p.img, 200)) : null,
});

interface Props {
  product: ClientProduct;
  collectionName: string;
  showCollection: boolean;
  onQuickView: () => void;
  priority?: boolean;
}

function ProductCardImpl({ product: p, collectionName, showCollection, onQuickView, priority }: Props) {
  const { has, toggle } = useShortlist();
  const saved = has(p.id);

  return (
    <article className={styles.card}>
      <button
        type="button"
        className={styles.media}
        onClick={onQuickView}
        aria-label={`Quick view: ${p.name}`}
        aria-haspopup="dialog"
      >
        {p.img ? (
          <Picture
            image={p.img}
            alt=""
            sizes="(min-width: 1280px) 280px, (min-width: 1024px) 23vw, (min-width: 640px) 31vw, 46vw"
            priority={priority}
            preloadHint={false}
            fill
          />
        ) : (
          <span className={styles.noPhoto} aria-hidden="true">
            <Icon name="image" size={28} />
            <span>Photo on request</span>
          </span>
        )}
        <span className={styles.quick} aria-hidden="true">
          <Icon name="expand" size={16} />
        </span>
      </button>
      <div className={styles.body}>
        <h3 className={styles.name}>{p.name}</h3>
        {showCollection ? <p className={styles.collection}>{collectionName}</p> : null}
        <div className={styles.actions}>
          <Link
            href={enquireHref(p, collectionName)}
            className={`btn btn--outline btn--sm ${styles.enquire}`}
            prefetch={false}
          >
            Enquire<span className="visually-hidden"> about {p.name}</span>
          </Link>
          <button
            type="button"
            className={styles.save}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${p.name} from shortlist` : `Add ${p.name} to shortlist`}
            onClick={() => toggle(toShortlistItem(p, collectionName))}
          >
            <Icon name={saved ? 'check' : 'bookmark'} size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}

export const ProductCard = memo(ProductCardImpl);
