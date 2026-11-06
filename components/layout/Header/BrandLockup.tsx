import Link from 'next/link';
import styles from './Header.module.css';

export function BrandLockup({ variant = 'header' }: { variant?: 'header' | 'footer' }) {
  return (
    <Link
      href="/"
      className={`${styles.brand} ${variant === 'footer' ? styles.brandFooter : ''}`}
      aria-label="S K Stones India — home"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny pre-optimised logo */}
      <img
        className={styles.brandMark}
        src="/images/site/shree-logo-204.webp"
        alt=""
        width={204}
        height={420}
      />
      <span className={styles.brandText}>
        <span className={styles.brandName}>
          S K <span className={styles.brandGold}>Stones</span> India
        </span>
        <span className={styles.brandFormerly}>formerly Shree Stones &amp; Services</span>
      </span>
    </Link>
  );
}
