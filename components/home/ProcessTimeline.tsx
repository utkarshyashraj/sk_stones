import styles from './ProcessTimeline.module.css';

/** Horizontal timeline joined by a thin gold line; vertical on phones. Steps are the business's own four. */
export function ProcessTimeline({ steps }: { steps: { step: string; title: string; text: string }[] }) {
  return (
    <ol className={styles.timeline}>
      {steps.map((s) => (
        <li key={s.step} className={`${styles.step} reveal`}>
          <span className={styles.marker} aria-hidden="true" />
          <span className={styles.num} aria-hidden="true">
            {s.step}
          </span>
          <h3 className={styles.title}>{s.title}</h3>
          <p className={styles.text}>{s.text}</p>
        </li>
      ))}
    </ol>
  );
}
