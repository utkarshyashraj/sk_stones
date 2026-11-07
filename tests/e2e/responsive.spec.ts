import { expect, test } from '@playwright/test';

const WIDTHS = [360, 375, 390, 768, 1024, 1280, 1440, 1920];
const PAGES = [
  '/',
  '/about',
  '/projects',
  '/contact',
  '/products',
  '/marbles',
  '/granites',
  '/kota-stones',
  '/tiles',
  '/concrete-blocks',
  '/landscaping',
  '/installations',
  '/thank-you',
];

for (const width of WIDTHS) {
  test(`no horizontal scroll and exactly one h1 at ${width}px`, async ({ page }) => {
    test.setTimeout(150_000);
    await page.setViewportSize({ width, height: width < 768 ? 812 : 900 });
    for (const path of PAGES) {
      await page.goto(path);
      await page.waitForLoadState('load');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${path} overflows by ${overflow}px at ${width}px`).toBeLessThanOrEqual(0);
      // One h1 per page (the service pages hide theirs on phones, as the reference does — it stays in the DOM).
      await expect(page.locator('h1:not(.mobile-more-intro h1)'), path).toHaveCount(1);
    }
  });
}
