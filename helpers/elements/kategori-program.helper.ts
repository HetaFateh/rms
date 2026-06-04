/** Kategori Program management locators and actions. */
import { Page, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Section 1: Element Factories (pure locators — no await, no actions)
// ---------------------------------------------------------------------------

export const kategoriProgramElements = (page: Page) => ({
  btnTambah:      page.getByRole('button', { name: 'Tambah' }),
  btnSimpan:      page.getByRole('button', { name: 'Simpan' }),
  btnHapus:       page.getByRole('button', { name: 'Hapus' }),
  // Create form uses name attributes
  inputNamaCreate:      page.locator('input[name="NAMA"]'),
  inputKodeCreate:      page.locator('input[name="KODE"]'),
  inputDeskripsiCreate: page.locator('input[name="DESKRIPSI"]'),
  // Edit form uses ID attributes
  inputNamaEdit:      page.locator('#nama'),
  inputKodeEdit:      page.locator('#code'),
  inputDeskripsiEdit: page.locator('#desc'),
  inputSearch:    page.getByRole('textbox', { name: 'Search' }),
});

/**
 * Get edit button for a specific kategori program by finding the row containing the name.
 */
export const getKategoriProgramEditButton = (page: Page, nama: string) => {
  return page.getByRole('row').filter({ hasText: nama }).getByRole('button').nth(0);
};

/**
 * Get delete button for a specific kategori program by finding the row containing the name.
 */
export const getKategoriProgramDeleteButton = (page: Page, nama: string) => {
  return page.getByRole('row').filter({ hasText: nama }).getByRole('button').nth(1);
};

/**
 * Get kategori program cell to verify it exists in table.
 */
export const getKategoriProgramCell = (page: Page, nama: string) => {
  return page.getByRole('cell', { name: nama, exact: true });
};

// ---------------------------------------------------------------------------
// Section 2: Action Helpers (async functions)
// ---------------------------------------------------------------------------

export async function searchKategoriProgram(page: Page, searchTerm: string): Promise<void> {
  const el = kategoriProgramElements(page);
  await el.inputSearch.clear();
  await el.inputSearch.fill(searchTerm);
  await page.waitForTimeout(500);
}

export async function createKategoriProgram(
  page: Page,
  nama: string,
  kode: string,
  deskripsi: string
): Promise<void> {
  const el = kategoriProgramElements(page);
  await el.btnTambah.click();
  await page.waitForLoadState('networkidle');
  await el.inputNamaCreate.fill(nama);
  await el.inputKodeCreate.fill(kode);
  await el.inputDeskripsiCreate.fill(deskripsi);
  await el.btnSimpan.click();
  await page.waitForTimeout(2000);
}

export async function editKategoriProgram(
  page: Page,
  oldNama: string,
  newNama: string,
  newKode: string,
  newDeskripsi: string
): Promise<void> {
  const el = kategoriProgramElements(page);
  const sidebar = globalElements(page);
  await searchKategoriProgram(page, oldNama);
  await getKategoriProgramEditButton(page, oldNama).click();
  await page.waitForLoadState('networkidle');
  await el.inputNamaEdit.clear();
  await el.inputNamaEdit.fill(newNama);
  await el.inputKodeEdit.clear();
  await el.inputKodeEdit.fill(newKode);
  await el.inputDeskripsiEdit.clear();
  await el.inputDeskripsiEdit.fill(newDeskripsi);
  await el.btnSimpan.click();
  await page.waitForTimeout(2000);
  // Navigate back to Kategori Program list
  await sidebar.btnSetting.click();
  await sidebar.linkKategoriProgram.click();
  await page.waitForLoadState('networkidle');
}

export async function deleteKategoriProgram(page: Page, nama: string): Promise<void> {
  const el = kategoriProgramElements(page);
  await searchKategoriProgram(page, nama);
  await getKategoriProgramDeleteButton(page, nama).click();
  await el.btnHapus.click();
  await page.waitForTimeout(2000);
}

export async function expectKategoriProgramVisible(page: Page, nama: string): Promise<void> {
  await searchKategoriProgram(page, nama);
  await expect(getKategoriProgramCell(page, nama)).toBeVisible({ timeout: 10_000 });
}

// Made with Bob