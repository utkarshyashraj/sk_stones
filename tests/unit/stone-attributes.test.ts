import { describe, expect, it } from 'vitest';
import {
  attributeCoverage,
  mergeAttributes,
  parseCsv,
  recordsFromCsv,
  toCsv,
  validateRecord,
} from '@/scripts/lib/stone-attributes.mjs';
import { buildSearchIndex } from '@/lib/search-index';

const ctx = {
  applications: ['Flooring', 'Wall Cladding', 'Countertops & Kitchens'],
  projects: [{ id: 'project-jw-marriott', name: 'JW Marriott' }],
};

describe('stone attributes: validation', () => {
  it('canonicalises allowed values and parses numbers', () => {
    const { value, errors } = validateRecord(
      'x',
      {
        colourFamilies: ['black', 'GREY'],
        finishes: 'polished',
        thicknessesMm: ['18', '20mm'],
        usedInProjects: ['jw marriott'],
      },
      ctx,
    );
    expect(errors).toEqual([]);
    expect(value).toEqual({
      colourFamilies: ['Black', 'Grey'],
      finishes: ['Polished'],
      thicknessesMm: [18, 20],
      usedInProjects: ['project-jw-marriott'],
    });
  });
  it('rejects values outside the allowed lists, unknown fields and unknown projects', () => {
    const { errors } = validateRecord(
      'x',
      { colourFamilies: ['Turquoise'], finish: 'x', usedInProjects: ['Taj'], thicknessesMm: ['thick'] },
      ctx,
    );
    expect(errors.join('\n')).toMatch(/Turquoise/);
    expect(errors.join('\n')).toMatch(/unknown field "finish"/);
    expect(errors.join('\n')).toMatch(/Taj/);
    expect(errors.join('\n')).toMatch(/thickness/);
  });
});

describe('stone attributes: merge', () => {
  const base = {
    colours: ['Multicolour', 'Purple'],
    finish: 'Polished',
    applications: ['Flooring'],
    origin: 'India',
  };
  it('keeps name/category values as marked fallbacks when nothing is confirmed', () => {
    const m = mergeAttributes(base, {});
    expect(m.colours).toEqual(['Multi']); // guess words mapped to families; unmappable dropped
    expect(m.finishes).toEqual(['Polished']);
    expect(m.sources).toEqual({
      colours: 'guess',
      finishes: 'guess',
      applications: 'category',
      origin: 'category',
    });
  });
  it('lets business values override guesses', () => {
    const m = mergeAttributes(base, {
      colourFamilies: ['Black'],
      applications: ['Wall Cladding'],
      thicknessesMm: [20],
    });
    expect(m.colours).toEqual(['Black']);
    expect(m.applications).toEqual(['Wall Cladding']);
    expect(m.thicknessesMm).toEqual([20]);
    expect(m.sources.colours).toBe('business');
    expect(m.sources.applications).toBe('business');
    expect(m.sources.origin).toBe('category');
  });
});

describe('stone attributes: coverage', () => {
  it('counts only business-confirmed values', () => {
    const ids = ['a', 'b', 'c', 'd', 'e'];
    const cov = attributeCoverage(ids, {
      a: { colourFamilies: ['Black'] },
      b: { colourFamilies: ['White'] },
      c: { colourFamilies: [] },
      d: { origin: 'India' },
    });
    expect(cov.fields.colourFamilies).toEqual({ count: 2, share: 0.4 });
    expect(cov.fields.origin).toEqual({ count: 1, share: 0.2 });
    expect(cov.fields.finishes?.share).toBe(0);
    expect(cov.threshold).toBe(0.8);
  });
});

describe('stone attributes: CSV import', () => {
  it('parses quoted cells, BOM and CRLF, and round-trips', () => {
    const rows = [
      ['id', 'notes'],
      ['a', 'says "hi", ok'],
      ['b', 'line\nbreak'],
    ];
    expect(parseCsv('﻿' + toCsv(rows))).toEqual(rows);
  });
  it('skips unconfirmed "(guess)" cells, splits lists on ";" and reports unknown ids', () => {
    const csv =
      'id,colour_families,finishes,origin,thicknesses_mm\r\na,Black (guess),Polished; Leather,India,18; 20\r\nb,Grey,,,\r\nzzz,White,,,\r\n';
    const { stones, errors, ignoredGuesses } = recordsFromCsv(parseCsv(csv), new Set(['a', 'b']));
    expect(stones).toEqual({
      a: { finishes: ['Polished', 'Leather'], origin: 'India', thicknessesMm: ['18', '20'] },
      b: { colourFamilies: ['Grey'] },
    });
    expect(ignoredGuesses).toBe(1);
    expect(errors).toEqual(['row 4: unknown stone id "zzz"']);
  });
});

describe('search index', () => {
  it('covers every stone, page, service, application and project', () => {
    const idx = buildSearchIndex();
    expect(idx.stones).toHaveLength(444);
    expect(idx.collections.length).toBe(34);
    expect(idx.services.map((s) => s.s)).toEqual([
      'landscaping',
      'flooring-executions',
      'stone-art-installations',
      'installations',
    ]);
    expect(idx.projects).toHaveLength(7);
    expect(idx.applications.length).toBeGreaterThan(5);
    // nothing is confirmed yet, so facets built on business data have none
    expect(idx.stones.every((s) => s.colB.length === 0 && s.finB.length === 0)).toBe(true);
    expect(idx.coverage.fields.colourFamilies).toBe(0);
  });
});
