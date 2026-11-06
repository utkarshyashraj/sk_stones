import type { ReactNode } from 'react';
import styles from './SectionHeader.module.css';

interface Props {
  id: string;
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: 'start' | 'center';
  /** Optional element aligned to the right of the header on wide screens (e.g. a "View all" link). */
  aside?: ReactNode;
}

/** Consistent section header: short gold rule → eyebrow → serif h2 (optional italic accent) → optional intro. */
export function SectionHeader({ id, eyebrow, title, intro, align = 'start', aside }: Props) {
  return (
    <div className={`${styles.wrap} ${align === 'center' ? styles.center : ''}`}>
      <div className={styles.head}>
        <span className={styles.rule} aria-hidden="true" />
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className={styles.title}>
          {title}
        </h2>
        {intro ? <p className={styles.intro}>{intro}</p> : null}
      </div>
      {aside ? <div className={styles.aside}>{aside}</div> : null}
    </div>
  );
}
