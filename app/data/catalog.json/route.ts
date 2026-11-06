import { allProducts, categoryNames, categoryOrder, toClientProduct } from '@/lib/catalog';

// Pre-rendered at build time to /data/catalog.json — the client-side index for global search.
export const dynamic = 'force-static';

export function GET() {
  return Response.json({
    products: allProducts().map(toClientProduct),
    names: categoryNames(),
    order: categoryOrder(),
  });
}
