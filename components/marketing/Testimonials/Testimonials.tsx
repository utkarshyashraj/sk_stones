import styles from './Testimonials.module.css';

interface Props {
  items: { quote: string; name: string }[];
  featured?: { heading: string; quote: string; name: string };
}

export function Testimonials({ items, featured }: Props) {
  return (
    <div className={styles.wrap}>
      {featured ? (
        <figure className={`${styles.featured} on-dark`}>
          <p className={styles.featuredHeading}>{featured.heading}</p>
          <blockquote className={styles.featuredQuote}>
            <p>{featured.quote}</p>
          </blockquote>
          <figcaption className={styles.featuredName}>— {featured.name}</figcaption>
        </figure>
      ) : null}
      <ul className={styles.grid}>
        {items.map((t) => (
          <li key={t.name}>
            <figure className={styles.card}>
              <blockquote className={styles.quote}>
                <p>“{t.quote}”</p>
              </blockquote>
              <figcaption className={styles.name}>{t.name}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}
