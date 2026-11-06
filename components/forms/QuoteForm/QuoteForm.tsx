'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useIsClient, useSearchString } from '@/components/ui/useLocation';
import { Icon } from '@/components/ui/Icon';
import { useShortlist } from '@/components/shortlist/shortlist-store';
import { absoluteUrl, site, whatsappHref } from '@/lib/site';
import styles from './QuoteForm.module.css';

const STONE_OPTIONS = [
  'Marbles',
  'Granites',
  'Natural Stones',
  'Engineered Surfaces (Quartz / Acrylic)',
  'Wall Claddings',
  'Tiles',
  'Stone Art',
  'Clay Products',
  'Concrete Blocks',
  'Landscaping',
  'Installation only',
  'Not sure yet',
];
const APPLICATIONS = [
  'Flooring',
  'Wall cladding',
  'Kitchen countertop',
  'Bathroom',
  'Staircase',
  'Facade / elevation',
  'Outdoor paving / landscaping',
  'Roofing / terrace',
  'Stone art / feature wall',
  'Other',
];

const INITIAL = {
  name: '',
  phone: '',
  stone: '',
  city: '',
  email: '',
  quantity: '',
  quantityUnit: 'sq ft',
  thickness: '',
  thicknessUnit: 'mm',
  size: '',
  sizeUnit: 'ft',
  application: '',
  budget: '',
  requirements: '',
};
type Values = typeof INITIAL;
type Field = keyof Values;
type Errors = Partial<Record<string, string>>;
const STEP1 = ['name', 'phone', 'stone'] as const;

function validate(v: Values, fields: readonly string[]): Errors {
  const e: Errors = {};
  if (fields.includes('name') && v.name.trim().length < 2) e.name = 'Please enter your name.';
  if (fields.includes('phone')) {
    const digits = v.phone.replace(/\D/g, '');
    if (!digits) e.phone = 'Please enter a phone number so we can reach you.';
    else if (digits.length < 10 || digits.length > 13)
      e.phone = 'Enter a valid phone number (10 digits, optionally with country code).';
  }
  if (fields.includes('stone') && !v.stone.trim())
    e.stone = 'Tell us which stone or product you are interested in.';
  if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))
    e.email = 'Enter a valid email address, or leave it blank.';
  return e;
}

const LABELS: Record<string, string> = {
  name: 'Name',
  phone: 'Phone',
  stone: 'Stone of interest',
  email: 'Email',
};

