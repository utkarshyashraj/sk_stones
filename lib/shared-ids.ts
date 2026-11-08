/** Stone ids from a shared list link (`?ids=a,b,c`): valid ids only, deduplicated, at most 30. */
export function parseIds(search: string): string[] {
  const raw = new URLSearchParams(search).get('ids') ?? '';
  return [
    ...new Set(
      raw
        .split(',')
        .map((s) => s.trim())
        .filter((s) => /^[\w-]{1,120}$/.test(s)),
    ),
  ].slice(0, 30);
}
