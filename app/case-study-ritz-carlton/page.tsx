import { CaseStudyView, caseStudyMetadata } from '@/components/templates/CaseStudyView';

export const metadata = caseStudyMetadata('case-study-ritz-carlton');

export default function Page() {
  return <CaseStudyView slug="case-study-ritz-carlton" />;
}
