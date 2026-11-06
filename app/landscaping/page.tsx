import { ServicePageView, serviceMetadata } from '@/components/templates/ServicePageView';

export const metadata = serviceMetadata('landscaping');

export default function Page() {
  return <ServicePageView slug="landscaping" />;
}
