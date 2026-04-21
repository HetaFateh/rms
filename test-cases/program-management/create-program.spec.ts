/**
 * test-cases/program-management/create-program.spec.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Test Suite: Create Program – Full Happy Path
 *
 * Design: "Tidy Spec" pattern.
 *   - This file contains ZERO raw Playwright selectors.
 *   - All interactions are delegated to helper action functions.
 *   - Each test.step() maps 1-to-1 to a business-meaningful action.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import path from 'path';
import { test, expect } from '../../helpers/base.test';
import { login } from '../../global/auth';
import { toastElements } from '../../helpers/elements/global.elements';
import {
  navigateToCreateProgram,
  fillTabProgram,
  fillTabFoto,
  fillTabPaymentLimitation,
  fillTabSalesFee,
} from '../../helpers/elements/program-mgmt.helper';

// ── Test Data ─────────────────────────────────────────────────────────────────

const IMAGE_PATH = path.join(__dirname, '../../test-assets', 'promofm.jpg');

// ── Test Suite ────────────────────────────────────────────────────────────────

test.describe.serial('Create Program Flow', () => {

  test('TC-001 | Create Program – full happy path', async ({ page }) => {

    // ── Step 1: Login ─────────────────────────────────────────────────────────
    await test.step('1. Login as Admin', async () => {
      await login(page, 'admin');
    });

    // ── Step 2: Navigate ──────────────────────────────────────────────────────
    await test.step('2. Navigate to Create Program', async () => {
      await navigateToCreateProgram(page);
    });

    // ── Step 3: Fill Tab Program ──────────────────────────────────────────────
    await test.step('3. Fill Tab Program', async () => {
      await fillTabProgram(page, IMAGE_PATH);
    });

    // ── Step 4: Fill Tab Foto ─────────────────────────────────────────────────
    await test.step('4. Fill Tab Foto', async () => {
      await fillTabFoto(page, IMAGE_PATH);
    });

    // ── Step 5: Fill Tab Payment Limitation ──────────────────────────────────
    await test.step('5. Fill Tab Payment Limitation', async () => {
      await fillTabPaymentLimitation(page);
    });

    // ── Step 6: Fill Tab Sales Fee & Assert Success ───────────────────────────
    await test.step('6. Fill Tab Sales Fee and verify success', async () => {
      await fillTabSalesFee(page);

      const notify = toastElements(page);
      await expect(notify.toastSuccess).toBeVisible({ timeout: 15_000 });
    });

  });

});
