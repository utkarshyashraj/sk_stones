import { expect, test } from '@playwright/test';

const ldTypes = (html: string) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
    (m) => (JSON.parse(m[1]!) as { '@type': string })['@type'],
  );

test.describe('structured data and data-gated content', () => {
  test('JSON-LD: LocalBusiness on home and contact only; FAQPage with the accordion; breadcrumbs on product pages', async ({
    request,
  }) => {
    const get = async (p: string) => ldTypes(await (await request.get(p)).text());
    expect(await get('/')).toEqual(expect.arrayContaining(['LocalBusiness', 'FAQPage']));
    expect(await get('/contact')).toEqual(expect.arrayContaining(['LocalBusiness', 'FAQPage']));
    expect(await get('/installations')).toEqual(['FAQPage']);
    expect(await get('/indian-marbles')).toEqual(['BreadcrumbList']);
    expect(await get('/about')).toEqual([]);
  });

  test('hidden until data: no "Stones used" on projects, no care-guide links or pages', async ({
    page,
    request,
  }) => {
    await page.goto('/projects');
    await expect(page.locator('.project-block').first()).toBeVisible();
    await expect(page.locator('.sk-stones-used')).toHaveCount(0);
    await page.goto('/indian-marbles');
    await expect(page.locator('.sk-care-link')).toHaveCount(0);
    expect((await request.get('/care/marble')).status()).toBe(404);
  });

  test('/search and /saved stay out of the sitemap', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    expect(xml).not.toMatch(/\/search<|\/saved<|\/care\//);
  });
});
