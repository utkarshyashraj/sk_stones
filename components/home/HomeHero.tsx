import Link from 'next/link';
import { Picture } from '@/components/ui/Picture';
import type { ImageRef } from '@/lib/types';
import styles from './HomeHero.module.css';

interface Props {
  heading: string;
  headingAccent: string;
  subhead: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  slab: { image: ImageRef; name: string };
  trust: { value: string; label: string }[];
}

/** Full-viewport hero over the company's own slab photograph (preloaded, AVIF/WebP). */
export function HomeHero({ heading, headingAccent, subhead, primary, secondary, slab, trust }: Props) {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.media} aria-hidden="true">
        <Picture image={slab.image} alt="" sizes="100vw" priority fill />
      </div>
      <div className={`container ${styles.inner}`}>
        <h1 id="hero-title" className={styles.title}>
          {heading} <span className="accent">{headingAccent}</span>
        </h1>
        <p className={styles.subhead}>{subhead}</p>
        <div className={styles.actions}>
          <Link href={primary.href} className="btn btn--primary">
            {primary.label}
          </Link>
          <Link href={secondary.href} className="btn btn--outline">
            {secondary.label}
          </Link>
        </div>
        <ul className={styles.trust} aria-label="At a glance">
          {trust.map((t) => (
            <li key={t.label}>
              <span className={styles.trustValue}>{t.value}</span> {t.label.toLowerCase()}
            </li>
          ))}
        </ul>
      </div>
      <p className={styles.credit}>{slab.name} marble</p>
    </section>
  );
}
