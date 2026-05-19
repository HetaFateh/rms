import { test, expect } from '../../helpers/base.test';
import { login, logout } from '../../helpers/elements/auth.helper';
import { expectSuccessToast } from '../../helpers/elements/global.elements';
import { testToggle } from '../../test.config';
import { TEST_DATA } from '../../helpers/data.helper';
import {
  navigateToProgramManagement,
  searchProgram,
  clickEditIcon,
  updateProgramDateRange,
  saveEditedProgram,
  navigateToProgramApproval,
  clickApproveIcon,
  submitApproval,
} from '../../helpers/elements/program.helper';

const PROGRAM_NAME = TEST_DATA.program.name;

test.describe.serial('Edit Existing Program E2E Flow', () => {

  test.beforeAll(() => {
    if (!testToggle.runEditProgramE2E) test.skip();
  });

  test('TC-PM-E2E-001 | Edit and Approve Program – full E2E flow', async ({ page }) => {

    await test.step('Admin: Login', async () => {
      await login(page, 'admin');
    });

    await test.step('Admin: Navigate to Program Management', async () => {
      await navigateToProgramManagement(page);
    });

    await test.step(`Admin: Search for program "${PROGRAM_NAME}"`, async () => {
      await searchProgram(page, PROGRAM_NAME);
    });

    await test.step('Admin: Click edit button', async () => {
      await clickEditIcon(page, PROGRAM_NAME);
    });

    await test.step('Admin: Update program date range', async () => {
      await updateProgramDateRange(page);
    });

    await test.step('Admin: Save changes', async () => {
      await saveEditedProgram(page);
      await expectSuccessToast(page);
    });

    await test.step('Admin: Logout', async () => {
      await logout(page);
    });

    await test.step('Approver: Login', async () => {
      await login(page, 'approver');
    });

    await test.step('Approver: Navigate to Program Approval', async () => {
      await navigateToProgramApproval(page);
    });

    await test.step(`Approver: Click approve icon for "${PROGRAM_NAME}"`, async () => {
      await clickApproveIcon(page, PROGRAM_NAME);
    });

    await test.step('Approver: Select Approve radio and submit', async () => {
      await submitApproval(page);
    });

    await test.step('Approver: Verify success notification', async () => {
      await expectSuccessToast(page);
    });

    await test.step('Approver: Logout', async () => {
      await logout(page);
    });

  });
});
