import { jsonLdScript } from '@/lib/seo';

/** Structured data rendered into the static HTML (no client JS). */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(data)} />;
}
