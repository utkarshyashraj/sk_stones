import Link from 'next/link';
import { RefImg } from './RefImg';

/** One card of the homepage "Our Services" slider; links to the service page. */
export function ServiceCard({
  href,
  image,
  alt,
  title,
  text,
}: {
  href: string;
  image: string;
  alt: string;
  title: string;
  text: string;
}) {
  return (
    <Link className="service-slide" href={href}>
      <div className="service-slide-image">
        <RefImg src={image} alt={alt} sizes="(min-width: 1025px) 300px, 80vw" />
      </div>
      <div className="service-slide-content">
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </Link>
  );
}
