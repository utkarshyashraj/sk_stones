import Link from 'next/link';
import { Picture } from '@/components/ui/Picture';
import type { ImageRef } from '@/lib/types';
import styles from './ProjectsGallery.module.css';

export interface ProjectItem {
  href: string;
  title: string;
  sector: string;
  /** Only facts documented in the case study (location if stated, material, scale). */
  facts: string[];
  image: ImageRef;
}

/** Editorial gallery: lead project large, two beside it, then a strip of further project photography. */
export function ProjectsGallery({
  projects,
  strip,
}: {
  projects: ProjectItem[];
  strip: { image: ImageRef; alt: string }[];
}) {
  return (
    <>
      <ul className={styles.grid}>
        {projects.map((p, i) => (
          <li key={p.href} className={`${i === 0 ? styles.lead : ''} reveal`}>
            <Link href={p.href} className={styles.card}>
              <span className={`${styles.media} zoom-media`}>
                <Picture
                  image={p.image}
                  alt=""
                  sizes={i === 0 ? '(min-width: 1024px) 58vw, 100vw' : '(min-width: 1024px) 40vw, 100vw'}
                  fill
                />
              </span>
              <span className={styles.sector}>{p.sector}</span>
              <span className={styles.title}>{p.title}</span>
              <span className={styles.facts}>{p.facts.join(' · ')}</span>
            </Link>
          </li>
        ))}
      </ul>
      <ul className={styles.strip} aria-label="More project photography">
        {strip.map((s) => (
          <li key={s.image.key} className={`${styles.stripItem} zoom-media`}>
            <Picture image={s.image} alt={s.alt} sizes="(min-width: 1024px) 25vw, 50vw" fill />
          </li>
        ))}
      </ul>
    </>
  );
}
