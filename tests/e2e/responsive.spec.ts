import { expect, test } from '@playwright/test';

const WIDTHS = [360, 390, 430, 768, 1024, 1440, 1920];
const PAGES = [
  '/',
  '/products',
  '/marbles',
  '/kota-stones',
  '/tiles',
  '/concrete-blocks',
  '/contact',
  '/about',
  '/projects',
  '/installations',
  '/case-study-ritz-carlton',
  '/search?q=granite',
  '/thank-you',
];

for (const width of WIDTHS) {
  test(`no horizontal overflow or broken layout at ${width}px`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: width < 768 ? 800 : 900 });
    for (const path of PAGES) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${path} overflows by ${overflow}px at ${width}px`).toBeLessThanOrEqual(0);
      await expect(page.locator('h1'), path).toBeVisible();
      // body text must stay readable
      const fontSize = await page.evaluate(() => parseFloat(getComputedStyle(document.body).fontSize));
      expect(fontSize).toBeGreaterThanOrEqual(16);
      // images must keep their aspect ratio (rendered ratio ≈ intrinsic ratio unless object-fit is used)
      const distorted = await page.evaluate(() =>
        [...document.images]
          .filter((img) => img.complete && img.naturalWidth && img.getBoundingClientRect().width > 0)
          .filter(
            (img) =>
              getComputedStyle(img).objectFit !== 'cover' && getComputedStyle(img).objectFit !== 'contain',
          )
          .filter((img) => {
            const r = img.getBoundingClientRect();
            return Math.abs(r.width / r.height - img.naturalWidth / img.naturalHeight) > 0.05;
          })
          .map((img) => img.currentSrc),
      );
      expect(distorted, `${path} distorted images`).toEqual([]);
    }
  });
}

test('mobile-only and desktop-only navigation switch at 1024px', async ({ page }) => {
  await page.setViewportSize({ width: 1023, height: 800 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Quick actions' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeHidden();
  await page.setViewportSize({ width: 1024, height: 800 });
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open menu' })).toBeHidden();
  await expect(page.getByRole('navigation', { name: 'Quick actions' })).toBeHidden();
});
