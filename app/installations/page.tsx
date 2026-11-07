import { ServicePageTemplate } from '@/components/ref/ServicePageTemplate';
import { pageMetadata } from '@/lib/ref-seo';
import '@/styles/ref/installations.css';

export const metadata = pageMetadata('installations', '/installations');

export default function Page() {
  return <ServicePageTemplate slug="installations" />;
}
