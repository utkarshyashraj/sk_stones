/**
 * Area / quantity calculator: pure functions, unit-tested (tests/unit/area-calc.test.ts).
 * Rooms or surfaces are entered as length × width in feet or metres; the total gets a wastage allowance
 * for cuts and breakage (10% by default) and is shown in both square feet and square metres.
 */

export type LengthUnit = 'ft' | 'm';
export interface AreaRow {
  length: string;
  width: string;
  unit: LengthUnit;
}
export interface AreaResult {
  /** total before wastage, sq ft */
  netSqFt: number;
  /** total including wastage */
  sqFt: number;
  sqM: number;
  wastagePct: number;
  /** rows that had two valid dimensions */
  counted: number;
}

export const SQFT_PER_SQM = 10.763910416709722; // 1 m = 3.28084 ft, squared
export const DEFAULT_WASTAGE = 10;
export const MAX_WASTAGE = 50;

/** "12", "12.5", "12,5" → number; blank, negative or nonsense → null. */
export function parseDim(v: string): number | null {
  const s = v.trim().replace(',', '.');
  if (!/^\d*\.?\d+$/.test(s)) return null;
  const n = Number(s);
  return n > 0 && n < 100000 ? n : null;
}

export function rowSqFt(row: AreaRow): number | null {
  const l = parseDim(row.length);
  const w = parseDim(row.width);
  if (l === null || w === null) return null;
  const a = l * w;
  return row.unit === 'm' ? a * SQFT_PER_SQM : a;
}

export function clampWastage(pct: number): number {
  if (!Number.isFinite(pct) || pct < 0) return 0;
  return Math.min(pct, MAX_WASTAGE);
}

export function totalArea(rows: AreaRow[], wastagePct = DEFAULT_WASTAGE): AreaResult {
  const w = clampWastage(wastagePct);
  let net = 0;
  let counted = 0;
  for (const r of rows) {
    const a = rowSqFt(r);
    if (a !== null) {
      net += a;
      counted++;
    }
  }
  const sqFt = net * (1 + w / 100);
  return { netSqFt: net, sqFt, sqM: sqFt / SQFT_PER_SQM, wastagePct: w, counted };
}

/** Square feet are rounded up to a whole number (you can't order part of one); square metres to 0.1. */
export const roundSqFt = (n: number) => Math.ceil(n - 1e-9);
export const roundSqM = (n: number) => Math.ceil(n * 10 - 1e-9) / 10;

/** Text that goes into the quote form's Quantity field. */
export function quantityText(r: AreaResult): string {
  const base = `${roundSqFt(r.sqFt)} sq ft (${roundSqM(r.sqM).toFixed(1)} sq m)`;
  return r.wastagePct ? `${base} incl. ${r.wastagePct}% wastage` : base;
}
