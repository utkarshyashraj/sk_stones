import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductPageTemplate } from '@/components/ref/ProductPageTemplate';
import { getRefCategory, productPageSlugs } from '@/lib/ref-catalog';
import { pageMetadata } from '@/lib/ref-seo';
import '@/styles/ref/product.css';

export const dynamicParams = false;

/** Every product, hub and collection page of the reference, from one data-driven template. */
export function generateStaticParams() {
  return productPageSlugs().map((slug) => ({ slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const c = getRefCategory(slug);
  return c ? pageMetadata(c.legacySource ?? slug, `/${slug}`) : {};
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const c = getRefCategory(slug);
  if (!c) notFound();
  return <ProductPageTemplate category={c} />;
}
