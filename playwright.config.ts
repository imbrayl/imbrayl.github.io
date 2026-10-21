import { defineConfig, devices } from '@playwright/test';

const CI = !!process.env.CI;

export default defineConfig({
  testDir: './tests/specs',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI
    ? [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'test-output/results.json' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'node scripts/serve.mjs',
    url: 'http://localhost:4173',
    reuseExistingServer: !CI,
  },
});
