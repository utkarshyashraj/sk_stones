import { CaseStudyView, caseStudyMetadata } from '@/components/templates/CaseStudyView';

export const metadata = caseStudyMetadata('case-study-luxury-villa');

export default function Page() {
  return <CaseStudyView slug="case-study-luxury-villa" />;
}
