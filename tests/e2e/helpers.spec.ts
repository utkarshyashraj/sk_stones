import { expect, test } from '@playwright/test';
import { featuresReady } from './ready';

test.describe('conversion helpers', () => {
  test('calculator from the quote form fills Quantity and the unit', async ({ page }) => {
    await page.goto('/contact?ask=x');
    const form = page.locator('#contactForm');
    await form.getByRole('button', { name: 'Not sure? Calculate' }).click();
    const calc = page.getByRole('dialog', { name: 'How much stone do I need?' });
    await calc.getByLabel('Area 1 length').fill('10');
    await calc.getByLabel('Area 1 width').fill('12');
    await calc.getByRole('button', { name: '+ Add another area' }).click();
    await calc.getByLabel('Area 2 length').fill('2');
    await calc.getByLabel('Area 2 width').fill('2');
    await calc.getByLabel('Area 2 unit').selectOption('m');
    // (120 + 43.06) × 1.1 = 179.4 → 180 sq ft, 16.7 sq m
    await expect(calc.locator('.sk-calc-result strong')).toHaveText('180 sq ft');
    await expect(calc.locator('.sk-calc-result')).toContainText('16.7 sq m');
    await calc.getByRole('button', { name: 'Use this in my quote' }).click();
    await expect(calc).toBeHidden();
    await expect(form.locator('#quantity')).toHaveValue('180 sq ft (16.7 sq m) incl. 10% wastage');
    await expect(form.locator('#sizeUnit')).toHaveValue('sqft');
    await expect(page.locator('#contactFormModal')).toBeVisible(); // the form stayed open
  });

  test('calculator from a product page opens the form prefilled', async ({ page }) => {
    await page.goto('/granites');
    await page.getByRole('button', { name: 'Calculate area' }).click();
    const calc = page.getByRole('dialog', { name: 'How much stone do I need?' });
    await calc.getByLabel('Area 1 length').fill('10');
    await calc.getByLabel('Area 1 width').fill('10');
    await calc.getByLabel(/Extra for cuts/).fill('0');
    await calc.getByRole('button', { name: 'Use this in my quote' }).click();
    await expect(page).toHaveURL(/\/contact\?qty=/);
    await expect(page.locator('#contactForm #quantity')).toHaveValue('100 sq ft (9.3 sq m)');
  });

  test('recently viewed: stones opened in the viewer appear on /products, newest first, and clear', async ({
    page,
  }) => {
    await page.goto('/granites#stone=granites-tan-brown');
    await expect(page.locator('.product-lightbox.active')).toBeVisible();
    const title = page.locator('.product-lightbox.active .product-lightbox-title');
    await expect(title).toHaveText('Tan Brown');
    await page.keyboard.press('ArrowRight');
    await expect(title).not.toHaveText('Tan Brown');
    const second = await title.textContent();
    await expect
      .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('sk-recent-v1') ?? '[]').length))
      .toBe(2);
    await page.keyboard.press('Escape');
    await page.goto('/products');
    await featuresReady(page);
    const strip = page.getByRole('region', { name: 'Recently viewed' });
    await expect(strip.getByRole('link')).toHaveCount(2);
    await expect(strip.getByRole('link').first()).toHaveText(second!);
    await strip.getByRole('button', { name: 'Clear' }).click();
    await expect(strip).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('sk-recent-v1'))).toBeNull();
  });

  test('request samples from the viewer and the saved list', async ({ page }) => {
    await page.goto('/granites#stone=granites-tan-brown');
    await page
      .locator('.product-lightbox.active .sk-lb-actions')
      .getByRole('button', { name: /^Save/ })
      .click();
    await page.getByRole('link', { name: 'Request a sample' }).click();
    await expect(page).toHaveURL(/\/contact\?stone=granites-tan-brown&request=samples/);
    await expect(page.locator('.sk-request-label')).toHaveText('Sample request');
    await expect(page.locator('#contactForm .sk-chip')).toHaveText(/Tan Brown/);

    await page.goto('/granites');
    await page.locator('.sk-header-saved:visible, .sk-saved-pill:visible').first().click();
    const panel = page.getByRole('dialog', { name: /Saved stones/ });
    await panel.getByRole('link', { name: 'Request samples' }).click();
    await expect(page).toHaveURL(/\/contact\?saved=1&request=samples/);
    await expect(page.locator('#contactForm input[name=request]')).toHaveValue('Sample request');
  });

  test('phone More sheet has one-tap Call, WhatsApp and Quote', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'bottom bar is phone-only');
    await page.goto('/about');
    await page.getByRole('button', { name: 'More' }).click();
    const quick = page.locator('.sk-quick');
    await expect(quick.getByRole('link', { name: 'Call' })).toHaveAttribute('href', /^tel:/);
    await expect(quick.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('href', /wa\.me|whatsapp/);
    await expect(quick.getByRole('link', { name: 'Quote' })).toHaveAttribute('href', /\/contact$/);
  });
});
