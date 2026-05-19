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

test.describe.serial('Create Program Flow', () => {

  test.beforeAll(() => {
    if (!testToggle.runCreateProgram) test.skip();
  });

  test('TC-PM-001 | Create Program – full happy path', async ({ page }) => {

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

  });
});
