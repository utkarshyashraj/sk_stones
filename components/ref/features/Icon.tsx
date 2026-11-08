import { Fa, type FaName } from '../Fa';

/**
 * Icons used only by the lazily loaded features, kept out of Fa so the always-loaded header and bottom bar
 * don't carry them. Same look as Fa (an <i> wrapping a 24-unit SVG, 1em, currentColor).
 */
type Glyph = { d: string; stroke?: boolean };
const G = {
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
} satisfies Record<string, Glyph>;

export type IconName = keyof typeof G | FaName;

export function Icon({ name, className }: { name: IconName; className?: string }) {
  const g: Glyph | undefined = (G as Record<string, Glyph>)[name];
  if (!g) return <Fa name={name as FaName} className={className} />;
  return (
    <i className={`fas fa-${name}${className ? ` ${className}` : ''}`} aria-hidden="true">
      <svg
        className="fa-svg"
        viewBox="0 0 24 24"
        fill={g.stroke ? 'none' : 'currentColor'}
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
