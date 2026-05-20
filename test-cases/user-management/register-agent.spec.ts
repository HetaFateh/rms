import { test, expect } from '../../helpers/base.test';
import { login, logout } from '../../helpers/elements/auth.helper';
import { testToggle } from '../../test.config';
import { TEST_DATA } from '../../helpers/data.helper';
import { expectSuccessToast } from '../../helpers/elements/global.elements';
import { navigateToCreateUser, fillUserForm, saveUser } from '../../helpers/elements/user.helper';

test.describe.serial('Register Agent Flow', () => {

  test.beforeAll(() => {
    if (!testToggle.runRegisterAgent) test.skip();
  });

  test('TC-UM-002 | Register a new Agent', async ({ page }) => {

    await test.step('Admin: Login', async () => {
      await login(page, 'admin');
    });

    await test.step('Admin: Navigate to Create User', async () => {
      await navigateToCreateUser(page);
      await page.waitForURL(/.*user\/add.*/);
    });

    await test.step('Admin: Fill agent registration form', async () => {
      await fillUserForm(page, TEST_DATA.agent, TEST_DATA.imagePath);
    });

    await test.step('Admin: Save agent and verify success toast', async () => {
      await saveUser(page);
      await expectSuccessToast(page);
    });

    await test.step('Admin: Logout', async () => {
      await logout(page);
    });

  });
});
