/** Bank management locators and actions. */
import { Page, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Section 1: Element Factories (pure locators — no await, no actions)
// ---------------------------------------------------------------------------

export const bankElements = (page: Page) => ({
  btnTambah:  page.getByRole('button', { name: 'Tambah' }),
  btnSimpan:  page.getByRole('button', { name: 'Simpan' }),
  btnHapus:   page.getByRole('button', { name: 'Hapus' }),
  inputName:  page.locator('input[name="name"]'),
  inputCode:  page.locator('input[name="code"]'),
});

/**
 * Get edit button for a specific bank by finding the row containing the bank name.
 */
export const getBankEditButton = (page: Page, bankName: string) => {
  return page.getByRole('row').filter({ hasText: bankName }).getByRole('button').nth(0);
};

/**
 * Get delete button for a specific bank by finding the row containing the bank name.
 */
export const getBankDeleteButton = (page: Page, bankName: string) => {
  return page.getByRole('row').filter({ hasText: bankName }).getByRole('button').nth(1);
};

/**
 * Get bank cell to verify bank exists in table.
 */
export const getBankCell = (page: Page, bankName: string) => {
  return page.getByRole('cell', { name: bankName });
};

// ---------------------------------------------------------------------------
// Section 2: Action Helpers (async functions)
// ---------------------------------------------------------------------------

export async function createBank(page: Page, bankName: string, bankCode: string): Promise<void> {
  const el = bankElements(page);
  await el.btnTambah.click();
  await el.inputName.waitFor({ state: 'visible', timeout: 10_000 });
  await el.inputName.fill(bankName);
  await el.inputCode.fill(bankCode);
  await el.btnSimpan.click();
  // Wait for modal to close or toast to appear
  await page.waitForTimeout(2000);
}

export async function editBank(page: Page, oldName: string, newName: string, newCode: string): Promise<void> {
  const el = bankElements(page);
  await getBankEditButton(page, oldName).click();
  await el.inputName.waitFor({ state: 'visible', timeout: 10_000 });
  await el.inputName.fill(newName);
  await el.inputCode.fill(newCode);
  await el.btnSimpan.click();
}

export async function deleteBank(page: Page, bankName: string): Promise<void> {
  const el = bankElements(page);
  await getBankDeleteButton(page, bankName).click();
  await el.btnHapus.click();
}

export async function expectBankVisible(page: Page, bankName: string): Promise<void> {
  await expect(getBankCell(page, bankName)).toBeVisible({ timeout: 10_000 });
}

// Made with Bob
