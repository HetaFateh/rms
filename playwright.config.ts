import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

/**
 * BROWSER TOGGLE
 *   Default  → Chromium only (fastest for local dev)
 *   All browsers → set ALL_BROWSERS=true
 *
 *   Mac/Linux  : ALL_BROWSERS=true npx playwright test
 * ──────────────────────────────────────────────────────────────────────────────
 */

const runAllBrowsers = process.env.ALL_BROWSERS === 'true';

export default defineConfig({
  testDir: './test-cases',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.BASE_URL ?? 'https://dashboard.rms.dev.atklik.xyz/',
    headless: false,
    trace: 'retain-on-failure',
    screenshot: 'off',
    ignoreHTTPSErrors: true,
    launchOptions: {
      executablePath: '/usr/bin/google-chrome-stable',
      args: ['--disable-web-security'],
    },
  },

  projects: runAllBrowsers
    ? [
        { name: 'chromium', use: { ...devices['Desktop Chrome']  } },
        { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit',   use: { ...devices['Desktop Safari']  } },
      ]
    : [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
      ],
});
