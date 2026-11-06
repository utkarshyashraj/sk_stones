import { expect, test } from '@playwright/test';

const routesFromSitemap = async (request: import('@playwright/test').APIRequestContext) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  return [...xml.matchAll(/<loc>https:\/\/skstonesindia\.com([^<]*)<\/loc>/g)].map((m) => m[1] || '/');
};

test.describe('every public route', () => {
  test('loads with one h1, header, footer and no console errors', async ({ page, request }, info) => {
    test.skip(info.project.name !== 'desktop', 'route sweep runs once');
    test.setTimeout(180_000);
    const routes = await routesFromSitemap(request);
    expect(routes.length).toBeGreaterThanOrEqual(47);
    for (const route of [...routes, '/search', '/thank-you']) {
      const errors: string[] = [];
      const onError = (m: import('@playwright/test').ConsoleMessage) =>
        m.type() === 'error' && errors.push(m.text());
      page.on('console', onError);
      const res = await page.goto(route);
      expect(res?.status(), route).toBe(200);
      await expect(page.locator('h1'), route).toHaveCount(1);
      await expect(page.locator('header nav[aria-label="Main"]')).toBeAttached();
      await expect(page.locator('footer')).toContainText('+91 70226 30994');
      expect(errors, `${route} console errors`).toEqual([]);
      page.off('console', onError);
    }
  });

  test('legacy URLs redirect permanently', async ({ request }) => {
    for (const [from, to] of [
      ['/quatrz-surfaces', '/quartz-surfaces'],
      ['/about.html', '/about'],
      ['/index.html', '/'],
      ['/indian-marble-unpolished', '/indian-marbles'],
    ]) {
      const res = await request.get(from!, { maxRedirects: 0 });
      expect(res.status(), from).toBe(301);
      expect(res.headers().location).toBe(to);
    }
  });

  test('unknown URLs show the 404 page', async ({ page }) => {
    const res = await page.goto('/this-does-not-exist');
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toContainText("couldn't find");
  });
});

test.describe('desktop navigation', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only');

  test('mega menu opens with keyboard, exposes aria-expanded and closes with Escape', async ({ page }) => {
    await page.goto('/');
    const button = page.getByRole('button', { name: 'Products' });
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    const panel = page.locator('#nav-panel-products');
    await expect(panel).toBeVisible();
    await expect(panel.getByRole('link', { name: 'Granites', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(button).toBeFocused();
  });

  test('category parents are real links to their landing pages', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Products' }).click();
    await page.locator('#nav-panel-products').getByRole('link', { name: 'Marbles', exact: true }).click();
    await expect(page).toHaveURL(/\/marbles$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Marbles');
    await expect(page.getByRole('button', { name: 'Products' })).toHaveClass(/activeParent/);
  });

  test('services dropdown navigates and marks the active page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Services' }).click();
    await page.locator('#nav-panel-services').getByRole('link', { name: 'Landscaping' }).click();
    await expect(page).toHaveURL(/\/landscaping$/);
    await page.getByRole('button', { name: 'Services' }).click();
    await expect(
      page.locator('#nav-panel-services').getByRole('link', { name: 'Landscaping' }),
    ).toHaveAttribute('aria-current', 'page');
  });

  test('skip link moves focus to main content', async ({ page }) => {
    await page.goto('/about');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeFocused();
  });
});

test.describe('mobile navigation', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile only');

  test('hamburger is a real button that opens an accessible drawer', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Open menu' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    const drawer = page.locator('#mobile-menu');
    await expect(drawer).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await drawer.getByText('Products', { exact: true }).click();
    await drawer.getByRole('link', { name: 'Cobble Stones' }).click();
    await expect(page).toHaveURL(/\/cobble-stones$/);
    await expect(drawer).toBeHidden();
  });

  test('bottom navigation is visible and links work', async ({ page }) => {
    await page.goto('/about');
    const bottom = page.getByRole('navigation', { name: 'Quick actions' });
    await expect(bottom).toBeVisible();
    await expect(bottom.getByRole('link', { name: 'Call' })).toHaveAttribute('href', 'tel:+917022630994');
    await bottom.getByRole('link', { name: 'Products' }).click();
    await expect(page).toHaveURL(/\/products$/);
  });

  test('case-study pages have working mobile navigation', async ({ page }) => {
    await page.goto('/case-study-airport');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.locator('#mobile-menu')).toBeVisible();
  });
});

test.describe('breadcrumbs', () => {
  test('show the hierarchy, link parents and mark the current page', async ({ page }) => {
    await page.goto('/indian-marbles');
    const crumbs = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(crumbs.getByRole('listitem')).toHaveText(['Home', 'Products', 'Marbles', 'Indian Marbles']);
    await expect(crumbs.locator('[aria-current="page"]')).toHaveText('Indian Marbles');
    await crumbs.getByRole('link', { name: 'Marbles' }).click();
    await expect(page).toHaveURL(/\/marbles$/);
  });

  test('emit BreadcrumbList JSON-LD in the static HTML', async ({ request }) => {
    const html = await (await request.get('/indian-marbles')).text();
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).toContain('"item":"https://skstonesindia.com/marbles"');
  });
});
