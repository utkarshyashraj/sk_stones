import { expect, test, type Page } from '@playwright/test';
import { featuresReady } from './ready';

const pickCollection = async (page: Page, isMobile: boolean, name: string) => {
  if (isMobile) {
    await page.locator('.sk-filter-open:visible').click();
    const sheet = page.getByRole('dialog', { name: 'Filters' });
    await sheet.getByRole('checkbox', { name: new RegExp(name) }).check();
    await sheet.getByRole('button', { name: /^Show \d+ stones?$/ }).click();
    await expect(sheet).toBeHidden();
  } else {
    await page.getByRole('button', { name: /^Collection/ }).click();
    await page
      .locator('.sk-popover')
      .getByRole('checkbox', { name: new RegExp(name) })
      .check();
    await page.keyboard.press('Escape');
  }
};
const visibleCards = (page: Page) => page.locator('.product-grid .product-item:visible');

test.describe('filters', () => {
  test('hub page: collection facet with live counts; URL round-trip survives reload and Back', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/tiles');
    await featuresReady(page);
    await expect(visibleCards(page)).toHaveCount(88);
    await pickCollection(page, isMobile, 'Brillo Collection');
    await expect(page).toHaveURL(/\?collection=brillo-collection/);
    await expect(visibleCards(page)).toHaveCount(9);
    await expect(page.locator('.product-grid-section .product-count')).toHaveText('9 of 88 Varieties');
    await expect(
      page.getByRole('button', { name: /Remove filter Collection: Brillo Collection/ }),
    ).toBeVisible();

    await page.reload();
    await expect(visibleCards(page)).toHaveCount(9);

    await page.goto('/about');
    await page.goBack();
    await expect(page).toHaveURL(/\?collection=brillo-collection/);
    await expect(visibleCards(page)).toHaveCount(9);
  });

  test('counts never dead-end: other collections show their own totals', async ({ page, isMobile }) => {
    test.skip(isMobile, 'popover counts (desktop); the sheet shows the same numbers');
    await page.goto('/tiles?q=calacatta');
    await featuresReady(page);
    await page.getByRole('button', { name: /^Collection/ }).click();
    const pop = page.locator('.sk-popover');
    await expect(pop.getByRole('checkbox', { name: /Ittaca Collection/ })).toBeEnabled();
    await expect(pop.locator('input[type=checkbox]:disabled').first()).toBeVisible(); // would leave none
  });

  test('search within, sort, clear all, empty state', async ({ page }) => {
    await page.goto('/granites');
    await featuresReady(page);
    await page.getByRole('searchbox', { name: 'Search within Indian Granites' }).fill('black');
    await expect(visibleCards(page)).toHaveCount(7);
    await page.getByRole('combobox', { name: 'Sort stones' }).selectOption('name-asc');
    await expect(visibleCards(page).locator('h4').first()).toHaveText('Absolute Black');
    await expect(page).toHaveURL(/q=black.*sort=name-asc/);
    await page.getByRole('searchbox', { name: 'Search within Indian Granites' }).fill('zzzz');
    await expect(page.getByText('No stones match these filters.')).toBeVisible();
    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(visibleCards(page)).toHaveCount(48);
  });

  test('the viewer steps only through visible stones', async ({ page }) => {
    await page.goto('/granites?q=black');
    await featuresReady(page);
    await expect(visibleCards(page)).toHaveCount(7);
    await visibleCards(page).first().locator('.product-item-image').click();
    const box = page.locator('.product-lightbox.active');
    await expect(box.locator('.product-lightbox-counter')).toHaveText('1 / 7');
    await page.keyboard.press('ArrowLeft');
    await expect(box.locator('.product-lightbox-counter')).toHaveText('7 / 7');
  });

  test('unknown values in a shared link are ignored with a notice', async ({ page }) => {
    await page.goto('/tiles?collection=brillo-collection,no-such-collection&colour=Purple');
    await featuresReady(page);
    await expect(page.getByText('Some filters no longer apply.')).toBeVisible();
    await expect(visibleCards(page)).toHaveCount(9);
  });

  test('a deep link to a filtered-out stone clears the filters so it can show', async ({ page }) => {
    await page.goto('/granites?q=black#stone=granites-tan-brown');
    await expect(page.locator('.product-lightbox.active .product-lightbox-title')).toHaveText('Tan Brown');
    await expect(visibleCards(page)).toHaveCount(48);
  });

  test('small pages get no filter bar; product HTML keeps every stone', async ({ page, request }) => {
    await page.goto('/feature-wall');
    await expect(page.locator('.sk-filterbar')).toHaveCount(0);
    const html = await (await request.get('/granites?collection=x')).text();
    expect((html.match(/class="product-item /g) || []).length).toBe(48);
    expect(html).toMatch(/<link rel="canonical" href="https:\/\/skstonesindia\.com\/granites"/);
  });
});
