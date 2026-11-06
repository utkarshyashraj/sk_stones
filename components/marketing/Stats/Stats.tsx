import styles from './Stats.module.css';

export function Stats({
  items,
  tone = 'dark',
}: {
  items: { value: string; label: string }[];
  tone?: 'dark' | 'light';
}) {
  return (
    <dl className={`${styles.stats} ${tone === 'light' ? styles.light : ''}`}>
      {items.map((s) => (
        <div key={s.label} className={styles.stat}>
          <dt className={styles.label}>{s.label}</dt>
          <dd className={styles.value}>{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
