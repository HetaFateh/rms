import { defineConfig, devices } from '@playwright/test';

/**
 * BROWSER TOGGLE
 * ─────────────────────────────────────────────────────────────────────────────
 * By default, tests run on Chromium only (1 worker = faster local dev).
 * To run on all 3 browsers (Chromium + Firefox + WebKit), set the env flag:
 *
 *   Windows PowerShell:
 *     $env:ALL_BROWSERS="true"; npx playwright test
 *
 *   Windows CMD:
 *     set ALL_BROWSERS=true && npx playwright test
 *
 *   Mac/Linux:
 *     ALL_BROWSERS=true npx playwright test
 *
 * To go back to Chromium only, just run:
 *     npx playwright test   (no flag needed)
 * ─────────────────────────────────────────────────────────────────────────────
 */
const runAllBrowsers = process.env.ALL_BROWSERS === 'true';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    // Trace is kept only on failure — open via HTML report → "Trace" button.
    // Shows full DOM snapshots + every network request/response with status codes.
    trace: 'retain-on-failure',

    // Screenshots and API logs are handled manually in the test (afterEach)
    // so we can control JPEG quality to keep file sizes small.
    screenshot: 'off',

    ignoreHTTPSErrors: true,
    launchOptions: {
      args: ['--disable-web-security'],
    },
  },

  /**
   * Projects (browsers) configuration
   *
   * runAllBrowsers = false (DEFAULT):
   *   → Only Chromium runs. Faster, good for local development & debugging.
   *
   * runAllBrowsers = true (ALL_BROWSERS=true):
   *   → Chromium + Firefox + WebKit all run in parallel (3 workers).
   *     Use this before merging or for cross-browser regression checks.
   */
  projects: runAllBrowsers
    ? [
        // ── All 3 browsers enabled ──────────────────────────────────────────
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
        {
          name: 'firefox',
          use: { ...devices['Desktop Firefox'] },
        },
        {
          name: 'webkit',
          use: { ...devices['Desktop Safari'] },
        },
      ]
    : [
        // ── Default: Chromium only ──────────────────────────────────────────
        // Chromium is chosen as the default because it covers the widest
        // real-world usage (Chrome + Edge share the same engine) and is the
        // fastest to launch. Firefox and WebKit are opt-in via ALL_BROWSERS.
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
      ],
});
