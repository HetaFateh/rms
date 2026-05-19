import { test, expect } from '../../helpers/base.test';
import { login, logout } from '../../helpers/elements/auth.helper';
import { sidebarElements } from '../../helpers/elements/global.elements';
import { testToggle } from '../../test.config';

test.describe.serial('Edit Profile Flow', () => {

  test.beforeAll(() => {
    if (!testToggle.runEditProfile) {
      test.skip();
    }
  });

  test('TC-UP-001 | View Edit Profile page', async ({ page }) => {

    await test.step('Admin: Login', async () => {
      await login(page, 'admin');
    });

    await test.step('Admin: Navigate to Edit Profile', async () => {
      const sidebar = sidebarElements(page);
      await sidebar.linkEditProfile.click();
      await page.waitForTimeout(2000);
    });

    await test.step('Admin: Verify Edit Profile page loaded', async () => {
      // Verify we're on the edit profile page
      await expect(page).toHaveURL(/.*edit-profile.*/);
    });

    await test.step('Admin: Logout', async () => {
      await logout(page);
    });

  });

});

// Made with Bob
