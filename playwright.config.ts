import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config'; // Load .env before any test resolver runs.

/**
 * playwright.config.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * BROWSER TOGGLE
 *
 *   Default  → Chromium only (fastest for local dev)
 *   All browsers → set ALL_BROWSERS=true
 *
 *   PowerShell : $env:ALL_BROWSERS="true"; npx playwright test
 *   CMD        : set ALL_BROWSERS=true && npx playwright test
 *   Mac/Linux  : ALL_BROWSERS=true npx playwright test
 * ──────────────────────────────────────────────────────────────────────────────
 */

const runAllBrowsers = process.env.ALL_BROWSERS === 'true';

export default defineConfig({
  /** Spec files live under testcase/**\/\*.spec.ts */
  testDir: './testcase',

  /** Run every spec file in parallel; tests within a serial describe are sequential. */
  fullyParallel: true,

  /** Fail the CI run immediately if test.only() was accidentally committed. */
  forbidOnly: !!process.env.CI,

  /** Retry failed tests twice in CI, never locally. */
  retries: process.env.CI ? 2 : 0,

  /**
   * Workers:
   *   CI  → 1 worker  (avoid resource contention on shared runners)
   *   Local → let Playwright pick the optimal count (usually CPU cores / 2)
   */
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { open: 'never' }], // Open report manually with: npx playwright show-report
    ['list'],                    // Live per-test status in the terminal.
  ],

  use: {
    /** Base URL so tests can use page.goto('/path') instead of a full URL. */
    baseURL: process.env.BASE_URL ?? 'https://dashboard.rms.dev.atklik.xyz/',

    /** Browser is always visible. Set to true for CI environments. */
    headless: false,

    /**
     * Trace retained on failure only.
     * Inspect via the HTML report → click a failed test → "Trace" button.
     * Shows full DOM snapshots + every network request/response.
     */
    trace: 'retain-on-failure',

    /**
     * Screenshots are captured manually in afterEach with JPEG 50% quality
     * so we control file size and destination (./evidence/).
     */
    screenshot: 'off',

    ignoreHTTPSErrors: true,

    launchOptions: {
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
        /**
         * Chromium default: widest real-world coverage (Chrome + Edge share
         * the Blink engine) and fastest launch time.
         */
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
      ],
});
