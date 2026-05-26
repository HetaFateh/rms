import { test, expect } from '../../helpers/base.test';
import { login, logout } from '../../helpers/elements/auth.helper';
import { sidebarElements, expectSuccessToast } from '../../helpers/elements/global.elements';
import { createBrand, editBrand, deleteBrand, expectBrandVisible } from '../../helpers/elements/brand.helper';
import { testToggle } from '../../test.config';
import { TEST_DATA } from '../../helpers/data.helper';

test.describe.serial('Brand Management', () => {
  test.beforeAll(() => {
    if (!testToggle.runBrandManagement) test.skip();
  });

  test('TC-BM-E2E-001 | Create, Edit, and Delete brand', async ({ page }) => {
    const brandName1 = TEST_DATA.brand.name();
    const brandName2 = TEST_DATA.brand.name();

    await test.step('Admin: Login and navigate to Brand page', async () => {
      await login(page, 'admin');
      const sidebar = sidebarElements(page);
      await sidebar.btnSetting.click();
      await sidebar.linkBrand.click();
    });

    await test.step('Admin: Create new brand', async () => {
      await createBrand(page, brandName1);
    });

    await test.step('Admin: Verify success toast after create', async () => {
      await expectSuccessToast(page);
    });

    await test.step('Admin: Verify brand appears in table', async () => {
      await expectBrandVisible(page, brandName1);
    });

    await test.step('Admin: Edit brand name', async () => {
      await editBrand(page, brandName1, brandName2);
    });

    await test.step('Admin: Verify success toast after edit', async () => {
      await expectSuccessToast(page);
    });

    await test.step('Admin: Verify updated brand appears in table', async () => {
      await expectBrandVisible(page, brandName2);
    });

    await test.step('Admin: Delete brand', async () => {
      await deleteBrand(page, brandName2);
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
