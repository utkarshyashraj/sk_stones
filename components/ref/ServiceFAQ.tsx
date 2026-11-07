'use client';

import { useState } from 'react';
import { Fa } from './Fa';

/** Service-page FAQ (reference markup): each question toggles its own answer; several can be open. */
export function ServiceFAQ({ items }: { items: readonly { q: string; a: string }[] }) {
  const [open, setOpen] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  return (
    <div className="faq-list">
      {items.map((it, i) => (
        <div key={it.q} className={`faq-item${open.has(i) ? ' active' : ''}`}>
          {/* A div in the reference (its CSS targets div.faq-question); given button semantics here. */}
          <div
            className="faq-question"
            role="button"
            tabIndex={0}
            aria-expanded={open.has(i)}
            onClick={() => toggle(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle(i);
              }
            }}
          >
            <h4>{it.q}</h4>
            <Fa name="chevron-down" />
          </div>
          <div className="faq-answer">
            <p>{it.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
