// Types for stone-attributes.mjs (plain ESM so build scripts can run it with node).
export const COVERAGE_THRESHOLD: number;
export const COLOUR_FAMILIES: string[];
export const FINISHES: string[];
export const FIELDS: { key: string; column: string; kind: 'list' | 'text' | 'numbers' }[];
export const COVERAGE_FIELDS: string[];
export const GUESS_MARK: string;
export const LIST_SEP: string;
export type StoneRecord = Record<string, unknown>;
export function guessToFamily(c: string): string | null;
export function validateRecord(
  id: string,
  record: unknown,
  ctx: { applications: string[]; projects: { id: string; name: string }[] },
): { value: Record<string, unknown>; errors: string[] };
export function mergeAttributes(
  base: { colours: string[]; finish?: string | null; applications?: string[]; origin?: string | null },
  attrs?: Record<string, unknown>,
): {
  colours: string[];
  finishes: string[];
  applications: string[];
  origin: string | null;
  thicknessesMm: number[];
  formats: string[];
  synonyms: string[];
  usedInProjects: string[];
  sources: Record<'colours' | 'finishes' | 'applications' | 'origin', string | null>;
};
export function attributeCoverage(
  ids: string[],
  stones: Record<string, Record<string, unknown>>,
): { threshold: number; total: number; fields: Record<string, { count: number; share: number }> };
export function parseCsv(text: string): string[][];
export function toCsv(rows: unknown[][]): string;
export function recordsFromCsv(
  rows: string[][],
  knownIds: Set<string>,
): { stones: Record<string, Record<string, unknown>>; errors: string[]; ignoredGuesses: number };
