import { expect, test } from '@playwright/test';

test.describe('enquiry flow', () => {
  test('"Enquire" on a card prefills the stone in the quote form', async ({ page }) => {
    await page.goto('/quartz-surfaces');
    await page.getByRole('link', { name: 'Enquire about Calacatta Venezia' }).click();
    await expect(page).toHaveURL(/\/contact\?stone=quartz-surfaces-calacatta-venezia/);
    await expect(page.getByLabel(/Stone of interest/)).toHaveValue('Calacatta Venezia (Quartz Surfaces)');
  });

  test('shortlist several stones and send one enquiry', async ({ page, isMobile }) => {
    await page.goto('/imported-marbles');
    await page.getByRole('button', { name: 'Add Crema Marfil to shortlist' }).click();
    await page.getByRole('button', { name: 'Add Honey Onyx to shortlist' }).click();
    await expect(page.getByRole('button', { name: 'Remove Honey Onyx from shortlist' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    const opener = isMobile
      ? page
          .getByRole('navigation', { name: 'Quick actions' })
          .getByRole('button', { name: 'Shortlist, 2 stones' })
      : page.getByRole('button', { name: 'Shortlist, 2 stones' });
    await opener.click();
    const drawer = page.getByRole('dialog', { name: /Your shortlist/ });
    await expect(drawer.getByRole('listitem')).toHaveCount(2);
    await expect(drawer.getByRole('link', { name: /Send list on WhatsApp/ })).toHaveAttribute(
      'href',
      /Crema%20Marfil/,
    );
    await drawer.getByRole('link', { name: /Request a quote for 2 stones/ }).click();
    await expect(page).toHaveURL(/\/contact\?from=shortlist/);
    await expect(page.getByLabel(/Stone of interest/)).toHaveValue(
      'Crema Marfil (Imported Marbles); Honey Onyx (Imported Marbles)',
    );

    // persists across reloads
    await page.reload();
    await expect(page.getByLabel(/Stone of interest/)).toHaveValue(/Crema Marfil/);
  });

  test('two-step form validates accessibly and posts to the business inbox relay', async ({ page }) => {
    let posted: string | null = null;
    await page.route('https://formsubmit.co/**', async (route) => {
      posted = route.request().postData();
      await route.fulfill({ status: 302, headers: { location: 'http://localhost:4321/thank-you' } });
    });
    await page.goto('/contact');
    await page.getByRole('button', { name: 'Continue' }).click();
    const summary = page.locator('form').getByRole('alert');
    await expect(summary).toContainText('Please enter your name.');
    await expect(summary).toContainText('Please enter a phone number');
    await expect(page.getByLabel(/^Name/)).toHaveAttribute('aria-invalid', 'true');

    await page.getByLabel(/^Name/).fill('Test Customer');
    await page.getByLabel(/^Phone/).fill('98450 12345');
    await page.getByLabel(/Stone of interest/).fill('Kashmir White granite');
    await page.getByLabel(/City \/ site location/).fill('Indiranagar, Bengaluru');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByRole('heading', { name: /A few project details/ })).toBeVisible();
    await page.getByLabel('Quantity', { exact: true }).fill('1200');
    await page.getByLabel('Thickness', { exact: true }).fill('18');
    await page.getByLabel('Site / application').selectOption('Kitchen countertop');
    await page.getByLabel('Additional requirements').fill('Supply and installation');
    await expect(page.getByRole('link', { name: /Send these details on WhatsApp/ })).toHaveAttribute(
      'href',
      /Kashmir%20White/,
    );
    await page.waitForTimeout(2600); // human-speed guard in the form
    await page.getByRole('button', { name: /Get my custom quote/ }).click();
    await expect(page).toHaveURL(/\/thank-you$/);
    const body = new URLSearchParams(posted ?? '');
    expect(body.get('name')).toBe('Test Customer');
    expect(body.get('stone')).toBe('Kashmir White granite');
    expect(body.get('quantity')).toBe('1200');
    expect(body.get('_captcha')).toBe('true');
    expect(body.get('_honey')).toBe('');
    expect(body.get('_next')).toBe('https://skstonesindia.com/thank-you');
  });

  test('form works without JavaScript (both steps visible, native POST)', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto('/contact');
    const form = page.locator('form[action="https://formsubmit.co/info@skstonesindia.com"]');
    await expect(form).toHaveAttribute('method', 'POST');
    await expect(form.getByLabel(/^Name/)).toBeVisible();
    await expect(form.getByLabel('Additional requirements')).toBeVisible();
    await ctx.close();
  });

  test('WhatsApp and phone CTAs use the business number', async ({ page }) => {
    await page.goto('/');
    const wa = page.locator('a[href^="https://wa.me/"]');
    expect(await wa.count()).toBeGreaterThan(2);
    for (const href of await wa.evaluateAll((els) => els.map((e) => e.getAttribute('href'))))
      expect(href).toMatch(/^https:\/\/wa\.me\/917022630994/);
    await expect(page.locator('a[href="tel:+917022630994"]').first()).toBeAttached();
  });
});
