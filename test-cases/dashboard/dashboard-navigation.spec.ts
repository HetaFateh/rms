import { test, expect } from '../../helpers/base.test';
import { login, logout } from '../../helpers/elements/auth.helper';
import { sidebarElements } from '../../helpers/elements/global.elements';
import { testToggle } from '../../test.config';

test.describe.serial('Dashboard Navigation Flow', () => {

  test.beforeAll(() => {
    if (!testToggle.runDashboardNavigation) test.skip();
  });

  test('TC-DB-001 | Navigate to Dashboard and verify key elements', async ({ page }) => {

    await test.step('Admin: Login', async () => {
      await login(page, 'admin');
    });

    await test.step('Admin: Verify Dashboard URL', async () => {
      await expect(page).toHaveURL(/.*main.*/);
    });

    await test.step('Admin: Click Dashboard link', async () => {
      await sidebarElements(page).linkDashboard.click();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Admin: Verify Dashboard page loaded', async () => {
      const hasContent = await page.locator('body').textContent();
      expect(hasContent).toBeTruthy();
    });

    await test.step('Admin: Logout', async () => {
      await logout(page);
    });

  });

  test('TC-DB-002 | Navigate through all main menu sections', async ({ page }) => {

    await test.step('Admin: Login', async () => {
      await login(page, 'admin');
    });

    const sidebar = sidebarElements(page);
    const menuSections = [
      { name: 'Manage Program', button: sidebar.btnManageProgram },
      { name: 'Manage User', button: sidebar.btnManageUser },
      { name: 'Point Transaction', button: sidebar.btnPointTransaction },
      { name: 'Campaign & Report', button: sidebar.btnCampaignReport },
      { name: 'Support', button: sidebar.btnSupport },
      { name: 'Setting', button: sidebar.btnSetting },
    ];

    for (const section of menuSections) {
      await test.step(`Admin: Expand ${section.name} menu`, async () => {
        await section.button.click();
        await expect(section.button).toBeVisible();
      });
    }

    await test.step('Admin: Logout', async () => {
      await logout(page);
    });

  });
});
