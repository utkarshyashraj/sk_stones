import { ServicePageTemplate } from '@/components/ref/ServicePageTemplate';
import { pageMetadata } from '@/lib/ref-seo';
import '@/styles/ref/landscaping.css';

export const metadata = pageMetadata('landscaping', '/landscaping');

export default function Page() {
  return <ServicePageTemplate slug="landscaping" />;
}
