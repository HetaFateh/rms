import { test, expect } from '../../helpers/base.test';
import { login, logout } from '../../helpers/elements/auth.helper';
import { expectSuccessToast } from '../../helpers/elements/global.elements';
import { testToggle } from '../../test.config';
import { TEST_DATA } from '../../helpers/data.helper';
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

const PROGRAM_NAME = TEST_DATA.program.name;

test.describe.serial('Approve Program E2E Flow', () => {

  test.beforeAll(() => {
    if (!testToggle.runApproveProgramE2E) test.skip();
  });

  test('TC-PA-E2E-001 | Create and Approve Program – full E2E flow', async ({ page }) => {

    await test.step('Admin: Login', async () => {
      await login(page, 'admin');
    });

    await test.step('Admin: Navigate to Create Program', async () => {
      await navigateToCreateProgram(page);
    });

    await test.step('Admin: Fill Tab Program', async () => {
      await fillTabProgram(page, TEST_DATA.imagePath);
    });

    await test.step('Admin: Fill Tab Foto', async () => {
      await fillTabFoto(page, TEST_DATA.imagePath);
    });

    await test.step('Admin: Fill Tab Payment Limitation', async () => {
      await fillTabPaymentLimitation(page);
    });

    await test.step('Admin: Fill Tab Sales Fee and verify success', async () => {
      await fillTabSalesFee(page);
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
