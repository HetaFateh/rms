/** Locators and actions for User Management flows. */
import { Page, Locator } from '@playwright/test';
import { sidebarElements } from './global.elements';

async function navigateSidebar(
  page: Page,
  groupBtn: Locator,
  link: Locator,
): Promise<void> {
  await groupBtn.click();
  await link.waitFor({ state: 'visible', timeout: 10_000 });
  await link.click();
}

// ---------------------------------------------------------------------------
// Section 1: Element Factories (pure locators — no await, no actions)
// ---------------------------------------------------------------------------

export const userFormElements = (page: Page) => ({
  uploadProfileFoto: page.locator('input[type="file"]'),
  inpNama:            page.locator('input[name="NAMA"]'),
  drpJenisKelamin:    page.locator('select[name="JENIS_KELAMIN"]'),
  inpTanggalLahir:    page.locator('input[name="TANGGAL_LAHIR"]'),
  inpAlamat:          page.locator('input[name="ADDRESS"]'),
  drpKota:            page.locator('#kota_id'),
  inpEmail:           page.locator('input[name="EMAIL"]'),
  inpNoHp:            page.getByRole('spinbutton'),
  inpPassword:        page.locator('input[name="PASSWORD"]'),
  drpRole:            page.locator('select[name="ROLE_ID"]'),
  drpAsalRegister:    page.locator('#asal-register'),
  btnSimpan:          page.getByRole('button', { name: 'Simpan' }),
});

// ---------------------------------------------------------------------------
// Section 2: Action Helpers (async functions)
// ---------------------------------------------------------------------------

export async function navigateToUserManagement(page: Page): Promise<void> {
  const sidebar = sidebarElements(page);
  await navigateSidebar(page, sidebar.btnManageUser, sidebar.linkUser);
}

export async function navigateToCreateUser(page: Page): Promise<void> {
  await navigateToUserManagement(page);
  await page.getByRole('link', { name: 'Tambah' }).click();
}

export async function fillUserForm(
  page: Page,
  data: {
    name: string;
    gender: string;
    address: string;
    cityId: string;
    email: string;
    password: string;
    roleId: string;
    asalRegister: string;
  },
  imagePath: string
): Promise<void> {
  const el = userFormElements(page);

  // Generate random date before today (e.g. 1990-01-01 to 2005-12-31)
  const birthYear = Math.floor(Math.random() * (2005 - 1990 + 1)) + 1990;
  const birthMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const birthDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  const dob = `${birthYear}-${birthMonth}-${birthDay}`;

  // Generate random 12-digit phone number starting with 081
  const randomDigits = Math.floor(100000000 + Math.random() * 900000000); // 9 digits
  const phone = `081${randomDigits}`;

  // Generate random email to avoid duplicate 409 conflicts
  const randomStr = Math.random().toString(36).substring(2, 8);
  const email = `agent_${randomStr}@getnada.com`;

  // Fill in the form fields
  await el.uploadProfileFoto.setInputFiles(imagePath);
  await el.inpNama.fill(data.name);
  await el.drpJenisKelamin.selectOption(data.gender);
  await el.inpTanggalLahir.fill(dob);
  await el.inpAlamat.fill(data.address);
  await el.drpKota.selectOption(data.cityId);
  await el.inpEmail.fill(email);
  await el.inpNoHp.fill(phone);
  await el.inpPassword.fill(data.password);
  await el.drpRole.selectOption(data.roleId);
  await el.drpAsalRegister.selectOption(data.asalRegister);
}

export async function saveUser(page: Page): Promise<void> {
  const el = userFormElements(page);
  await el.btnSimpan.click();
}
