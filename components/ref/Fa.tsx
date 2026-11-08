/**
 * Inline-SVG stand-ins for the Font Awesome glyphs the reference uses, rendered inside the same
 * <i class="fas fa-…"> element so the reference CSS (sizes, colours, rotations) applies unchanged —
 * without loading Font Awesome's stylesheet and font files.
 */
type Glyph = { d: string; stroke?: boolean; evenOdd?: boolean };

const G: Record<string, Glyph> = {
  phone: {
    d: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z',
  },
  envelope: {
    d: 'M2 6.2V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v.2l-10 6.4zM2 8.6l10 6.4 10-6.4V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z',
  },
  'map-marker-alt': {
    d: 'M12 1.5a7.5 7.5 0 0 0-7.5 7.5c0 5.6 7.5 13.5 7.5 13.5s7.5-7.9 7.5-13.5A7.5 7.5 0 0 0 12 1.5zm0 10.3a2.8 2.8 0 1 1 0-5.6 2.8 2.8 0 0 1 0 5.6z',
    evenOdd: true,
  },
  'chevron-down': { d: 'm5 9 7 7 7-7', stroke: true },
  'chevron-up': { d: 'm5 15 7-7 7 7', stroke: true },
  'chevron-right': { d: 'm9 5 7 7-7 7', stroke: true },
  'chevron-left': { d: 'm15 5-7 7 7 7', stroke: true },
  'arrow-right': { d: 'M4 12h15M13 5.5l6.5 6.5-6.5 6.5', stroke: true },
  check: { d: 'M4.5 12.5 9.5 17.5 19.5 6.5', stroke: true },
  'search-plus': {
    d: 'M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15zM21 21l-5.2-5.2M10.5 7.5v6M7.5 10.5h6',
    stroke: true,
  },
  'quote-left': {
    d: 'M3 13.5C3 8.8 5.6 5.4 10 4l.9 1.9C8.4 7 7.3 8.9 7.1 11H10v8H3zm11 0c0-4.7 2.6-8.1 7-9.5l.9 1.9c-2.5 1.1-3.6 3-3.8 5.1H21v8h-7z',
  },
  'quote-right': {
    d: 'M21 10.5c0 4.7-2.6 8.1-7 9.5l-.9-1.9c2.5-1.1 3.6-3 3.8-5.1H14V5h7zm-11 0c0 4.7-2.6 8.1-7 9.5l-.9-1.9C4.6 17 5.7 15.1 5.9 13H3V5h7z',
  },
  gem: { d: 'M6.5 3h11L22 9l-10 12L2 9zM2 9h20M9 3 7.5 9 12 21l4.5-12L15 3', stroke: true },
  'file-alt': {
    d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8M8 9h2',
    stroke: true,
  },
  tools: {
    d: 'M14.7 6.3a4 4 0 0 0 5 5L22 13.6l-2.4 2.4-2.3-2.3a4 4 0 0 0-5-5zM3 21l8.5-8.5M6.5 3.5 10 7l-3 3-3.5-3.5z',
    stroke: true,
  },
  lightbulb: {
    d: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z',
    stroke: true,
  },
  film: { d: 'M3 4h18v16H3zM7 4v16M17 4v16M3 8h4M3 12h4M3 16h4M17 8h4M17 12h4M17 16h4', stroke: true },
  crown: { d: 'M3 7l4.5 4L12 4l4.5 7L21 7l-2 11H5zM5 21h14', stroke: true },
  cogs: {
    d: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
    stroke: true,
  },
  award: { d: 'M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.2 13.9 7 22l5-3 5 3-1.2-8.1', stroke: true },
  'check-circle': {
    d: 'M12 1.5a10.5 10.5 0 1 0 0 21 10.5 10.5 0 0 0 0-21zm-1.4 15.1-4.7-4.7 1.6-1.6 3.1 3.1 6.1-6.1 1.6 1.6z',
    evenOdd: true,
  },
  spinner: { d: 'M12 3a9 9 0 1 0 9 9', stroke: true },
  search: { d: 'M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15zM21 21l-5.2-5.2', stroke: true },
  bookmark: { d: 'M6.5 3.5h11v17l-5.5-3.8-5.5 3.8z', stroke: true },
  'bookmark-solid': { d: 'M5.5 2.5h13v19.5l-6.5-4.5-6.5 4.5z' },
  share: { d: 'M16 6l-4-4-4 4M12 2v13M5 11v9h14v-9', stroke: true },
  trash: { d: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3', stroke: true },
  calculator: {
    d: 'M6 2.5h12a1.5 1.5 0 0 1 1.5 1.5v16a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 20V4A1.5 1.5 0 0 1 6 2.5zM8 6.5h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h4',
    stroke: true,
  },
  sliders: { d: 'M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M14 4v4M8 10v4M16 16v4', stroke: true },
  clock: { d: 'M12 21.5a9.5 9.5 0 1 0 0-19 9.5 9.5 0 0 0 0 19zM12 7v5l3 2', stroke: true },
  times: { d: 'M6 6l12 12M18 6 6 18', stroke: true },
  google: {
    d: 'M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4zM12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22zM6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9zM12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5L6.4 10C7.2 7.7 9.4 6 12 6z',
  },
  whatsapp: {
    d: 'M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.05 21.79h-.01a9.9 9.9 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.89 9.88zm8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.42z',
  },
  'linkedin-in': {
    d: 'M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z',
  },
};

const BRANDS = new Set(['whatsapp', 'linkedin-in', 'google']);

export type FaName = keyof typeof G;

export function Fa({ name, className }: { name: FaName; className?: string }) {
  const g = G[name]!;
  return (
    <i
      className={`${BRANDS.has(name) ? 'fab' : 'fas'} fa-${name}${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    >
      <svg
        className="fa-svg"
        viewBox="0 0 24 24"
        fill={g.stroke ? 'none' : 'currentColor'}
        fillRule={g.evenOdd ? 'evenodd' : undefined}
        stroke={g.stroke ? 'currentColor' : 'none'}
        strokeWidth={g.stroke ? 3 : undefined}
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        <path d={g.d} />
      </svg>
    </i>
  );
}
