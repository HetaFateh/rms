import { test, expect } from '../../helpers/base.test';
import { login, logout } from '../../helpers/elements/auth.helper';
import { toastElements } from '../../helpers/elements/global.elements';
import { testToggle } from '../../test.config';
import {
  navigateToProgramApproval,
  clickApproveIcon,
  submitApproval,
} from '../../helpers/elements/appr-program.helper';
import { form_daftar_program } from '../../helpers/data.helper';

// ── Test Data ─────────────────────────────────────────────────────────────────

const PROGRAM_NAME = form_daftar_program.name; // 'Test ShareLink'

// ── Test Suite ────────────────────────────────────────────────────────────────

test.describe.serial('Approve Existing Program Flow', () => {

  // Guard: skip the entire suite when the toggle is off.
  test.beforeAll(() => {
    if (!testToggle.runApproveExistingProgram) {
      test.skip();
    }
  });

  test('TC-PA-002 | Approve existing program – approval only', async ({ page }) => {

    // ── Step 1: Login as Approver ─────────────────────────────────────────────
    await test.step('Approver: Login', async () => {
      await login(page, 'approver');
    });

    // ── Step 2: Navigate to Program Approval ──────────────────────────────────
    await test.step('Approver: Navigate to Program Approval', async () => {
      await navigateToProgramApproval(page);
      // Wait for table to load
      await page.waitForTimeout(2000);
    });

    // ── Step 3: Click approve icon ────────────────────────────────────────────
    await test.step(`Approver: Click approve icon for "${PROGRAM_NAME}"`, async () => {
      await clickApproveIcon(page, PROGRAM_NAME);
    });

    // ── Step 4: Submit approval ───────────────────────────────────────────────
    await test.step('Approver: Select Approve radio and submit', async () => {
      await submitApproval(page);
    });

    // ── Step 5: Assert success toast ──────────────────────────────────────────
    await test.step('Approver: Verify success notification', async () => {
      const toast = toastElements(page);
      await expect(toast.toastSuccess).toBeVisible({ timeout: 15_000 });
    });

    // ── Step 6: Logout ────────────────────────────────────────────────────────
    await test.step('Approver: Logout', async () => {
      await logout(page);
    });

  });

});

// Made with Bob
