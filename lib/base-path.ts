/**
 * URL prefix the site is served under. Empty for the business domain (served at the root); the
 * GitHub Pages project build sets NEXT_PUBLIC_BASE_PATH=/sk_stones (see .github/workflows/pages.yml).
 * next/link, the router and next/font add it themselves; plain asset URLs (images, video, fetched
 * JSON, favicon) go through withBase(). Pure: safe in server and client components.
 */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/+$/, '');
export const withBase = (path: string) => `${BASE_PATH}${path}`;
