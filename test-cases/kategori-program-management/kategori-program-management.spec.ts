import { test, expect } from '../../helpers/base.test';
import { login, logout } from '../../helpers/elements/auth.helper';
import { sidebarElements, expectSuccessToast } from '../../helpers/elements/global.elements';
import {
  createKategoriProgram,
  editKategoriProgram,
  deleteKategoriProgram,
  expectKategoriProgramVisible,
} from '../../helpers/elements/kategori-program.helper';
import { testToggle } from '../../test.config';
import { TEST_DATA } from '../../helpers/data.helper';

test.describe.serial('Kategori Program Management', () => {
  test.beforeAll(() => {
    if (!testToggle.runKategoriProgramManagement) test.skip();
  });

  test('TC-KP-E2E-001 | Create, Edit, and Delete kategori program', async ({ page }) => {
    const nama1 = TEST_DATA.kategoriProgram.nama();
    const kode1 = TEST_DATA.kategoriProgram.kode();
    const deskripsi1 = TEST_DATA.kategoriProgram.deskripsi();
    const nama2 = TEST_DATA.kategoriProgram.nama();
    const kode2 = TEST_DATA.kategoriProgram.kode();
    const deskripsi2 = TEST_DATA.kategoriProgram.deskripsi();

    await test.step('Admin: Login and navigate to Kategori Program page', async () => {
      await login(page, 'admin');
      const sidebar = sidebarElements(page);
      await sidebar.btnSetting.click();
      await sidebar.linkKategoriProgram.click();
    });

    await test.step('Admin: Create new kategori program', async () => {
      await createKategoriProgram(page, nama1, kode1, deskripsi1);
    });

    await test.step('Admin: Verify success toast after create', async () => {
      await expectSuccessToast(page);
    });

    await test.step('Admin: Verify kategori program appears in table', async () => {
      await expectKategoriProgramVisible(page, nama1);
    });

    await test.step('Admin: Edit kategori program', async () => {
      await editKategoriProgram(page, nama1, nama2, kode2, deskripsi2);
    });

    await test.step('Admin: Verify success toast after edit', async () => {
      await expectSuccessToast(page);
    });

    await test.step('Admin: Verify updated kategori program appears in table', async () => {
      await page.waitForTimeout(1000); // Wait for page to settle after edit
      await expectKategoriProgramVisible(page, nama2);
    });

    await test.step('Admin: Delete kategori program', async () => {
      await deleteKategoriProgram(page, nama2);
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