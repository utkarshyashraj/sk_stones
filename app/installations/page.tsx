import { ServicePageView, serviceMetadata } from '@/components/templates/ServicePageView';

export const metadata = serviceMetadata('installations');

export default function Page() {
  return <ServicePageView slug="installations" />;
}
