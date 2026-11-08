import { expect, test } from '@playwright/test';

test.describe('help me choose', () => {
  test('from /products: pick a place, land on filtered results, quote and save them', async ({ page }) => {
    await page.goto('/products');
    await page.getByRole('button', { name: 'Help me choose' }).click();
    const dlg = page.getByRole('dialog', { name: 'Help me choose' });
    await expect(dlg.getByText('Where will the stone go?')).toBeVisible();
    // Colour and origin aren't covered by business data yet: one step only. No application value
    // stands for staircases yet, so that place isn't offered.
    await expect(dlg.getByText(/Step \d of/)).toHaveCount(0);
    await expect(dlg.getByRole('button', { name: 'Staircase' })).toHaveCount(0);
    await dlg.getByRole('button', { name: 'Bathroom' }).click();

    await expect(page).toHaveURL(/\/search\?application=Bathrooms&guide=1&for=Bathroom/);
    await expect(page.getByRole('heading', { name: 'Stones for bathroom' })).toBeVisible();
    const cards = page.locator('.sk-search-grid .product-item');
    const n = await cards.count();
    expect(n).toBeGreaterThan(0);

    const quote = page.getByRole('link', { name: 'Get a quote for these' });
    await expect(quote).toHaveAttribute('href', /\/contact\?stones=/);
    await page.getByRole('button', { name: `Save all ${n}` }).click();
    await expect(page.getByRole('button', { name: 'All saved' })).toBeDisabled();
    await quote.click();
    await expect(page.locator('#contactForm .sk-chip')).toHaveCount(n);
  });

  test('from the search overlay before typing; large result sets ask instead of listing', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/about');
    if (isMobile) await page.locator('.sk-search-mobile').click();
    else await page.getByRole('button', { name: /Search stones/ }).click();
    await page
      .getByRole('dialog', { name: 'Search stones' })
      .getByRole('button', { name: 'Help me choose' })
      .click();
    const dlg = page.getByRole('dialog', { name: 'Help me choose' });
    await dlg.getByRole('button', { name: 'Flooring' }).click();
    await expect(page).toHaveURL(/\/search\?application=Flooring&guide=1/);
    await expect(page.getByRole('button', { name: /^Save all/ })).toBeDisabled(); // more than 30
    await expect(page.getByRole('link', { name: 'Get a quote for these' })).toHaveAttribute(
      'href',
      /\/contact\?ask=Stones%20for%20flooring/,
    );
  });
});
