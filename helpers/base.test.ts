import { test as baseTest, expect as baseExpect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const EVIDENCE_DIR = process.env.EVIDENCE_DIR ?? './evidence';
if (!fs.existsSync(EVIDENCE_DIR)) fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

const STATIC_ASSET_RE = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|map)(\?|$)/i;

/**
 * Custom Playwright Test Fixture
 * ──────────────────────────────────────────────────────────────────────────────
 * This extends the default Playwright test with automatic API logging 
 * and custom screenshot capturing for every test that uses the `page` fixture.
 * 
 * Spec files can just import `test` from this file instead of `@playwright/test`.
 */
export const test = baseTest.extend<{}>({
    page: async ({ page }, use, testInfo) => {
        // 1. Setup: Start tracking API logs before the test starts
        const apiLogs: { url: string; method: string; status: number; statusText: string }[] = [];
        
        const responseHandler = (response: any) => {
            if (!STATIC_ASSET_RE.test(response.url())) {
                apiLogs.push({
                    url: response.url(),
                    method: response.request().method(),
                    status: response.status(),
                    statusText: response.statusText(),
                });
            }
        };
        page.on('response', responseHandler);

        // 2. Execute the actual test
        await use(page);

        // 3. Teardown: Capture Evidence after the test completes
        page.off('response', responseHandler);

        const status = testInfo.status ?? 'unknown';
        const label = status === 'passed' ? '✅ PASSED' : '❌ FAILED';
        const safeTitle = testInfo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const timestamp = Date.now();

        // Capture JPEG screenshot
        const screenshotFile = path.join(EVIDENCE_DIR, `${safeTitle}-${timestamp}.jpg`);
        await page.screenshot({ type: 'jpeg', quality: 50, fullPage: false, path: screenshotFile });

        await testInfo.attach(`📸 Screenshot [${label}]`, {
            path: screenshotFile,
            contentType: 'image/jpeg',
        });

        // Save API logs
        const apiLogFile = path.join(EVIDENCE_DIR, `api-log-${safeTitle}-${timestamp}.json`);
        fs.writeFileSync(apiLogFile, JSON.stringify({ status, title: testInfo.title, calls: apiLogs }, null, 2));

        await testInfo.attach(`🌐 API Log [${label}]`, {
            path: apiLogFile,
            contentType: 'application/json',
        });
    }
});

export const expect = baseExpect;
