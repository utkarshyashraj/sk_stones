import type { Page } from '@playwright/test';

/**
 * Waits for hydration (FeatureBoot has attached its listeners). Before that, a key press such as "/" has
 * nothing to handle it; real visitors can't type that fast, a test can.
 */
export const hydrated = (page: Page) => page.waitForFunction(() => Boolean(window.__skQueue));

/**
 * Waits for the lazy feature bundle and, where the page has one, for the live filter bar to replace the
 * static one. Early clicks on the static bar are carried over (tested separately), but Playwright keeps a
 * handle to the element it first found, which the swap hides.
 */
export const featuresReady = (page: Page) =>
  page.waitForFunction(
    () =>
      Boolean(window.__skReady) &&
      (!document.getElementById('sk-filter-skeleton') ||
        (document.getElementById('sk-filter-skeleton') as HTMLElement).hidden),
  );
