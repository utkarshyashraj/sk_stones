import { expect, test, type Page } from '@playwright/test';

const count = (page: Page) => page.locator('p[aria-live="polite"][aria-atomic="true"]').first();
const openFilters = async (page: Page, isMobile: boolean) => {
  if (isMobile) await page.getByRole('button', { name: /^Filters/ }).click();
};

test.describe('catalog explorer', () => {
  test('category page lists every product in server-rendered HTML', async ({ request }) => {
    const html = await (await request.get('/indian-granites')).text();
    expect((html.match(/Quick view: /g) || []).length).toBe(49);
    expect(html).toContain('"@type":"ItemList"');
  });

  test('search, filters, sorting, clear-all and empty state', async ({ page, isMobile }) => {
    await page.goto('/granites');
    await expect(count(page)).toContainText('61 stones');
    await page.getByLabel('Search within Granites stones').fill('white');
    await expect(count(page)).toContainText(/\d+ stones of 61 matching “white”/);
    await expect(page).toHaveURL(/\?q=white/);

    await openFilters(page, isMobile);
    await page.getByRole('checkbox', { name: /Imported Granites/ }).check();
    await expect(count(page)).toContainText(/stones? of 61/);
    const names = await page.locator('article h3').allTextContents();
    expect(names.length).toBeGreaterThan(0);
    for (const n of names) expect(n.toLowerCase()).toContain('white');

    await page.getByLabel('Sort').selectOption('name-desc');
    const sorted = await page.locator('article h3').allTextContents();
    expect(sorted).toEqual([...sorted].sort((a, b) => b.localeCompare(a)));

    await page.getByLabel('Search within Granites stones').fill('zzzz-no-such-stone');
    await expect(page.getByRole('heading', { name: 'No stones match these filters' })).toBeVisible();
    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(count(page)).toContainText('61 stones');
    await expect(page).not.toHaveURL(/[?&](q|collection)=/); // the chosen sort is intentionally kept
  });

  test('filters and query survive a reload (shareable URL)', async ({ page }) => {
    await page.goto('/natural-stones?collection=cobble-stones&colour=Black');
    await expect(count(page)).toContainText(/stones? of 65/);
    for (const n of await page.locator('article h3').allTextContents())
      expect(n).toMatch(/Black|Basalt|Onyx|Graphite|Jet|Charcoal/);
  });

  test('global search page finds stones across categories', async ({ page }) => {
    await page.goto('/search?q=travertine');
    await expect(count(page)).toContainText(/\d+ stones? of 460 matching “travertine”/);
    await expect(page.locator('article').first()).toBeVisible();
  });

  test('header search dialog shows instant results', async ({ page, isMobile }) => {
    await page.goto('/');
    if (isMobile)
      await page
        .getByRole('navigation', { name: 'Quick actions' })
        .getByRole('button', { name: 'Search' })
        .click();
    else await page.getByRole('button', { name: 'Search stones' }).click();
    const dialog = page.getByRole('dialog', { name: 'Search our stones' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('searchbox').fill('kashmir');
    await expect(dialog.getByRole('link', { name: /Kashmir White/ }).first()).toBeVisible();
    await dialog.getByRole('searchbox').press('Enter');
    await expect(page).toHaveURL(/\/search\?q=kashmir/);
  });
});

test.describe('product lightbox', () => {
  test('opens from a card, navigates with buttons/keys and closes with Escape', async ({ page }) => {
    await page.goto('/feature-wall');
    await page.getByRole('button', { name: 'Quick view: Petals Pattern' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { level: 2 })).toHaveText('Petals Pattern');
    await expect(dialog).toContainText('Feature Walls');
    await expect(page).toHaveURL(/#product=feature-wall-petals-pattern/);
    await dialog.getByRole('button', { name: 'Next stone' }).click();
    await expect(dialog.getByRole('heading', { level: 2 })).toHaveText('Leaf Pattern Wall Art');
    await page.keyboard.press('ArrowLeft');
    await expect(dialog.getByRole('heading', { level: 2 })).toHaveText('Petals Pattern');
    await expect(dialog.getByRole('link', { name: /Enquire about this stone/ })).toHaveAttribute(
      'href',
      /\/contact\?stone=feature-wall-petals-pattern/,
    );
    await expect(dialog.getByRole('link', { name: /Ask on WhatsApp/ })).toHaveAttribute(
      'href',
      /^https:\/\/wa\.me\/917022630994\?text=/,
    );
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('button', { name: 'Quick view: Petals Pattern' })).toBeFocused();
  });

  test('deep link opens the right product', async ({ page }) => {
    await page.goto('/kota-stones#product=kota-stones-kadpa-black-mirror-polished');
    await expect(page.getByRole('dialog').getByRole('heading', { level: 2 })).toHaveText(
      'Kadpa Black Mirror Polished',
    );
  });
});

test.describe('corrected product labels render on the live page', () => {
  test('Kota Stones images carry their verified names', async ({ request }) => {
    const html = await (await request.get('/kota-stones')).text();
    // first card is now the Shabad Yellow Leather photo, not the courtyard lifestyle photo
    expect(html.indexOf('Shabad Yellow Leather')).toBeGreaterThan(-1);
    expect(html).not.toMatch(/Leathere\b/);
    expect(html).toContain('Kadpa Black Leather');
  });
});
