import { ServicePageTemplate } from '@/components/ref/ServicePageTemplate';
import { pageMetadata } from '@/lib/ref-seo';
import '@/styles/ref/stone-art-installations.css';

export const metadata = pageMetadata('stone-art-installations', '/stone-art-installations');

export default function Page() {
  return <ServicePageTemplate slug="stone-art-installations" />;
}
