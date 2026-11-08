import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RefShell } from '@/components/ref/RefShell';
import { CARE_GUIDES_ENABLED, careGuides } from '@/content/care-guides';
import { pageMetadata } from '@/lib/ref-seo';
import '@/styles/ref/product.css';

export const dynamicParams = false;

/**
 * Compiled only when NEXT_PUBLIC_SHOW_CARE_GUIDES=1 (see pageExtensions in next.config.ts), pending business
 * review of content/care-guides.ts.
 */
export function generateStaticParams() {
  return careGuides.map((g) => ({ material: g.slug }));
}

type Params = { params: Promise<{ material: string }> };
const guideOf = (slug: string) => (CARE_GUIDES_ENABLED ? careGuides.find((g) => g.slug === slug) : undefined);

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const g = guideOf((await params).material);
  return g
    ? pageMetadata('products', `/care/${g.slug}`, {
        title: `${g.title} | S K Stones India`,
        description: g.intro,
      })
    : {};
}

export default async function CareGuidePage({ params }: Params) {
  const g = guideOf((await params).material);
  if (!g) notFound();
  return (
    <RefShell bundle="product" nav="products" tab="products" footer="container-grid" headerScrolled>
      <section className="sk-care">
        <div className="container">
          <article className="sk-care-card">
            <p className="sk-care-kicker">Care guide</p>
            <h1>{g.title}</h1>
            <p className="sk-care-intro">{g.intro}</p>
            {g.sections.map((s) => (
              <div key={s.heading}>
                <h2>{s.heading}</h2>
                <ul>
                  {s.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="sk-care-note">
              General guidance for natural stone. For advice on a specific stone or installation,{' '}
              <Link href="/contact">ask us</Link>.
            </p>
          </article>
        </div>
      </section>
    </RefShell>
  );
}
