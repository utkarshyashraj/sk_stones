import { expect, test } from '@playwright/test';

test.describe('homepage (reference port)', () => {
  test('sections in reference order, header CTA and footer details', async ({ page, isMobile }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { level: 1, name: /Uncompromising Quality\. Exceptional Surfaces\./ }),
    ).toBeVisible();
    await expect(page.locator('.manifesto-trust-pill')).toHaveText(/Architects\s*Builders\s*Developers/);
    const order = await page
      .locator('main > section, main > div.marquee')
      .evaluateAll((els) => els.map((e) => e.className.split(' ')[0]));
    expect(order).toEqual([
      'sk-manifesto',
      'marquee',
      'about-section',
      'services-slider-section',
      'process-section',
      'trust-section',
      'why-section',
      'gallery-section',
      'faq-section',
      'cta-section',
      'testimonials-section',
    ]);
    await expect(page.locator('.service-slide')).toHaveCount(7);
    await expect(page.locator('.why-card')).toHaveCount(4);
    await expect(page.locator('.gallery-item')).toHaveCount(6);
    await expect(page.locator('.testimonial-card')).toHaveCount(6);
    if (!isMobile) await expect(page.locator('a.header-cta')).toHaveAttribute('href', 'tel:+917022630994');
    else await expect(page.locator('a.header-contact-mobile')).toHaveAttribute('href', /\/contact/);
    const footer = page.locator('footer');
    await expect(footer).toContainText('+91 70226 30994');
    await expect(footer).toContainText('info@skstonesindia.com');
    await expect(footer).toContainText('Koramangala 4th Block');
    await expect(footer).toContainText('Vattinagulapally, Hyderabad');
    await expect(footer).toContainText('© 2026 S K Stones India');
  });

  test('stats count up from 0 when scrolled into view (desktop)', async ({ page, isMobile }) => {
    test.skip(isMobile, 'stats are hidden on the phone homepage, as on the reference');
    await page.goto('/');
    const first = page.locator('#trust .counter').first();
    await expect(first).toHaveText('0');
    await first.scrollIntoViewIfNeeded();
    await expect(first).toHaveText('200', { timeout: 5000 });
    await expect(page.locator('#trust .counter').nth(3)).toHaveText('4.8');
  });

  test('FAQ: one answer open at a time', async ({ page, isMobile }) => {
    await page.goto(isMobile ? '/?view=more#faq' : '/');
    const q = page.locator('#faq .faq-question');
    await q.nth(0).click();
    await expect(q.nth(0)).toHaveAttribute('aria-expanded', 'true');
    await q.nth(2).click();
    await expect(q.nth(2)).toHaveAttribute('aria-expanded', 'true');
    await expect(q.nth(0)).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#faq .faq-item.open')).toHaveCount(1);
  });

  test('services slider arrows scroll the cards', async ({ page, isMobile }) => {
    test.skip(isMobile, 'arrows are hidden on phones (swipe)');
    await page.goto('/');
    const slider = page.locator('#servicesSlider');
    await slider.scrollIntoViewIfNeeded();
    const before = await slider.evaluate((e) => e.scrollLeft);
    await page.locator('#servicesScrollRight').click();
    await expect.poll(() => slider.evaluate((e) => e.scrollLeft)).toBeGreaterThan(before);
  });

  test('phone homepage hides the deferred sections; the More view shows them', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'phone behaviour');
    await page.goto('/');
    for (const id of ['#process', '#trust', '#faq', '#testimonials', '#who-we-are'])
      await expect(page.locator(id)).toBeHidden();
    await page.goto('/?view=more#faq');
    await expect(page.locator('#faq')).toBeVisible();
    await expect(page.locator('#manifesto')).toBeHidden();
    await expect(page.locator('.mnav-item[data-mnav="more"]')).toHaveClass(/is-active/);
  });
});

test.describe('navigation', () => {
  test('desktop mega-menu: Products > Marbles flyout links to collections', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop menu');
    await page.goto('/');
    await page.locator('.mega-dropdown').hover();
    await page.locator('.mega-item.has-sub', { hasText: 'Marbles' }).hover();
    await page.getByRole('link', { name: 'Imported Marbles' }).click();
    await expect(page).toHaveURL(/\/imported-marbles\/?$/);
    await expect(page.locator('.desktop-nav .nav-link.active')).toHaveText(/Products/);
  });

  test('mobile bottom bar: Products sheet opens, closes with Escape, links work', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'mobile bar');
    await page.goto('/');
    await page.locator('.mnav-item[data-mnav="products"]').click();
    const sheet = page.getByRole('dialog', { name: 'Products' });
    await expect(sheet).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await page.locator('.mnav-item[data-mnav="services"]').click();
    await page.getByRole('dialog', { name: 'Services' }).getByRole('link', { name: 'Elevations' }).click();
    await expect(page).toHaveURL(/\/stone-art-installations\/?$/);
  });

  test('retired and legacy URLs redirect; unknown URLs get the 404 page', async ({ page }) => {
    const cases: [string, string][] = [
      ['/case-study-airport', '/projects'],
      ['/indian-granites', '/granites'],
      ['/quartz-surfaces', '/quatrz-surfaces'],
      ['/about.html', '/about'],
      ['/kota-stones.html', '/kota-stones'],
    ];
    for (const [from, to] of cases) {
      await page.goto(from);
      await expect(page, from).toHaveURL(new RegExp(`${to}/?$`));
    }
    const res = await page.goto('/no-such-page');
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Page Not Found/);
  });
});

test.describe('SEO', () => {
  test('every page has its own title, description and a skstonesindia.com canonical', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'same HTML on every viewport');
    test.setTimeout(120_000);
    const paths = [
      '/',
      '/about',
      '/projects',
      '/contact',
      '/products',
      '/landscaping',
      '/granites',
      '/kota-stones',
      '/tiles',
    ];
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const path of paths) {
      await page.goto(path);
      const title = await page.title();
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(title, path).toBeTruthy();
      expect(description, path).toBeTruthy();
      // Next.js prints the root canonical without its trailing slash (same URL).
      expect(canonical, path).toMatch(/^https:\/\/skstonesindia\.com(\/|$)/);
      await expect(page.locator('meta[property="og:title"]'), path).toHaveCount(1);
      await expect(page.locator('meta[name="twitter:card"]'), path).toHaveAttribute(
        'content',
        'summary_large_image',
      );
      titles.add(title);
      descriptions.add(description!);
    }
    expect(titles.size).toBe(paths.length);
    expect(descriptions.size).toBe(paths.length);
  });
});
