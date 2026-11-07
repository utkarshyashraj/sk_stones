import Link from 'next/link';
import { withBase } from '@/lib/base-path';
import styles from './Header.module.css';

export function BrandLockup({ variant = 'header' }: { variant?: 'header' | 'footer' }) {
  return (
    <Link href="/" className={`${styles.brand} ${variant === 'footer' ? styles.brandFooter : ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny pre-optimised logo */}
      <img
        className={styles.brandMark}
        src={withBase('/images/site/shree-logo-60.webp')}
        alt=""
        width={60}
        height={124}
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
