import { site, telHref } from '@/lib/site';
import { Fa } from './Fa';

/**
 * Reference footer. Most pages show the contact block (phone, email, Bangalore, Hyderabad); product pages
 * show only the copyright bar. The wrapper markup differs slightly between reference page types and the
 * page stylesheets target those exact classes, so the variant picks the matching structure.
 */
export type FooterVariant = 'content' | 'content-p' | 'grid' | 'container-grid' | 'bottom-only';

export function Footer({ variant }: { variant: FooterVariant }) {
  const bottom = (
    <div className="footer-bottom">{variant === 'content' ? site.copyright : <p>{site.copyright}</p>}</div>
  );
  if (variant === 'bottom-only')
    return (
      <footer className="footer">
        <div className="container">{bottom}</div>
      </footer>
    );
  const grid = (
    <div
      className={
        variant === 'content' || variant === 'content-p'
          ? 'footer-content footer-content-contact-only'
          : 'footer-grid footer-grid-contact-only'
      }
    >
      <div className="footer-contact-grid">
        <div className="footer-contact-block">
          <h4>Contact</h4>
          <p>
            <a href={telHref}>
              <Fa name="phone" /> {site.phone.display}
            </a>
          </p>
          <p>
            <a href={`mailto:${site.email}`}>
              <Fa name="envelope" /> {site.email}
            </a>
          </p>
        </div>
        {site.offices.map((o) => (
          <div key={o.city} className="footer-contact-block">
            <h4>{o.city}</h4>
            <p>
              <Fa name="map-marker-alt" /> <span>{o.address}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <footer className="footer">
      {variant === 'container-grid' ? (
        <div className="container">
          {grid}
          {bottom}
        </div>
      ) : (
        <>
          {grid}
          {bottom}
        </>
      )}
    </footer>
  );
}
