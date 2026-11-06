import { ServicePageView, serviceMetadata } from '@/components/templates/ServicePageView';

export const metadata = serviceMetadata('stone-art-installations');

export default function Page() {
  return <ServicePageView slug="stone-art-installations" />;
}
