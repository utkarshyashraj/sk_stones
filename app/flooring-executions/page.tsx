import { ServicePageView, serviceMetadata } from '@/components/templates/ServicePageView';

export const metadata = serviceMetadata('flooring-executions');

export default function Page() {
  return <ServicePageView slug="flooring-executions" />;
}
