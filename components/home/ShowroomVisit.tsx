import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { fullAddress, site, telHref, whatsappHref } from '@/lib/site';
import styles from './ShowroomVisit.module.css';

/**
 * Split layout: lazy-loaded map on one side, visit details on the other.
 * TODO: replace the map side with (or add) a real showroom photograph — none exists yet (see docs/HOMEPAGE-REDESIGN.md).
 */
export function ShowroomVisit({
  eyebrow,
  title,
  titleAccent,
}: {
  eyebrow: string;
  title: string;
  titleAccent: string;
}) {
  return (
    <div className={`container ${styles.grid}`}>
      <div className={styles.map}>
        <iframe
          title="Map showing the S K Stones India showroom in Koramangala, Bengaluru"
          src={site.maps.embed}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className={styles.details}>
        <span className={styles.rule} aria-hidden="true" />
        <p className="eyebrow">{eyebrow}</p>
        <h2 id="showroom-title" className={styles.title}>
          {title} <span className="accent">{titleAccent}</span>
        </h2>
        <p className={styles.lead}>
          Walk through live slabs of granites, marbles and claddings at our Koramangala showroom, or book a
          guided consultation with our stone experts.
        </p>
        <dl className={styles.facts}>
          <div>
            <dt>Address</dt>
            <dd>
              <a href={site.maps.place} target="_blank" rel="noopener noreferrer">
                {fullAddress}
              </a>
            </dd>
          </div>
          <div>
            <dt>Hours</dt>
            <dd>{site.hours.label}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>
              <a href={telHref}>{site.phone.display}</a>
            </dd>
          </div>
        </dl>
        <div className={styles.actions}>
          <Link
            href={`/contact?${new URLSearchParams({ name: 'Showroom visit' }).toString()}#quote`}
            className="btn btn--primary"
          >
            Book a visit
          </Link>
          <a
            href={whatsappHref('Hi S K Stones India, I would like to visit your showroom.')}
            className="btn btn--whatsapp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="whatsapp" /> WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
