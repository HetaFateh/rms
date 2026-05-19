import { test, expect } from '../../helpers/base.test';
import { login, logout } from '../../helpers/elements/auth.helper';
import { toastElements } from '../../helpers/elements/global.elements';
import { testToggle } from '../../test.config';
import {
  navigateToProgramManagement,
  searchProgram,
  clickEditIcon,
  updateProgramDateRange,
  saveEditedProgram,
} from '../../helpers/elements/program-mgmt.helper';
import {
  navigateToProgramApproval,
  clickApproveIcon,
  submitApproval,
} from '../../helpers/elements/appr-program.helper';
import { form_daftar_program } from '../../helpers/data.helper';

// ── Test Data ─────────────────────────────────────────────────────────────────

const EXISTING_PROGRAM_NAME = form_daftar_program.name; // 'Test ShareLink'

// ── Test Suite ────────────────────────────────────────────────────────────────

test.describe.serial('Edit Existing Program E2E Flow', () => {

  // Guard: skip the entire suite when the toggle is off.
  test.beforeAll(() => {
    if (!testToggle.runEditProgramE2E) {
      test.skip();
    }
  });

  test('TC-PM-E2E-001 | Edit and Approve Program – full E2E flow', async ({ page }) => {

    // ── Step 1: Login as Admin ────────────────────────────────────────────────
    await test.step('Admin: Login', async () => {
      await login(page, 'admin');
    });

    // ── Step 2: Navigate to Program Management ────────────────────────────────
    await test.step('Admin: Navigate to Program Management', async () => {
      await navigateToProgramManagement(page);
    });

    // ── Step 3: Search for existing program ───────────────────────────────────
    await test.step(`Admin: Search for program "${EXISTING_PROGRAM_NAME}"`, async () => {
      await searchProgram(page, EXISTING_PROGRAM_NAME);
    });

    // ── Step 4: Click edit button ─────────────────────────────────────────────
    await test.step('Admin: Click edit button', async () => {
      await clickEditIcon(page, EXISTING_PROGRAM_NAME);
    });

    // ── Step 5: Update date range using date picker ───────────────────────────
    await test.step('Admin: Update program date range', async () => {
      // Following temp_codegen.txt instructions:
      // - First date: day before current day (e.g., if today is May 20th, choose May 19th)
      // - Last date: first date + 12 days (e.g., if first date is May 19th, choose May 31st)
      await updateProgramDateRange(page);
    });

    // ── Step 6: Save changes ──────────────────────────────────────────────────
    await test.step('Admin: Save changes', async () => {
      await saveEditedProgram(page);

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
    });

    // ── Step 10: Search and click approve icon ────────────────────────────────
    await test.step(`Approver: Click approve icon for "${EXISTING_PROGRAM_NAME}"`, async () => {
      // Program name doesn't change, so we search by the original name
      await clickApproveIcon(page, EXISTING_PROGRAM_NAME);
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
