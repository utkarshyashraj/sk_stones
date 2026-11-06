import type { ReactNode } from 'react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs/Breadcrumbs';
import { Picture } from '@/components/ui/Picture';
import type { Crumb, ImageRef } from '@/lib/types';
import styles from './PageHero.module.css';

interface Props {
  crumbs?: Crumb[];
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  /** Full-bleed background photo (darkened for legibility). */
  background?: ImageRef | null;
  /** Framed image beside the text on wide screens. */
  aside?: { image: ImageRef; alt: string } | null;
  children?: ReactNode;
}

export function PageHero({ crumbs, eyebrow, title, lead, actions, background, aside, children }: Props) {
  return (
    <section className={`${styles.hero} on-dark`}>
      {background ? (
        <div className={styles.bg} aria-hidden="true">
          <Picture image={background} alt="" sizes="100vw" priority fill />
        </div>
      ) : null}
      <div className={`container ${styles.inner} ${aside ? styles.withAside : ''}`}>
        <div className={styles.text}>
          {crumbs ? <Breadcrumbs items={crumbs} /> : null}
          {eyebrow ? <p className={`eyebrow ${styles.eyebrow}`}>{eyebrow}</p> : null}
          <h1 className={styles.title}>{title}</h1>
          {lead ? <div className={styles.lead}>{lead}</div> : null}
          {actions ? <div className={styles.actions}>{actions}</div> : null}
          {children}
        </div>
        {aside ? (
          <div className={styles.aside}>
            <Picture
              image={aside.image}
              alt={aside.alt}
              sizes="(min-width: 1024px) 40vw, 100vw"
              priority
              imgClassName={styles.asideImg}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
