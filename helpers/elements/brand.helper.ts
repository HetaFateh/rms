/** Brand management locators and actions. */
import { Page, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Section 1: Element Factories (pure locators — no await, no actions)
// ---------------------------------------------------------------------------

export const brandElements = (page: Page) => ({
  btnTambah:  page.getByRole('button', { name: 'Tambah' }),
  btnSimpan:  page.getByRole('button', { name: 'Simpan' }),
  btnHapus:   page.getByRole('button', { name: 'Hapus' }),
  inputName:  page.locator('#name'),
});

/**
 * Get edit button for a specific brand by finding the row containing the brand name.
 * The edit button is the icon button with a pencil icon in that row.
 */
export const getBrandEditButton = (page: Page, brandName: string) => {
  return page.getByRole('row').filter({ hasText: brandName }).getByRole('button').nth(0);
};

/**
 * Get delete button for a specific brand by finding the row containing the brand name.
 * The delete button is the icon button with a trash icon in that row.
 */
export const getBrandDeleteButton = (page: Page, brandName: string) => {
  return page.getByRole('row').filter({ hasText: brandName }).getByRole('button').nth(1);
};

/**
 * Get brand cell to verify brand exists in table.
 */
export const getBrandCell = (page: Page, brandName: string) => {
  return page.getByRole('cell', { name: brandName });
};

// ---------------------------------------------------------------------------
// Section 2: Action Helpers (async functions)
// ---------------------------------------------------------------------------

export async function createBrand(page: Page, brandName: string): Promise<void> {
  const el = brandElements(page);
  await el.btnTambah.click();
  await el.inputName.waitFor({ state: 'visible', timeout: 10_000 });
  await el.inputName.fill(brandName);
  await el.btnSimpan.click();
}

export async function editBrand(page: Page, oldName: string, newName: string): Promise<void> {
  const el = brandElements(page);
  await getBrandEditButton(page, oldName).click();
  await el.inputName.click();
  await el.inputName.fill(newName);
  await el.btnSimpan.click();
}

export async function deleteBrand(page: Page, brandName: string): Promise<void> {
  const el = brandElements(page);
  await getBrandDeleteButton(page, brandName).click();
  await el.btnHapus.click();
}

export async function expectBrandVisible(page: Page, brandName: string): Promise<void> {
  await expect(getBrandCell(page, brandName)).toBeVisible({ timeout: 10_000 });
}

// Made with Bob
