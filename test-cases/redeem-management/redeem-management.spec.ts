import { test, expect } from '../../helpers/base.test';
import { login, logout } from '../../helpers/elements/auth.helper';
import { expectSuccessToast } from '../../helpers/elements/global.elements';
import { navigateToRedeem, createRedeem } from '../../helpers/elements/redeem.helper';
import { testToggle } from '../../test.config';
import { TEST_DATA } from '../../helpers/data.helper';

test.describe.serial('Redeem Management', () => {
  test.beforeAll(() => {
    if (!testToggle.runRedeemManagement) test.skip();
  });

  test('TC-RM-001 | Create redeem entry', async ({ page }) => {
    test.setTimeout(60000);
    const d = TEST_DATA.redeem;

    await test.step('Admin: Login and navigate to Redeem page', async () => {
      await login(page, 'admin');
      await navigateToRedeem(page);
    });

    await test.step('Admin: Create redeem entry', async () => {
      await createRedeem(page, d.poin, d.minimumPoinRedeem, d.hari, d.adminFee);
    });

    await test.step('Admin: Verify success toast', async () => {
      const toast = page.getByRole('alert').or(page.getByText('Success', { exact: false }));
      await expect(toast.first()).toBeVisible({ timeout: 15000 });
    });

    await test.step('Admin: Logout', async () => {
      await logout(page);
    });
  });
});
