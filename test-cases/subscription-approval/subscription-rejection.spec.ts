import { test, expect } from '../../helpers/base.test';
import { login, logout } from '../../helpers/elements/auth.helper';
import { testToggle } from '../../test.config';
import { TEST_DATA } from '../../helpers/data.helper';
import { expectSuccessToast } from '../../helpers/elements/global.elements';
import {
  navigateToSubscribeApproval,
  searchAgent,
  clickApprovalButton,
  selectReject,
  submitRejection,
} from '../../helpers/elements/subs-appr.helper';

test.describe.serial('Subscription Rejection Flow', () => {

  test.beforeAll(() => {
    if (!testToggle.runRejectSubscription) test.skip();
  });

  test('TC-SA-002 | Admin rejects a subscription', async ({ page }) => {

    await test.step('Admin: Login', async () => {
      await login(page, 'admin');
    });

    await test.step('Admin: Navigate to Subscribe Approval', async () => {
      await navigateToSubscribeApproval(page);
    });

    await test.step('Admin: Search for subscription by name', async () => {
      await searchAgent(page, TEST_DATA.subscription.searchTerm);
    });

    await test.step('Admin: Click Approval button on matching row', async () => {
      await clickApprovalButton(page);
    });

    await test.step('Admin: Select Reject radio button', async () => {
      await selectReject(page);
    });

    await test.step('Admin: Submit rejection by clicking Kirim', async () => {
      await submitRejection(page);
    });

    await test.step('Admin: Verify success toast', async () => {
      await expectSuccessToast(page);
    });

    await test.step('Admin: Logout', async () => {
      await logout(page);
    });

  });

});

// Made with Bob
