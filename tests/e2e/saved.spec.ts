import { expect, test, type Page } from '@playwright/test';

const openSavedList = async (page: Page, isMobile: boolean) => {
  if (isMobile) await page.locator('.sk-saved-pill').click();
  else await page.locator('.sk-header-saved').click();
  const panel = page.getByRole('dialog', { name: /Saved stones/ });
  await expect(panel).toBeVisible();
  return panel;
};

test.describe('saved list', () => {
  test('save on one page, reload, open the list on another page, quote form lists the stones', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/granites');
    const save = page.locator('.sk-save[data-save-name="Tan Brown"]');
    await save.scrollIntoViewIfNeeded();
    await save.click();
    await expect(save).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('status')).toContainText('Saved Tan Brown');
    await page.locator('.sk-save[data-save-name="Tiger Skin"]').click();

    await page.reload();
    await expect(page.locator('.sk-save[data-save-name="Tan Brown"]')).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await page.goto('/kota-stones');
    const panel = await openSavedList(page, isMobile);
    await expect(panel.getByRole('listitem')).toHaveCount(2);
    await expect(panel).toContainText('Tan Brown');
    await expect(panel).toContainText('Tiger Skin');

    // WhatsApp message names every stone
    const wa = await panel.getByRole('link', { name: /Send on WhatsApp/ }).getAttribute('href');
    const text = decodeURIComponent(new URL(wa!).searchParams.get('text')!);
    expect(text).toContain('Tan Brown (Indian Granites)');
    expect(text).toContain('Tiger Skin (Indian Granites)');

    await panel.getByRole('link', { name: 'Get a quote for these' }).click();
    await expect(page).toHaveURL(/\/contact\/?\?saved=1/);
    const form = page.getByRole('dialog', { name: 'Get in touch' });
    await expect(form).toBeVisible();
    await expect(form.locator('.sk-chip')).toHaveCount(2);
    await expect(form.locator('input[name="stones"]')).toHaveValue(
      'Tan Brown (Indian Granites); Tiger Skin (Indian Granites)',
    );
    await expect(form.locator('input[name="products"]')).toHaveValue(/granites-tan-brown/);
    await expect(form.locator('#stoneType')).toHaveValue('granites');
    await expect(form).toContainText('Shortlisted stones are added automatically');
  });

  test('remove with undo, clear with undo', async ({ page, isMobile }) => {
    await page.goto('/granites');
    await page.locator('.sk-save').nth(0).click();
    await page.locator('.sk-save').nth(1).click();
    const panel = await openSavedList(page, isMobile);
    await panel
      .getByRole('button', { name: /^Remove / })
      .first()
      .click();
    await expect(panel.getByRole('listitem')).toHaveCount(1);
    await page.getByRole('status').getByRole('button', { name: 'Undo' }).click();
    await expect(panel.getByRole('listitem')).toHaveCount(2);
    await panel.getByRole('button', { name: 'Clear list' }).click();
    await expect(panel).toContainText('No saved stones yet');
    await page.getByRole('status').getByRole('button', { name: 'Undo' }).click();
    await expect(panel.getByRole('listitem')).toHaveCount(2);
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
  });

  test('lightbox: save and enquire about one stone', async ({ page }) => {
    await page.goto('/kota-stones');
    await page.locator('.product-item-image').first().click();
    const box = page.locator('.product-lightbox.active');
    await expect(box).toBeVisible();
    await box.getByRole('button', { name: /^Save / }).click();
    await expect(box.getByRole('button', { name: /^Saved:/ })).toHaveAttribute('aria-pressed', 'true');
    await box.getByRole('link', { name: 'Enquire about this stone' }).click();
    await expect(page).toHaveURL(/\/contact\/?\?stone=kota-stones-shabad-yellow-leather/);
    const form = page.getByRole('dialog', { name: 'Get in touch' });
    await expect(form.locator('.sk-chip')).toHaveText(['Shabad Yellow Leather×']);
  });

  test('shared list page: read-only, Save all, noindex', async ({ page }) => {
    await page.goto('/saved?ids=granites-tan-brown,granites-tiger-skin,not-a-stone');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.locator('.sk-shared-item')).toHaveCount(2);
    await expect(page.getByText('1 stone is no longer in our catalogue')).toBeVisible();
    await page.getByRole('button', { name: 'Save all 2' }).click();
    await expect(page.getByRole('button', { name: 'All saved' })).toBeDisabled();
  });

  test('phone pill appears after the first save and hides while a sheet is open', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'phone only');
    await page.goto('/granites');
    await expect(page.locator('.sk-saved-pill')).toHaveCount(0);
    await page.locator('.sk-save').first().click();
    const pill = page.locator('.sk-saved-pill');
    await expect(pill).toHaveText(/Saved \(1\)/);
    await page.locator('.mnav-item[data-mnav="more"]').click();
    await expect(pill).toBeHidden();
    await expect(page.locator('.sk-sheet-saved')).toContainText('Saved stones (1)');
  });
});
