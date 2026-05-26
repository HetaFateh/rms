import { test, expect } from '../../helpers/base.test';
import { login, logout } from '../../helpers/elements/auth.helper';
import { sidebarElements, expectSuccessToast } from '../../helpers/elements/global.elements';
import { createBank, editBank, deleteBank, expectBankVisible } from '../../helpers/elements/bank.helper';
import { testToggle } from '../../test.config';
import { TEST_DATA } from '../../helpers/data.helper';

test.describe.serial('Bank Management', () => {
  test.beforeAll(() => {
    if (!testToggle.runBankManagement) test.skip();
  });

  test('TC-BANK-E2E-001 | Create, Edit, and Delete bank', async ({ page }) => {
    const bankName1 = TEST_DATA.bank.name();
    const bankCode1 = TEST_DATA.bank.code();
    const bankName2 = TEST_DATA.bank.name();
    const bankCode2 = TEST_DATA.bank.code();

    await test.step('Admin: Login and navigate to Bank page', async () => {
      await login(page, 'admin');
      const sidebar = sidebarElements(page);
      await sidebar.btnSetting.click();
      await sidebar.linkBank.click();
    });

    await test.step('Admin: Create new bank', async () => {
      await createBank(page, bankName1, bankCode1);
    });

    await test.step('Admin: Verify success toast after create', async () => {
      await expectSuccessToast(page);
    });

    await test.step('Admin: Verify bank appears in table', async () => {
      await expectBankVisible(page, bankName1);
    });

    await test.step('Admin: Edit bank name and code', async () => {
      await editBank(page, bankName1, bankName2, bankCode2);
    });

    await test.step('Admin: Verify success toast after edit', async () => {
      await expectSuccessToast(page);
    });

    await test.step('Admin: Verify updated bank appears in table', async () => {
      await expectBankVisible(page, bankName2);
    });

    await test.step('Admin: Delete bank', async () => {
      await deleteBank(page, bankName2);
    });

    await test.step('Admin: Verify success toast after delete', async () => {
      await expectSuccessToast(page);
    });

    await test.step('Admin: Logout', async () => {
      await logout(page);
    });
  });
});

// Made with Bob