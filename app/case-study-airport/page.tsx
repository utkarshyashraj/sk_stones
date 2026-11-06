import { CaseStudyView, caseStudyMetadata } from '@/components/templates/CaseStudyView';

export const metadata = caseStudyMetadata('case-study-airport');

export default function Page() {
  return <CaseStudyView slug="case-study-airport" />;
}
