import styles from './Process.module.css';

export function Process({ steps }: { steps: { step: string; title: string; text: string }[] }) {
  return (
    <ol className={styles.steps}>
      {steps.map((s) => (
        <li key={s.step} className={styles.step}>
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
