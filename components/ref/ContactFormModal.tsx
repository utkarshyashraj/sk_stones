'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { absoluteUrl, site } from '@/lib/site';
import { Fa } from './Fa';
import { usePortalRoot, useSearchFlag } from './useClient';

const STONE_TYPES: [string, string][] = [
  ['granites', 'Granites'],
  ['marbles', 'Marbles'],
  ['natural-stones', 'Natural Stones'],
  ['engineered-surfaces', 'Engineered Surfaces'],
  ['wall-claddings', 'Wall Claddings'],
  ['tiles', 'Tiles'],
  ['stone-art', 'Stone Art'],
  ['landscaping', 'Landscaping'],
  ['installations', 'Installations'],
  ['other', 'Other'],
];

/**
 * The reference contact form, in its modal. "Open Form" on a city card opens it for that location
 * (sent as preferredLocation). Fields are validated by the browser (name, phone, email, stone type are
 * required), then posted to FormSubmit, which emails info@skstonesindia.com and redirects to /thank-you.
 * Escape, ✕ or a click outside closes it; focus moves to the first field and returns to the opener.
 * /contact?submitted=1 reopens it with the success banner, as on the reference.
 */
export function ContactFormModal() {
  const [picked, setPicked] = useState<string | null>(null); // city chosen with "Open Form"
  const [shown, setShown] = useState(false); // drives the CSS fade (class "active")
  const [dismissed, setDismissed] = useState(false);
  const success = useSearchFlag('submitted', '1'); // FormSubmit sends people back with ?submitted=1
  const root = usePortalRoot();
  const opener = useRef<HTMLElement | null>(null);
  const modal = useRef<HTMLDivElement>(null);
  const autoOpen = success && !dismissed;
  const location = picked ?? (autoOpen ? 'Bangalore' : null);

  const open = useCallback((city: string, from?: HTMLElement) => {
    opener.current = from ?? null;
    setPicked(city);
    requestAnimationFrame(() => setShown(true));
  }, []);
  const close = useCallback(() => {
    setShown(false);
    setDismissed(true);
    window.setTimeout(() => setPicked(null), 250);
    opener.current?.focus();
  }, []);

  useEffect(() => {
    const buttons = [...document.querySelectorAll<HTMLElement>('[data-open-form]')];
    const handlers = buttons.map((b) => {
      const h = () => open(b.dataset.location || 'Bangalore', b);
      b.addEventListener('click', h);
      return () => b.removeEventListener('click', h);
    });
    return () => handlers.forEach((f) => f());
  }, [open]);

  useEffect(() => {
    if (!location) return;
    const r = document.querySelector('[data-ref-root]');
    r?.classList.add('form-modal-open');
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    const t = window.setTimeout(() => modal.current?.querySelector<HTMLInputElement>('#name')?.focus(), 180);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab' && modal.current) {
        const f = [
          ...modal.current.querySelectorAll<HTMLElement>(
            'button, input:not([type=hidden]):not([name=_honey]), select',
          ),
        ];
        const i = f.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey ? i <= 0 : i === f.length - 1) {
          e.preventDefault();
          f[e.shiftKey ? f.length - 1 : 0]?.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      r?.classList.remove('form-modal-open');
      html.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [location, close]);

  if (!root) return null;
  return createPortal(
    <div
      ref={modal}
      className={`contact-form-modal${shown || (autoOpen && !picked) ? ' active' : ''}`}
      id="contactFormModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contactFormTitle"
      hidden={!location}
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div className="contact-form-modal-dialog contact-form-box">
        <button
          type="button"
          className="contact-form-modal-close"
          id="contactFormClose"
          aria-label="Close form"
          onClick={close}
        >
          &times;
        </button>
        <h2 id="contactFormTitle">Get in touch</h2>
        <p className="contact-form-location">
          Enquiry for: <strong id="formLocationLabel">{location ?? 'Bangalore'}</strong>
        </p>
        <div
          className={`form-success-banner${success ? ' visible' : ''}`}
          id="formSuccessBanner"
          role="status"
        >
          <Fa name="check-circle" />
          <span>
            Thank you! Your quote request was sent successfully. We&apos;ll respond within 24 hours.
          </span>
        </div>
        <form id="contactForm" action={site.form.action} method="POST">
          <input type="hidden" name="_subject" value="Custom Quote Request - S K Stones India" />
          <input type="hidden" name="_template" value="table" />
          <input type="hidden" name="_captcha" value="false" />
          <input
            type="text"
            name="_honey"
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />
          <input type="hidden" name="_next" id="formNextUrl" value={absoluteUrl(site.form.thankYouPath)} />
          <input
            type="hidden"
            name="preferredLocation"
            id="preferredLocation"
            value={location ?? 'Bangalore'}
          />
          <div className="form-row two-col">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" placeholder="Name" autoComplete="name" required />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Phone Number"
                autoComplete="tel"
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" placeholder="Email" autoComplete="email" required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="stoneType">Stone Type Interested</label>
              <select id="stoneType" name="stoneType" required defaultValue="">
                <option value="" disabled>
                  Stone Type Interested
                </option>
                {STONE_TYPES.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="siteLocation">Site Location And Address</label>
              <input
                type="text"
                id="siteLocation"
                name="siteLocation"
                placeholder="Site Location And Address"
              />
            </div>
          </div>
          <div className="form-row two-col">
            <div className="form-group">
              <label htmlFor="quantity">Quantity</label>
              <input type="text" id="quantity" name="quantity" placeholder="Quantity" />
            </div>
            <div className="form-group">
              <label htmlFor="colour">Colour</label>
              <input type="text" id="colour" name="colour" placeholder="Colour" />
            </div>
          </div>
          <div className="form-row measure-row">
            <div className="form-group">
              <label className="measure-label" htmlFor="thickness">
                Thickness
              </label>
              <input type="text" id="thickness" name="thickness" placeholder="Thickness" />
            </div>
            <div className="form-group unit">
              <label className="measure-label" htmlFor="thicknessUnit">
                <span className="sr-only">Thickness unit</span>&nbsp;
              </label>
              <select id="thicknessUnit" name="thicknessUnit" defaultValue="mm">
                <option value="mm">MM</option>
                <option value="cm">CM</option>
                <option value="inch">IN</option>
              </select>
            </div>
            <div className="form-group">
              <label className="measure-label" htmlFor="size">
                Size
              </label>
              <input type="text" id="size" name="size" placeholder="Size" />
            </div>
            <div className="form-group unit">
              <label className="measure-label" htmlFor="sizeUnit">
                <span className="sr-only">Size unit</span>&nbsp;
              </label>
              <select id="sizeUnit" name="sizeUnit" defaultValue="mm">
                <option value="mm">MM</option>
                <option value="cm">CM</option>
                <option value="inch">IN</option>
                <option value="sqft">SQ FT</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="budget">Project Size / Budget (optional)</label>
              <input type="text" id="budget" name="budget" placeholder="Project Size / Budget (optional)" />
            </div>
          </div>
          <button type="submit" className="submit-btn">
            Get My Custom Quote
          </button>
        </form>
      </div>
    </div>,
    root,
  );
}
