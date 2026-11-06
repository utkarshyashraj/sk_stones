import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 4,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    // Locally we drive the installed Microsoft Edge; CI uses Playwright's bundled Chromium.
    ...(process.env.CI ? {} : { channel: 'msedge' }),
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } },
      testIgnore: /responsive/,
    },
  ],
  webServer: {
    command: `node scripts/serve-out.mjs ${PORT}`,
    port: PORT,
    reuseExistingServer: true,
  },
});
