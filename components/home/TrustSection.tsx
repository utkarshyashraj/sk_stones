import Link from 'next/link';
import { CountUp } from '@/components/ui/CountUp';
import { VideoFeature } from '@/components/marketing/VideoFeature/VideoFeature';
import styles from './TrustSection.module.css';

interface Props {
  eyebrow: string;
  heading: string;
  headingAccent: string;
  text: string;
  videoTitle: string;
  videoCaption: string;
  stats: { value: string; label: string }[];
}

/** "Who we are": one figure (video in an offset gold frame + caption), then text, stats and a text CTA. */
export function TrustSection({
  eyebrow,
  heading,
  headingAccent,
  text,
  videoTitle,
  videoCaption,
  stats,
}: Props) {
  return (
    <div className={`container ${styles.grid}`}>
      <figure className={styles.media}>
        <div className={styles.frame}>
          <VideoFeature title={videoTitle} />
        </div>
        <figcaption className={styles.caption}>{videoCaption}</figcaption>
      </figure>
      <div className={styles.text}>
        <span className={styles.rule} aria-hidden="true" />
        <p className="eyebrow">{eyebrow}</p>
        <h2 id="trust-title" className={styles.title}>
          {heading} <span className="accent">{headingAccent}</span>
        </h2>
        <p className={styles.body}>{text}</p>
        <dl className={styles.stats}>
          {stats.map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>
                <CountUp value={s.value} className={styles.value} />
              </dd>
            </div>
          ))}
        </dl>
        <Link href="/about" className={styles.cta}>
          <span>Our story &amp; team</span>
          <span aria-hidden="true" className={styles.arrow}>
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
