import { test, expect } from '../../helpers/base.test';
import { login, logout } from '../../helpers/elements/auth.helper';
import { toastElements } from '../../helpers/elements/global.elements';
import { testToggle } from '../../test.config';
import { stateManager } from '../../helpers/state.manager';
import {
  navigateToProgramManagement,
  clickDeleteIcon,
  confirmDeletion,
} from '../../helpers/elements/program-mgmt.helper';
import { form_daftar_program } from '../../helpers/data.helper';

// ── Program name to delete ────────────────────────────────────────────────────
// Matches the program created in create-program.spec.ts so both flows can run
// end-to-end in sequence.
const PROGRAM_NAME = form_daftar_program.name; // 'Test Automation'

// ── Test Suite ────────────────────────────────────────────────────────────────

test.describe.serial('Delete Program Flow', () => {

  // Guard: skip the entire suite when the toggle is off.
  test.beforeAll(() => {
    if (!testToggle.runDeleteProgram) {
      test.skip();
    }
  });

  // Cleanup state after all tests complete.
  test.afterAll(() => {
    stateManager.clear();
  });

  test('TC-PM-002 | Delete a program – full happy path', async ({ page }) => {

    // ── Step 1: Login as Admin ────────────────────────────────────────────────
    await test.step('Admin: Login', async () => {
      await login(page, 'admin');
    });

    // ── Step 2: Navigate to Program Management ────────────────────────────────
    await test.step('Admin: Navigate to Program Management', async () => {
      await navigateToProgramManagement(page);
    });

    // ── Step 3: Click delete icon for the target program ──────────────────────
    await test.step(`Admin: Click delete icon for "${PROGRAM_NAME}"`, async () => {
      await clickDeleteIcon(page, PROGRAM_NAME);
    });

    // ── Step 4: Confirm deletion ──────────────────────────────────────────────
    await test.step('Admin: Confirm deletion', async () => {
      await confirmDeletion(page);
    });

    // ── Step 5: Assert success toast ──────────────────────────────────────────
    await test.step('Admin: Verify success notification', async () => {
      const toast = toastElements(page);
      await expect(toast.toastSuccess).toBeVisible({ timeout: 15_000 });
    });

    // ── Step 6: Logout ────────────────────────────────────────────────────────
    await test.step('Admin: Logout', async () => {
      await logout(page);
    });

  });

});

// Made with Bob
