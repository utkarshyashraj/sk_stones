import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Every route is pre-rendered to static HTML at build time (no Node server needed on Netlify).
  output: 'export',
  // /kota-stones -> out/kota-stones.html (Netlify serves it at the pretty URL, matching the legacy site).
  trailingSlash: false,
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