export function QuoteForm() {
  const uid = useId();
  const { items: shortlist } = useShortlist();
  const enhanced = useIsClient();
  const [step, setStep] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [fields, setFields] = useState<Values>(INITIAL);
  /** null until the visitor edits the stone field; until then it shows the prefill. */
  const [stoneEdit, setStoneEdit] = useState<string | null>(null);
  const startedAt = useRef<number>(0);
  const summaryRef = useRef<HTMLDivElement>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  // Prefill from "Enquire about this stone" (?stone=&name=) or from the shortlist (?from=shortlist).
  // Derived from the URL store (not useSearchParams) so the whole form is pre-rendered for no-JS users.
  const search = useSearchString();
  const prefill = useMemo(() => {
    const params = new URLSearchParams(search);
    if (params.get('from') === 'shortlist' && shortlist.length)
      return {
        stone: shortlist.map((x) => x.name + ' (' + x.collectionName + ')').join('; '),
        products: shortlist.map((x) => x.id).join(', '),
      };
    const name = params.get('name');
    return name ? { stone: name, products: params.get('stone') ?? '' } : { stone: '', products: '' };
  }, [search, shortlist]);
  const values: Values = { ...fields, stone: stoneEdit ?? prefill.stone };
  const products = prefill.products;

  const set =
    (k: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      if (k === 'stone') setStoneEdit(value);
      else setFields((v) => ({ ...v, [k]: value }));
      if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
    };

  const focusFirstError = (errs: Errors) => {
    const first = Object.keys(errs)[0];
    if (first) {
      summaryRef.current?.focus();
    }
  };

  const next = () => {
    const errs = validate(values, STEP1);
    setErrors(errs);
    if (Object.keys(errs).length) return focusFirstError(errs);
    setStep(2);
    requestAnimationFrame(() => stepHeadingRef.current?.focus());
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!enhanced) return; // native POST
    const honey = (e.currentTarget.elements.namedItem('_honey') as HTMLInputElement | null)?.value;
    const errs = validate(values, STEP1);
    if (Object.keys(errs).length) {
      e.preventDefault();
      setErrors(errs);
      setStep(1);
      requestAnimationFrame(() => focusFirstError(errs));
      return;
    }
    // Bot heuristics: filled honeypot or a submit faster than a human can type.
    if (honey || Date.now() - startedAt.current < 2500) {
      e.preventDefault();
      return;
    }
    setSubmitting(true);
  };

  const err = (k: string) =>
    errors[k] ? (
      <p id={`${uid}-${k}-error`} className={styles.error}>
        <Icon name="close" size={14} /> {errors[k]}
      </p>
    ) : null;
  const a11y = (k: string, hint?: boolean) => ({
    id: `${uid}-${k}`,
    'aria-invalid': errors[k] ? true : undefined,
    'aria-describedby':
      [errors[k] ? `${uid}-${k}-error` : '', hint ? `${uid}-${k}-hint` : ''].filter(Boolean).join(' ') ||
      undefined,
  });

  const whatsappMessage = () =>
    [
      'Hi S K Stones India, I would like a quote.',
      values.name && `Name: ${values.name}`,
      values.stone && `Stone: ${values.stone}`,
      values.city && `City/site: ${values.city}`,
      values.quantity && `Quantity: ${values.quantity} ${values.quantityUnit}`,
      values.thickness && `Thickness: ${values.thickness} ${values.thicknessUnit}`,
      values.size && `Size: ${values.size} ${values.sizeUnit}`,
      values.application && `Application: ${values.application}`,
      values.requirements && `Notes: ${values.requirements}`,
    ]
      .filter(Boolean)
      .join('\n');

  const errorList = Object.entries(errors).filter(([, m]) => m);
  const showStep1 = !enhanced || step === 1;
  const showStep2 = !enhanced || step === 2;

  return (
    <form
      action={site.form.action}
      method="POST"
      className={styles.form}
      noValidate={enhanced}
      onSubmit={onSubmit}
      aria-labelledby={`${uid}-title`}
    >
      <div className={styles.head}>
        <h2 id={`${uid}-title`} className={styles.title}>
          Request a free quote
        </h2>
        <p className={styles.sub}>We reply within 24 hours on business days.</p>
        {enhanced ? (
          <ol className={styles.progress} aria-label="Form progress">
            <li aria-current={step === 1 ? 'step' : undefined} className={step >= 1 ? styles.done : ''}>
              <span>1</span> Your details
            </li>
            <li aria-current={step === 2 ? 'step' : undefined} className={step === 2 ? styles.done : ''}>
              <span>2</span> Project details <em>(optional)</em>
            </li>
          </ol>
        ) : null}
      </div>

      <div ref={summaryRef} tabIndex={-1} className={styles.summary} role="alert" hidden={!errorList.length}>
        <p>Please fix the following:</p>
        <ul>
          {errorList.map(([k, m]) => (
            <li key={k}>
              <a href={`#${uid}-${k}`}>
                {LABELS[k] ?? k}: {m}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* FormSubmit configuration (relay emails submissions to the business inbox; reCAPTCHA + honeypot spam protection). */}
      <input
        type="hidden"
        name="_subject"
        value={`Quote request: ${values.stone || 'S K Stones India website'}`}
      />
      <input type="hidden" name="_template" value="table" />
      <input type="hidden" name="_captcha" value="true" />
      <input type="hidden" name="_next" value={absoluteUrl(site.form.thankYouPath)} />
      <input type="hidden" name="products" value={products} />
      <div className={styles.honey} aria-hidden="true">
        <label htmlFor={`${uid}-honey`}>Leave this field empty</label>
        <input id={`${uid}-honey`} type="text" name="_honey" tabIndex={-1} autoComplete="off" />
      </div>

      <fieldset className={styles.step} hidden={!showStep1}>
        <legend className="visually-hidden">Step 1: your details</legend>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label htmlFor={`${uid}-name`}>
              Name <span className={styles.req}>*</span>
            </label>
            <input
              {...a11y('name')}
              name="name"
              type="text"
              autoComplete="name"
              required
              value={values.name}
              onChange={set('name')}
            />
            {err('name')}
          </div>
          <div className={styles.field}>
            <label htmlFor={`${uid}-phone`}>
              Phone <span className={styles.req}>*</span>
            </label>
            <input
              {...a11y('phone', true)}
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={values.phone}
              onChange={set('phone')}
            />
            <p id={`${uid}-phone-hint`} className={styles.hint}>
              We&apos;ll call or WhatsApp you on this number.
            </p>
            {err('phone')}
          </div>
          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor={`${uid}-stone`}>
              Stone of interest <span className={styles.req}>*</span>
            </label>
            <input
              {...a11y('stone', true)}
              name="stone"
              type="text"
              list={`${uid}-stones`}
              required
              value={values.stone}
              onChange={set('stone')}
              placeholder="e.g. Kashmir White granite, Italian marble…"
            />
            <datalist id={`${uid}-stones`}>
              {STONE_OPTIONS.map((o) => (
                <option key={o} value={o} />
              ))}
            </datalist>
            <p id={`${uid}-stone-hint`} className={styles.hint}>
              Type a stone name or pick a category. Shortlisted stones are added automatically.
            </p>
            {err('stone')}
          </div>
          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor={`${uid}-city`}>
              City / site location <span className={styles.opt}>(optional)</span>
            </label>
            <input
              {...a11y('city')}
              name="city"
              type="text"
              autoComplete="address-level2"
              value={values.city}
              onChange={set('city')}
              placeholder="e.g. Koramangala, Bengaluru"
            />
          </div>
        </div>
        {enhanced ? (
          <div className={styles.actions}>
            <button type="button" className="btn btn--primary" onClick={next}>
              Continue
            </button>
            <button
              type="submit"
              className={styles.skip}
              onClick={(e) => {
                if (Object.keys(validate(values, STEP1)).length) {
                  e.preventDefault();
                  next();
                }
              }}
            >
              Skip details and send now
            </button>
          </div>
        ) : null}
      </fieldset>

      <fieldset className={styles.step} hidden={!showStep2}>
        <legend className="visually-hidden">Step 2: project details (optional)</legend>
        {enhanced ? (
          <h3 ref={stepHeadingRef} tabIndex={-1} className={styles.stepTitle}>
            A few project details <span>(all optional — they help us quote accurately)</span>
          </h3>
        ) : null}
        <div className={styles.grid}>
          <div className={styles.field}>
            <label htmlFor={`${uid}-email`}>
              Email <span className={styles.opt}>(optional)</span>
            </label>
            <input
              {...a11y('email')}
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={set('email')}
            />
            {err('email')}
          </div>
          <div className={styles.field}>
            <label htmlFor={`${uid}-application`}>Site / application</label>
            <select
              {...a11y('application')}
              name="application"
              value={values.application}
              onChange={set('application')}
            >
              <option value="">Select…</option>
              {APPLICATIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor={`${uid}-quantity`}>Quantity</label>
            <div className={styles.unitRow}>
              <input
                {...a11y('quantity')}
                name="quantity"
                type="text"
                inputMode="decimal"
                value={values.quantity}
                onChange={set('quantity')}
              />
              <label htmlFor={`${uid}-quantityUnit`} className="visually-hidden">
                Quantity unit
              </label>
              <select
                id={`${uid}-quantityUnit`}
                name="quantityUnit"
                value={values.quantityUnit}
                onChange={set('quantityUnit')}
              >
                <option>sq ft</option>
                <option>sq m</option>
                <option>pieces</option>
                <option>slabs</option>
              </select>
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor={`${uid}-thickness`}>Thickness</label>
            <div className={styles.unitRow}>
              <input
                {...a11y('thickness')}
                name="thickness"
                type="text"
                inputMode="decimal"
                value={values.thickness}
                onChange={set('thickness')}
              />
              <label htmlFor={`${uid}-thicknessUnit`} className="visually-hidden">
                Thickness unit
              </label>
              <select
                id={`${uid}-thicknessUnit`}
                name="thicknessUnit"
                value={values.thicknessUnit}
                onChange={set('thicknessUnit')}
              >
                <option value="mm">mm</option>
                <option value="cm">cm</option>
                <option value="in">in</option>
              </select>
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor={`${uid}-size`}>Dimensions / size</label>
            <div className={styles.unitRow}>
              <input
                {...a11y('size')}
                name="size"
                type="text"
                value={values.size}
                onChange={set('size')}
                placeholder="e.g. 2 × 4"
              />
              <label htmlFor={`${uid}-sizeUnit`} className="visually-hidden">
                Size unit
              </label>
              <select
                id={`${uid}-sizeUnit`}
                name="sizeUnit"
                value={values.sizeUnit}
                onChange={set('sizeUnit')}
              >
                <option value="ft">ft</option>
                <option value="mm">mm</option>
                <option value="cm">cm</option>
                <option value="in">in</option>
              </select>
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor={`${uid}-budget`}>Project size / budget</label>
            <input
              {...a11y('budget')}
              name="budget"
              type="text"
              value={values.budget}
              onChange={set('budget')}
            />
          </div>
          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor={`${uid}-requirements`}>Additional requirements</label>
            <textarea
              {...a11y('requirements')}
              name="requirements"
              rows={4}
              value={values.requirements}
              onChange={set('requirements')}
              placeholder="Supply only or supply + installation, timeline, finish preferences, showroom visit date…"
            />
          </div>
        </div>
        <div className={styles.actions}>
          {enhanced ? (
            <button type="button" className="btn btn--outline" onClick={() => setStep(1)}>
              Back
            </button>
          ) : null}
          <button type="submit" className="btn btn--primary" disabled={submitting} aria-disabled={submitting}>
            {submitting ? 'Sending…' : 'Get my custom quote'}
          </button>
        </div>
      </fieldset>

      <div className={styles.alt}>
        <span>Prefer chat?</span>
        <a
          href={whatsappHref(whatsappMessage())}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--whatsapp btn--sm"
        >
          <Icon name="whatsapp" /> Send these details on WhatsApp
        </a>
      </div>
      <p className={styles.privacy}>
        Your details are only used to respond to this enquiry. Submissions are delivered to {site.email}; you
        may be asked to complete a quick “I’m not a robot” check.
      </p>
    </form>
  );
}
