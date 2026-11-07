'use client';

import { useId, useState } from 'react';
import { Fa } from './Fa';

/** Reference FAQ accordion: one answer open at a time; the question button carries aria-expanded. */
export function FAQAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const id = useId();
  return (
    <div className="faq-list">
      {items.map((it, i) => (
        <div key={it.q} className={`faq-item${open === i ? ' open' : ''}`}>
          <button
            className="faq-question"
            type="button"
            aria-expanded={open === i}
            aria-controls={`${id}-${i}`}
            onClick={() => setOpen((o) => (o === i ? null : i))}
          >
            {it.q}
            <Fa name="chevron-down" />
          </button>
          <div className="faq-answer" id={`${id}-${i}`} role="region" aria-hidden={open !== i}>
            <p>{it.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
