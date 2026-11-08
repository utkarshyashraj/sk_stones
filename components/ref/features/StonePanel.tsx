'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import type { LightboxItem, StoneDetail } from '@/lib/lightbox-items';
import { Icon } from './Icon';
import { SaveButton } from './SaveButton';

const list = (v: string[]) => v.join(', ');

/** Detail rows that exist for this stone, in reading order; empty fields are left out entirely. */
export function detailRows(d: StoneDetail | undefined): { label: string; value: React.ReactNode }[] {
  if (!d) return [];
  const rows: { label: string; value: React.ReactNode }[] = [];
  if (d.colours.length)
    rows.push({ label: d.colours.length > 1 ? 'Colours' : 'Colour', value: list(d.colours) });
  if (d.finishes.length)
    rows.push({ label: d.finishes.length > 1 ? 'Finishes' : 'Finish', value: list(d.finishes) });
  if (d.applications.length) rows.push({ label: 'Suitable for', value: list(d.applications) });
  if (d.origin) rows.push({ label: 'Origin', value: d.origin });
  if (d.thicknessesMm.length) rows.push({ label: 'Thickness', value: `${d.thicknessesMm.join(', ')} mm` });
  if (d.formats.length) rows.push({ label: d.formats.length > 1 ? 'Sizes' : 'Size', value: list(d.formats) });
  if (d.usedInProjects.length)
    rows.push({
      label: 'Used in',
      value: d.usedInProjects.map((p, i) => (
        <span key={p.id}>
          {i ? ', ' : ''}
          <Link href={`/projects#${p.id}`} prefetch={false}>
            {p.name}
          </Link>
        </span>
      )),
    });
  return rows;
}

/**
 * The viewer's caption, extended into a compact stone panel: name, collection, position; for stones the
 * facts we have (each row only when it exists), Save, "Enquire about this stone", and up to six related
 * stones from the same collection (a scrollable strip that switches the photo). On phones the details and
 * related strip fold away behind "Details" so the photo stays large.
 */
export function StonePanel({
  item,
  pos,
  total,
  related,
  onJump,
}: {
  item: LightboxItem;
  pos: number;
  total: number;
  related: LightboxItem[];
  onJump: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const uid = useId();
  const rows = detailRows(item.d);
  const more = related.slice(0, 6);
  const hasMore = Boolean(item.id && (rows.length || more.length));
  return (
    <div className={`product-lightbox-meta sk-lb-panel${open ? ' is-open' : ''}`}>
      <p className="product-lightbox-title">{item.alt}</p>
      {item.cn ? <p className="sk-lb-collection">{item.cn}</p> : null}
      <p className="product-lightbox-counter">{`${pos + 1} / ${total}`}</p>
      {item.id ? (
        <>
          <div className="sk-lb-actions">
            <SaveButton id={item.id} name={item.alt} where="lightbox" />
            <Link className="sk-btn sk-btn--gold" href={`/contact?stone=${item.id}`} prefetch={false}>
              Enquire about this stone
            </Link>
          </div>
          <Link className="sk-lb-sample" href={`/contact?stone=${item.id}&request=samples`} prefetch={false}>
            Request a sample
          </Link>
          {hasMore ? (
            <button
              type="button"
              className="sk-lb-toggle"
              aria-expanded={open}
              aria-controls={`${uid}-more`}
              onClick={() => setOpen((o) => !o)}
            >
              Details <Icon name="chevron-down" />
            </button>
          ) : null}
          {hasMore ? (
            <div className="sk-lb-more" id={`${uid}-more`}>
              {rows.length ? (
                <dl className="sk-lb-details">
                  {rows.map((r) => (
                    <div key={r.label}>
                      <dt>{r.label}</dt>
                      <dd>{r.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              {more.length ? (
                <div className="sk-lb-related">
                  <p className="sk-lb-related-title" id={`${uid}-rel`}>
                    More from {item.cn}
                  </p>
                  <ul aria-labelledby={`${uid}-rel`}>
                    {more.map((r) => (
                      <li key={r.id}>
                        <button type="button" onClick={() => onJump(r.id!)} aria-label={`Show ${r.alt}`}>
                          {r.thumb ? (
                            // eslint-disable-next-line @next/next/no-img-element -- pre-optimised thumbnail
                            <img src={r.thumb} alt="" width={64} height={64} loading="lazy" />
                          ) : null}
                          <span>{r.alt}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
      <p className="product-lightbox-hint">Hover or touch the image to magnify</p>
    </div>
  );
}
