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
import {
  navigateToProgramApproval,
  clickApproveIcon,
  submitApproval,
} from '../../helpers/elements/appr-program.helper';
import { form_daftar_program } from '../../helpers/data.helper';

// ── Test Data ─────────────────────────────────────────────────────────────────

const IMAGE_PATH = path.join(__dirname, '../../test-assets', 'promofm.jpg');
const PROGRAM_NAME = form_daftar_program.name;

// ── Test Suite ────────────────────────────────────────────────────────────────

test.describe.serial('Approve Program E2E Flow', () => {

  // Guard: skip the entire suite when the toggle is off.
  test.beforeAll(() => {
    if (!testToggle.runApproveProgramE2E) {
      test.skip();
    }
  });

  test('TC-PA-E2E-001 | Create and Approve Program – full E2E flow', async ({ page }) => {

    // ── Step 1: Login as Admin ────────────────────────────────────────────────
    await test.step('Admin: Login', async () => {
      await login(page, 'admin');
    });

    // ── Step 2: Navigate to Create Program ────────────────────────────────────
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

    // ── Step 5: Fill Tab Payment Limitation ───────────────────────────────────
    await test.step('Admin: Fill Tab Payment Limitation', async () => {
      await fillTabPaymentLimitation(page);
    });

    // ── Step 6: Fill Tab Sales Fee & Assert Success ───────────────────────────
    await test.step('Admin: Fill Tab Sales Fee and verify success', async () => {
      await fillTabSalesFee(page);

      const toast = toastElements(page);
      await expect(toast.toastSuccess).toBeVisible({ timeout: 15_000 });
    });

    // ── Step 7: Logout as Admin ───────────────────────────────────────────────
    await test.step('Admin: Logout', async () => {
      await logout(page);
      // Wait for logout to complete and login page to be ready
      await page.waitForTimeout(2000);
    });

    // ── Step 8: Login as Approver ─────────────────────────────────────────────
    await test.step('Approver: Login', async () => {
      await login(page, 'approver');
    });

    // ── Step 9: Navigate to Program Approval ──────────────────────────────────
    await test.step('Approver: Navigate to Program Approval', async () => {
      await navigateToProgramApproval(page);
      // Wait for table to load
      await page.waitForTimeout(3000);
    });

    // ── Step 10: Click approve icon ───────────────────────────────────────────
    await test.step(`Approver: Click approve icon for "${PROGRAM_NAME}"`, async () => {
      await clickApproveIcon(page, PROGRAM_NAME);
    });

    // ── Step 11: Submit approval ──────────────────────────────────────────────
    await test.step('Approver: Select Approve radio and submit', async () => {
      await submitApproval(page);
    });

    // ── Step 12: Assert success toast ─────────────────────────────────────────
    await test.step('Approver: Verify success notification', async () => {
      const toast = toastElements(page);
      await expect(toast.toastSuccess).toBeVisible({ timeout: 15_000 });
    });

    // ── Step 13: Logout as Approver ───────────────────────────────────────────
    await test.step('Approver: Logout', async () => {
      await logout(page);
    });

  });

});

// Made with Bob
