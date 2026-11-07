import type { MetadataRoute } from 'next';
import { absoluteUrl, SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    // Everything is crawlable; utility pages opt out with a noindex meta tag instead (crawlers must fetch them to see it).
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE_URL,
  };
}
