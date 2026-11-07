import { ServicePageTemplate } from '@/components/ref/ServicePageTemplate';
import { pageMetadata } from '@/lib/ref-seo';
import '@/styles/ref/flooring-executions.css';

export const metadata = pageMetadata('flooring-executions', '/flooring-executions');

export default function Page() {
  return <ServicePageTemplate slug="flooring-executions" />;
}
