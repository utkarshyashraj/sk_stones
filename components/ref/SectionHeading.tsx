import type { ReactNode } from 'react';

/**
 * Reference section heading: optional small label, the title (gold words wrapped in <span>), optional
 * double underline. `className` picks the reference wrapper (section-header, services-slider-header…).
 */
export function SectionHeading({
  label,
  title,
  underline = true,
  className = 'section-header',
  children,
}: {
  label?: string;
  title: ReactNode;
  underline?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={className}>
      {label ? <span className="section-label">{label}</span> : null}
      <h2>{title}</h2>
      {underline ? <div className="underline" /> : null}
      {children}
    </div>
  );
}
