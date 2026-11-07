import { expect, test } from '@playwright/test';

test.describe('contact page form', () => {
  test('both cities shown; Open Form sets the location; required fields block submission', async ({
    page,
  }) => {
    await page.goto('/contact');
    await expect(page.getByRole('heading', { level: 2, name: 'Bangalore' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Hyderabad' })).toBeVisible();

    await page.locator('[data-open-form][data-location="Hyderabad"]').click();
    const modal = page.getByRole('dialog', { name: 'Get in touch' });
    await expect(modal).toBeVisible();
    await expect(modal.locator('#formLocationLabel')).toHaveText('Hyderabad');
    await expect(modal.locator('#preferredLocation')).toHaveValue('Hyderabad');
    await expect(modal.locator('#name')).toBeFocused();

    // Browser validation stops an incomplete submission (no navigation to FormSubmit).
    await modal.getByRole('button', { name: 'Get My Custom Quote' }).click();
    await expect(modal).toBeVisible();
    expect(await modal.locator('#name').evaluate((e: HTMLInputElement) => e.validity.valueMissing)).toBe(
      true,
    );
    for (const id of ['#name', '#phone', '#email', '#stoneType'])
      await expect(modal.locator(id)).toHaveAttribute('required', '');

    const form = modal.locator('form#contactForm');
    await expect(form).toHaveAttribute('action', 'https://formsubmit.co/info@skstonesindia.com');
    await expect(form).toHaveAttribute('method', 'POST');
    await expect(modal.locator('input[name="_next"]')).toHaveValue(/\/thank-you\/?$/);

    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
    await expect(page.locator('[data-open-form][data-location="Hyderabad"]')).toBeFocused();
  });

  test('?submitted=1 reopens the form with the success banner', async ({ page }) => {
    await page.goto('/contact?submitted=1');
    await expect(page.locator('#formSuccessBanner')).toHaveClass(/visible/);
    await expect(page.locator('#formSuccessBanner')).toContainText(
      'Thank you! Your quote request was sent successfully.',
    );
  });

  test('thank-you page offers the way back', async ({ page }) => {
    await page.goto('/thank-you');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Thank You!/);
    await expect(page.getByRole('link', { name: 'Back to Home' })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });
});
