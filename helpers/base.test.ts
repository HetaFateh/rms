import { test as baseTest, expect as baseExpect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const EVIDENCE_DIR = process.env.EVIDENCE_DIR ?? './evidence';
if (!fs.existsSync(EVIDENCE_DIR)) fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

const STATIC_ASSET_RE = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|map)(\?|$)/i;

interface ApiLogEntry {
    url: string;
    method: string;
    status: number;
    statusText: string;
}

/**
 * Custom Playwright Test Fixture
 * ──────────────────────────────────────────────────────────────────────────────
 * Extends Playwright with automatic screenshot capture and API/console error
 * tracking. Only errors (API 4xx/5xx + browser console errors) are surfaced.
 * If no errors exist, nothing is printed — the test just passes cleanly.
 */
export const test = baseTest.extend<{}>({
    page: async ({ page }, use, testInfo) => {
        const apiLogs: ApiLogEntry[] = [];
        const consoleErrors: { type: string; text: string }[] = [];

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
        page.on('console', (msg: any) => {
            if (msg.type() === 'error') {
                consoleErrors.push({ type: msg.type(), text: msg.text() });
            }
        });

        await use(page);

        page.off('response', responseHandler);

        const status = testInfo.status ?? 'unknown';
        const label = status === 'passed' ? 'PASSED' : 'FAILED';
        const safeTitle = testInfo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const timestamp = Date.now();

        // Screenshot
        const screenshotFile = path.join(EVIDENCE_DIR, `${safeTitle}-${timestamp}.jpg`);
        await page.screenshot({ type: 'jpeg', quality: 50, fullPage: false, path: screenshotFile });
        await testInfo.attach(`Screenshot [${label}]`, { path: screenshotFile, contentType: 'image/jpeg' });

        // Collect errors only (4xx/5xx API + console errors)
        const apiErrors = apiLogs.filter(l => l.status >= 400);
        const hasErrors = apiErrors.length > 0 || consoleErrors.length > 0;

        if (hasErrors) {
            const errorReport: Record<string, unknown> = { status, title: testInfo.title };

            if (apiErrors.length > 0) {
                errorReport.apiErrors = apiErrors;
                console.error(`\n[API Error] ${testInfo.title}`);
                for (const e of apiErrors) {
                    console.error(`  ${e.method} ${e.status} ${e.url}`);
                }
            }

            if (consoleErrors.length > 0) {
                errorReport.consoleErrors = consoleErrors;
                console.error(`\n[Console Error] ${testInfo.title}`);
                for (const e of consoleErrors) {
                    console.error(`  ${e.text}`);
                }
            }

            const errorFile = path.join(EVIDENCE_DIR, `error-${safeTitle}-${timestamp}.json`);
            fs.writeFileSync(errorFile, JSON.stringify(errorReport, null, 2));
            await testInfo.attach(`Errors [${label}]`, { path: errorFile, contentType: 'application/json' });
        } else {
            await testInfo.attach('API Check', { body: 'All API calls passed — no errors detected.', contentType: 'text/plain' });
        }
    }
});

export const expect = baseExpect;
