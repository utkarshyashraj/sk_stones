import { describe, expect, it } from 'vitest';
import {
  clampWastage,
  parseDim,
  quantityText,
  roundSqFt,
  roundSqM,
  rowSqFt,
  SQFT_PER_SQM,
  totalArea,
} from '@/lib/area-calc';

describe('area calculator', () => {
  it('parses dimensions leniently and rejects nonsense', () => {
    expect(parseDim('12')).toBe(12);
    expect(parseDim(' 12.5 ')).toBe(12.5);
    expect(parseDim('12,5')).toBe(12.5);
    expect(parseDim('.5')).toBe(0.5);
    for (const bad of ['', '0', '-3', 'abc', '1e3', '12ft']) expect(parseDim(bad)).toBeNull();
  });

  it('computes one row in feet or metres', () => {
    expect(rowSqFt({ length: '10', width: '12', unit: 'ft' })).toBe(120);
    expect(rowSqFt({ length: '4', width: '5', unit: 'm' })).toBeCloseTo(20 * SQFT_PER_SQM, 6);
    expect(rowSqFt({ length: '4', width: '', unit: 'm' })).toBeNull();
  });

  it('adds rows, skips incomplete ones and applies wastage', () => {
    const r = totalArea(
      [
        { length: '10', width: '12', unit: 'ft' },
        { length: '5', width: '8', unit: 'ft' },
        { length: '3', width: '', unit: 'ft' },
      ],
      10,
    );
    expect(r.counted).toBe(2);
    expect(r.netSqFt).toBe(160);
    expect(r.sqFt).toBeCloseTo(176, 9);
    expect(r.sqM).toBeCloseTo(176 / SQFT_PER_SQM, 9);
  });

  it('mixes units correctly', () => {
    const r = totalArea(
      [
        { length: '1', width: '1', unit: 'm' },
        { length: '1', width: '1', unit: 'ft' },
      ],
      0,
    );
    expect(r.sqFt).toBeCloseTo(SQFT_PER_SQM + 1, 9);
  });

  it('clamps wastage to 0–50% and defaults to 10%', () => {
    expect(clampWastage(-5)).toBe(0);
    expect(clampWastage(80)).toBe(50);
    expect(clampWastage(Number.NaN)).toBe(0);
    expect(totalArea([{ length: '10', width: '10', unit: 'ft' }]).sqFt).toBeCloseTo(110, 9);
  });

  it('rounds up for ordering and formats the quote text', () => {
    expect(roundSqFt(176)).toBe(176);
    expect(roundSqFt(176.01)).toBe(177);
    expect(roundSqM(16.35)).toBe(16.4);
    const r = totalArea([{ length: '10', width: '16', unit: 'ft' }], 10);
    expect(quantityText(r)).toBe('176 sq ft (16.4 sq m) incl. 10% wastage');
    expect(quantityText(totalArea([{ length: '10', width: '10', unit: 'ft' }], 0))).toBe(
      '100 sq ft (9.3 sq m)',
    );
  });
});
