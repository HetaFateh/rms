import { test, expect } from '../../helpers/base.test';
import { login, logout } from '../../helpers/elements/auth.helper';
import { expectSuccessToast } from '../../helpers/elements/global.elements';
import { testToggle } from '../../test.config';
import { stateManager } from '../../helpers/state.manager';
import { TEST_DATA } from '../../helpers/data.helper';
import {
  navigateToProgramManagement,
  clickDeleteIcon,
  confirmDeletion,
} from '../../helpers/elements/program-mgmt.helper';

const PROGRAM_NAME = TEST_DATA.program.name;

test.describe.serial('Delete Program Flow', () => {

  test.beforeAll(() => {
    if (!testToggle.runDeleteProgram) test.skip();
  });

  test.afterAll(() => {
    stateManager.clear();
  });

  test('TC-PM-002 | Delete a program – full happy path', async ({ page }) => {

    await test.step('Admin: Login', async () => {
      await login(page, 'admin');
    });

    await test.step('Admin: Navigate to Program Management', async () => {
      await navigateToProgramManagement(page);
    });

    await test.step(`Admin: Click delete icon for "${PROGRAM_NAME}"`, async () => {
      await clickDeleteIcon(page, PROGRAM_NAME);
    });

    await test.step('Admin: Confirm deletion', async () => {
      await confirmDeletion(page);
    });

    await test.step('Admin: Verify success notification', async () => {
      await expectSuccessToast(page);
    });

    await test.step('Admin: Logout', async () => {
      await logout(page);
    });

  });
});
