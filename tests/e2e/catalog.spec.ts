import { expect, test } from '@playwright/test';

test.describe('product pages (one data-driven template)', () => {
  test('a collection lists exactly its reference products, with the reference count label', async ({
    page,
  }) => {
    await page.goto('/granites');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Exquisite Indian Granites');
    await expect(page.locator('.product-count')).toHaveText('48 Varieties');
    await expect(page.locator('.product-item')).toHaveCount(48);
    await expect(page.locator('.product-overview-section')).toBeVisible();
  });

  test('verified name corrections are kept (Kota, cobbles, spelling)', async ({ page }) => {
    await page.goto('/cobble-stones');
    await expect(page.locator('.product-item h4').first()).toHaveText('Charcoal Grey Cobble');
    await page.goto('/indian-marbles');
    await expect(page.locator('.product-item h4', { hasText: 'Katni' })).toHaveCount(1);
    await page.goto('/quatrz-surfaces');
    await expect(page.locator('.product-item h4', { hasText: 'Arctic White' })).toHaveCount(1);
  });

  test('lightbox: open from a card, step with buttons and keys, close with Escape (focus returns)', async ({
    page,
  }) => {
    await page.goto('/kota-stones');
    const first = page.locator('.product-item').first();
    await first.scrollIntoViewIfNeeded();
    await first.click();
    const box = page.locator('.product-lightbox.active');
    await expect(box).toBeVisible();
    await expect(box.locator('.product-lightbox-counter')).toHaveText('1 / 8');
    await expect(box.locator('.product-lightbox-title')).toHaveText('Shabad Yellow Leather');
    await box.getByRole('button', { name: 'Next' }).click();
    await expect(box.locator('.product-lightbox-counter')).toHaveText('2 / 8');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect(box.locator('.product-lightbox-counter')).toHaveText('8 / 8');
    await page.keyboard.press('Escape');
    await expect(page.locator('.product-lightbox.active')).toHaveCount(0);
    await expect(first).toBeFocused();
  });

  test('magnifier lens follows the pointer (desktop)', async ({ page, isMobile }) => {
    test.skip(isMobile, 'hover');
    await page.goto('/granites');
    await page.locator('.product-item').first().click();
    const img = page.locator('.product-lightbox-img');
    await expect(img).toBeVisible();
    const b = (await img.boundingBox())!;
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await expect(page.locator('.product-magnifier.is-visible')).toHaveCount(1);
    await page.mouse.move(5, 5);
    await expect(page.locator('.product-magnifier.is-visible')).toHaveCount(0);
  });

  test('overview pages: Marbles and Products show collection cards', async ({ page }) => {
    await page.goto('/marbles');
    await expect(page.locator('.category-card')).toHaveCount(2);
    await page.goto('/products');
    await expect(page.locator('.category-card')).toHaveCount(9);
    await page
      .locator('.category-card', { hasText: 'Tiles' })
      .getByRole('link', { name: /Know More/ })
      .last()
      .click();
    await expect(page).toHaveURL(/\/tiles\/?$/);
    await expect(page.locator('.product-item')).toHaveCount(88);
  });
});
