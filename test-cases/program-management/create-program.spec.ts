import path from 'path';
import { test, expect } from '../../helpers/base.test';
import { login, logout } from '../../helpers/elements/auth.helper';
import { toastElements } from '../../helpers/elements/global.elements';
import { testToggle } from '../../test.config';
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

  // Guard: skip the entire suite when the toggle is off.
  test.beforeAll(() => {
    if (!testToggle.runCreateProgram) {
      test.skip();
    }
  });

  test('TC-PM-001 | Create Program – full happy path', async ({ page }) => {

    // ── Step 1: Login ─────────────────────────────────────────────────────────
    await test.step('Admin: Login', async () => {
      await login(page, 'admin');
    });

    // ── Step 2: Navigate ──────────────────────────────────────────────────────
    await test.step('Admin: Navigate to Create Program', async () => {
      await navigateToCreateProgram(page);
    });

    // ── Step 3: Fill Tab Program ──────────────────────────────────────────────
    await test.step('Admin: Fill Tab Program', async () => {
      await fillTabProgram(page, IMAGE_PATH);
    });

    // ── Step 4: Fill Tab Foto ─────────────────────────────────────────────────
    await test.step('Admin: Fill Tab Foto', async () => {
      await fillTabFoto(page, IMAGE_PATH);
    });

    // ── Step 5: Fill Tab Payment Limitation ──────────────────────────────────
    await test.step('Admin: Fill Tab Payment Limitation', async () => {
      await fillTabPaymentLimitation(page);
    });

    // ── Step 6: Fill Tab Sales Fee & Assert Success ───────────────────────────
    await test.step('Admin: Fill Tab Sales Fee and verify success', async () => {
      await fillTabSalesFee(page);

      const toast = toastElements(page);
      await expect(toast.toastSuccess).toBeVisible({ timeout: 15_000 });
    });

    // ── Step 7: Logout ────────────────────────────────────────────────────────
    await test.step('Admin: Logout', async () => {
      await logout(page);
    });

  });

});
