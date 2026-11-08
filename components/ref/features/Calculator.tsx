'use client';

import { useRouter } from 'next/navigation';
import { useId, useRef, useState } from 'react';
import { track } from '@/lib/analytics';
import {
  DEFAULT_WASTAGE,
  MAX_WASTAGE,
  quantityText,
  roundSqFt,
  roundSqM,
  totalArea,
  type AreaRow,
  type LengthUnit,
} from '@/lib/area-calc';
import { Icon } from './Icon';
import { useDialog } from './useDialog';

type Row = AreaRow & { key: number };

/** Put the result into the quote form on this page (the calculator was opened from it). */
function fillForm(text: string): boolean {
  const qty = document.querySelector<HTMLInputElement>('#contactForm #quantity');
  if (!qty) return false;
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  setter?.call(qty, text);
  qty.dispatchEvent(new Event('input', { bubbles: true }));
  // The form's unit select belongs to Size; switch it to square feet only when no size was entered.
  const size = document.querySelector<HTMLInputElement>('#contactForm #size');
  const unit = document.querySelector<HTMLSelectElement>('#contactForm #sizeUnit');
  if (unit && !size?.value.trim()) unit.value = 'sqft';
  qty.focus();
  return true;
}

/**
 * Area / quantity calculator. Opened from the quote form ("Not sure? Calculate"), product pages and the
 * saved list. Several areas (length × width in feet or metres) plus a wastage allowance; the total shows in
 * square feet and square metres. "Use this in my quote" fills the form's Quantity (and its unit when Size
 * is empty) — directly when opened from the form, otherwise by opening the form with ?qty=.
 */
export function Calculator({
  onClose,
  detail,
}: {
  onClose: () => void;
  /** to=form: fill the form on this page; saved=1: open the form with the saved list */
  detail?: Record<string, string>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { leaveVia } = useDialog(ref, true, onClose, { backCloses: true });
  const router = useRouter();
  const uid = useId();
  const nextKey = useRef(1);
  const [rows, setRows] = useState<Row[]>([{ key: 0, length: '', width: '', unit: 'ft' }]);
  const [wastage, setWastage] = useState(String(DEFAULT_WASTAGE));
  const result = totalArea(rows, Number(wastage || 0));
  const ready = result.counted > 0;

  const update = (key: number, patch: Partial<AreaRow>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const add = () => {
    const key = nextKey.current++;
    setRows((rs) => [...rs, { key, length: '', width: '', unit: rs.at(-1)?.unit ?? 'ft' }]);
    requestAnimationFrame(() =>
      ref.current?.querySelector<HTMLInputElement>(`[data-row="${key}"] input`)?.focus(),
    );
  };
  const remove = (key: number) => setRows((rs) => rs.filter((r) => r.key !== key));

  const use = () => {
    const text = quantityText(result);
    const target = detail?.to === 'form' ? 'form' : detail?.saved === '1' ? 'saved' : 'page';
    track('calculator_used', { areas: result.counted, target });
    if (target === 'form') {
      onClose();
      requestAnimationFrame(() => fillForm(text));
      return;
    }
    const q = new URLSearchParams();
    if (target === 'saved') q.set('saved', '1');
    if (detail?.stone) q.set('stone', detail.stone);
    q.set('qty', text);
    leaveVia();
    router.replace(`/contact?${q.toString()}`);
    onClose();
  };

  return (
    <>
      <div className="sk-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        className="sk-panel sk-panel--calc"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
      >
        <div className="sk-panel-handle" aria-hidden="true" />
        <div className="sk-panel-head">
          <h2 id={`${uid}-title`}>How much stone do I need?</h2>
          <button type="button" className="sk-icon-btn" aria-label="Close calculator" onClick={onClose}>
            <Icon name="times" />
          </button>
        </div>
        <div className="sk-panel-body sk-calc">
          <p className="sk-muted">
            Add each floor, wall or counter as length × width. We&apos;ll add a little extra for cuts.
          </p>
          <ol className="sk-calc-rows">
            {rows.map((r, i) => {
              const n = i + 1;
              return (
                <li key={r.key} data-row={r.key}>
                  <fieldset>
                    <legend>Area {n}</legend>
                    <label>
                      <span>Length</span>
                      <input
                        inputMode="decimal"
                        autoComplete="off"
                        value={r.length}
                        onChange={(e) => update(r.key, { length: e.target.value })}
                        aria-label={`Area ${n} length`}
                      />
                    </label>
                    <span aria-hidden="true" className="sk-calc-x">
                      ×
                    </span>
                    <label>
                      <span>Width</span>
                      <input
                        inputMode="decimal"
                        autoComplete="off"
                        value={r.width}
                        onChange={(e) => update(r.key, { width: e.target.value })}
                        aria-label={`Area ${n} width`}
                      />
                    </label>
                    <label>
                      <span>Unit</span>
                      <select
                        value={r.unit}
                        onChange={(e) => update(r.key, { unit: e.target.value as LengthUnit })}
                        aria-label={`Area ${n} unit`}
                      >
                        <option value="ft">ft</option>
                        <option value="m">m</option>
                      </select>
                    </label>
                    {rows.length > 1 ? (
                      <button
                        type="button"
                        className="sk-icon-btn"
                        aria-label={`Remove area ${n}`}
                        onClick={() => remove(r.key)}
                      >
                        <Icon name="trash" />
                      </button>
                    ) : null}
                  </fieldset>
                </li>
              );
            })}
          </ol>
          <button type="button" className="sk-link-btn" onClick={add} disabled={rows.length >= 20}>
            + Add another area
          </button>
          <label className="sk-calc-wastage">
            <span>Extra for cuts and breakage (%)</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={MAX_WASTAGE}
              step={1}
              value={wastage}
              onChange={(e) => setWastage(e.target.value)}
            />
          </label>
          <div className="sk-calc-result" aria-live="polite">
            {ready ? (
              <>
                <p>
                  <strong>{roundSqFt(result.sqFt).toLocaleString('en-IN')} sq ft</strong>
                  <span> · {roundSqM(result.sqM).toFixed(1)} sq m</span>
                </p>
                <p className="sk-muted">
                  {result.counted} {result.counted === 1 ? 'area' : 'areas'}
                  {result.wastagePct ? `, including ${result.wastagePct}% extra` : ''}. An estimate — please
                  confirm quantities with us before ordering.
                </p>
              </>
            ) : (
              <p className="sk-muted">Enter a length and width to see the total.</p>
            )}
          </div>
        </div>
        <div className="sk-panel-foot">
          <button type="button" className="sk-btn sk-btn--gold sk-btn--block" disabled={!ready} onClick={use}>
            Use this in my quote
          </button>
        </div>
      </div>
    </>
  );
}
