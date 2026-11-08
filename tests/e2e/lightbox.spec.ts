import { expect, test } from '@playwright/test';

test.describe('stone viewer detail panel', () => {
  test('shows collection, save, enquire and related stones that switch the photo', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/granites#stone=granites-tan-brown');
    const box = page.locator('.product-lightbox.active');
    await expect(box.locator('.product-lightbox-title')).toHaveText('Tan Brown');
    await expect(box.locator('.sk-lb-collection')).toHaveText('Indian Granites');
    await expect(box.getByRole('link', { name: 'Enquire about this stone' })).toHaveAttribute(
      'href',
      /\/contact\?stone=granites-tan-brown$/,
    );
    await expect(box.getByRole('button', { name: /^Save/ })).toBeVisible();

    const toggle = box.getByRole('button', { name: 'Details' });
    const related = box.locator('.sk-lb-related li');
    if (isMobile) {
      await expect(related.first()).toBeHidden(); // folded away so the photo stays large
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    } else {
      await expect(toggle).toBeHidden(); // desktop column always shows details
    }
    await expect(related).toHaveCount(6);
    // Empty facts are left out: no row without a value.
    for (const dd of await box.locator('.sk-lb-details dd').all()) await expect(dd).not.toBeEmpty();

    const next = (await related.first().locator('span').textContent())!.trim();
    await related.first().getByRole('button').click();
    await expect(box.locator('.product-lightbox-title')).toHaveText(next);
    await expect(page).toHaveURL(/#stone=granites-/);
  });

  test('magnifier still works on the photo', async ({ page, isMobile }) => {
    test.skip(isMobile, 'hover magnifier (desktop)');
    await page.goto('/granites#stone=granites-tan-brown');
    const frame = page.locator('.product-lightbox.active .product-lightbox-frame');
    await expect(frame.locator('img')).toBeVisible();
    const b = (await frame.boundingBox())!;
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await expect(page.locator('.product-magnifier.is-visible')).toBeVisible();
  });

  test('gallery photos (no stone) keep the plain caption', async ({ page }) => {
    await page.goto('/flooring-executions');
    const tile = page.locator('.gallery-item[data-sk-click]').first();
    await tile.scrollIntoViewIfNeeded();
    await tile.click();
    const box = page.locator('.product-lightbox.active');
    await expect(box).toBeVisible();
    await expect(box.locator('.sk-lb-actions')).toHaveCount(0);
  });
});
