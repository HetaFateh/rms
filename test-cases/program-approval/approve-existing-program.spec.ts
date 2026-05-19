import { test, expect } from '../../helpers/base.test';
import { login, logout } from '../../helpers/elements/auth.helper';
import { expectSuccessToast } from '../../helpers/elements/global.elements';
import { testToggle } from '../../test.config';
import { TEST_DATA } from '../../helpers/data.helper';
import {
  navigateToProgramApproval,
  clickApproveIcon,
  submitApproval,
} from '../../helpers/elements/appr-program.helper';

const PROGRAM_NAME = TEST_DATA.program.name;

test.describe.serial('Approve Existing Program Flow', () => {

  test.beforeAll(() => {
    if (!testToggle.runApproveExistingProgram) test.skip();
  });

  test('TC-PA-002 | Approve existing program – approval only', async ({ page }) => {

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
