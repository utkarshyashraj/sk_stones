import { expect, test } from '@playwright/test';
import { hydrated } from './ready';

test.describe('search', () => {
  test('keyboard: "/" opens, typing suggests, arrows move, Enter opens the stone, Escape closes', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'keyboard shortcut is a desktop affordance');
    await page.goto('/');
    await hydrated(page);
    await page.keyboard.press('/');
    const dlg = page.getByRole('dialog', { name: 'Search stones' });
    const input = dlg.getByRole('combobox');
    await expect(input).toBeFocused();
    await page.keyboard.type('travertne'); // typo on purpose
    await expect(dlg.getByRole('option').first()).toContainText(/Travertine/i);
    await page.keyboard.press('ArrowDown');
    const first = dlg.getByRole('option').first();
    await expect(first).toHaveAttribute('aria-selected', 'true');
    await expect(input).toHaveAttribute('aria-activedescendant', (await first.getAttribute('id'))!);
    await page.keyboard.press('Escape');
    await expect(dlg).toBeHidden();

    await page.keyboard.press('/');
    await expect(input).toBeFocused();
    await page.keyboard.type('tiger skin');
    await expect(dlg.getByRole('option').first()).toContainText('Tiger Skin');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/granites\/?#stone=granites-tiger-skin/);
    await expect(page.locator('.product-lightbox.active .product-lightbox-title')).toHaveText('Tiger Skin');
  });

  test('groups: stones, collections, services and uses, projects', async ({ page, isMobile }) => {
    await page.goto('/');
    if (isMobile) await page.locator('.sk-search-mobile').click();
    else await page.getByRole('button', { name: /Search stones/ }).click();
    const dlg = page.getByRole('dialog', { name: 'Search stones' });
    await dlg.getByRole('combobox').fill('Quatrz');
    await expect(dlg.getByRole('option', { name: /Quartz Surfaces.*\(Collections\)/ })).toBeVisible();
    await dlg.getByRole('combobox').fill('marriott');
    await expect(dlg.getByRole('option', { name: /JW Marriott.*\(Projects\)/ })).toBeVisible();
    await dlg.getByRole('combobox').fill('landscap');
    await expect(
      dlg.getByRole('option', { name: /Landscaping.*\(Services and uses\)/ }).first(),
    ).toBeVisible();
  });

  test('no results: closest collection and ask links prefilled with the query', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/');
    if (isMobile) await page.locator('.sk-search-mobile').click();
    else await page.getByRole('button', { name: /Search stones/ }).click();
    const dlg = page.getByRole('dialog', { name: 'Search stones' });
    await dlg.getByRole('combobox').fill('zzqqxx tiles');
    await expect(dlg).toContainText('No stones match');
    await expect(dlg.getByRole('link', { name: 'Tiles' })).toBeVisible();
    const wa = await dlg.getByRole('link', { name: /Ask on WhatsApp/ }).getAttribute('href');
    expect(decodeURIComponent(wa!)).toContain('zzqqxx tiles');
    await dlg.getByRole('link', { name: 'Ask in a quote' }).click();
    await expect(page).toHaveURL(/\/contact\/?\?ask=zzqqxx/);
    await expect(page.getByRole('dialog', { name: 'Get in touch' })).toContainText(
      'Asking about: zzqqxx tiles',
    );
  });

  test('phone: the back button closes the overlay without leaving the page', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'phone behaviour');
    await page.goto('/granites');
    await page.locator('.sk-search-mobile').click();
    const dlg = page.getByRole('dialog', { name: 'Search stones' });
    await expect(dlg).toBeVisible();
    await page.goBack();
    await expect(dlg).toBeHidden();
    await expect(page).toHaveURL(/\/granites\/?$/);
  });

  test('phone: search field in the Products sheet opens search', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'phone behaviour');
    await page.goto('/');
    await page.locator('.mnav-item[data-mnav="products"]').click();
    await page.locator('.sk-sheet-search').click();
    await expect(page.getByRole('dialog', { name: 'Search stones' })).toBeVisible();
  });

  test('/search results page: refine in place, open a result in the viewer, noindex', async ({ page }) => {
    await page.goto('/search?q=calacata');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.locator('.sk-search-grid .product-item')).toHaveCount(6);
    await page.getByRole('searchbox', { name: 'Search stones' }).fill('black galaxy');
    await expect(page).toHaveURL(/q=black\+galaxy/);
    await expect(page.locator('.sk-search-grid .product-item h4').first()).toHaveText('Black Galaxy');
    await page.locator('.sk-search-grid .product-item-image').first().click();
    await expect(page.locator('.product-lightbox.active .product-lightbox-title')).toHaveText('Black Galaxy');
  });
});
