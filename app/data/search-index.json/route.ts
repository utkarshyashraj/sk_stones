import { buildSearchIndex } from '@/lib/search-index';

// Pre-rendered at build time to /data/search-index.json: the browser-side index for search, filters,
// the saved list and the guided chooser. Nothing runs on a server.
export const dynamic = 'force-static';

export function GET() {
  return Response.json(buildSearchIndex());
}
