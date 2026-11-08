import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Every route is pre-rendered to static HTML at build time (no Node server needed on Netlify).
  output: 'export',
  // Netlify: /kota-stones -> out/kota-stones.html (served at the pretty URL, matching the legacy site).
  // GitHub Pages (NEXT_PUBLIC_TRAILING_SLASH=1): /kota-stones/ -> out/kota-stones/index.html, the layout
  // Pages serves reliably (a page file next to a same-named folder can resolve to the folder there).
  trailingSlash: process.env.NEXT_PUBLIC_TRAILING_SLASH === '1',
  // GitHub Pages project site (utkarshyashraj.github.io/sk_stones): every route and asset under /sk_stones.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  // Care guides (app/care/[material]/page.guide.tsx) exist only when NEXT_PUBLIC_SHOW_CARE_GUIDES=1:
  // a static export can't build a dynamic route with no pages, so the route file is left out entirely.
  pageExtensions: ['tsx', 'ts', ...(process.env.NEXT_PUBLIC_SHOW_CARE_GUIDES === '1' ? ['guide.tsx'] : [])],
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false,
  experimental: {
    // ~12 KB of CSS per page: inlining removes render-blocking stylesheet requests (better FCP/LCP).
    inlineCss: true,
  },
  images: {
    // Images are pre-optimised by scripts/optimize-images.mjs into responsive WebP sets.
    unoptimized: true,
  },
};

export default nextConfig;
