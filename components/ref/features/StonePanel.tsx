'use client';

import Link from 'next/link';
import type { LightboxItem } from '@/lib/lightbox-items';
import { SaveButton } from './SaveButton';

/** Caption under the viewer's photo: name, collection, position, and for stones Save + Enquire. */
export function StonePanel({
  item,
  pos,
  total,
}: {
  item: LightboxItem;
  pos: number;
  total: number;
  related: LightboxItem[];
  onJump: (id: string) => void;
}) {
  return (
    <div className="product-lightbox-meta sk-lb-panel">
      <p className="product-lightbox-title">{item.alt}</p>
      {item.cn ? <p className="sk-lb-collection">{item.cn}</p> : null}
      <p className="product-lightbox-counter">{`${pos + 1} / ${total}`}</p>
      {item.id ? (
        <div className="sk-lb-actions">
          <SaveButton id={item.id} name={item.alt} where="lightbox" />
          <Link className="sk-btn sk-btn--gold" href={`/contact?stone=${item.id}`} prefetch={false}>
            Enquire about this stone
          </Link>
        </div>
      ) : null}
      <p className="product-lightbox-hint">Hover or touch the image to magnify</p>
    </div>
  );
}
