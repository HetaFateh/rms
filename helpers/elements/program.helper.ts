import { Page, Locator } from '@playwright/test';
import { sidebarElements } from './global.elements';
import { TEST_DATA } from '../data.helper';

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 1 – SHARED LOW-LEVEL HELPERS
// ══════════════════════════════════════════════════════════════════════════════

/** Expand a sidebar group button then click a link inside it. */
async function navigateSidebar(
  page: Page,
  groupBtn: Locator,
  link: Locator,
): Promise<void> {
  await groupBtn.click();
  await link.waitFor({ state: 'visible', timeout: 10_000 });
  await link.click();
}

/** Find a table row by text and click a button at the given index. */
async function clickTableRowButton(
  page: Page,
  rowText: string,
  buttonIndex: number,
): Promise<void> {
  const row = page.getByRole('row').filter({ hasText: rowText });
  await row.getByRole('button').nth(buttonIndex).click();
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 2 – ELEMENT FACTORIES
// ══════════════════════════════════════════════════════════════════════════════

// ── Tab: Program (main data form) ─────────────────────────────────────────────

export const tabProgramElements = (page: Page) => ({
  inputNama:               page.locator('input[name="NAMA"]'),
  inputKode:               page.locator('input[name="KODE"]'),
  inputThresholdExpired:   page.locator('input[name="THRESHOLD_EXPIRED_PROGRAM"]'),
  textareaInfo:            page.locator('textarea[name="INFO"]'),
  textareaKvWording:       page.locator('textarea[name="KV_WORDING"]'),
  inputRedirectLink:       page.locator('input[name="REDIRECT_LINK"]'),
  inputMaxPoin:            page.locator('input[name="MAKSIMUM_JUMLAH_POIN"]'),
  inputBudget:             page.locator('input[name="BUDGET_PER_PROGRAM"]'),
  inputThresholdBudget:    page.locator('input[name="THRESHOLD_BUDGET_PROGRAM"]'),
  textareaNotifSms:        page.locator('textarea[name="NOTIFICATION_SMS"]'),
  inputPromoId:            page.locator('input[name="PROMO_ID"]'),
  inputEarningPoin:        page.locator('input[name*="EARNING_POIN"]'),

  spinbuttonTanggalMulai:  page.getByRole('spinbutton').first(),
  spinbuttonBulanMulai:    page.getByRole('spinbutton').nth(1),
  spinbuttonTanggalAkhir:  page.getByRole('spinbutton').nth(2),
  spinbuttonBulanAkhir:    page.getByRole('spinbutton').nth(3),

  // ⚠️ React-Select auto-generated CSS classes — replace with data-testid when available.
  dropdownKategori:     page.locator('.css-19bb58m').first(),
  dropdownSubKategori:  page.locator('.css-hlgwow > .css-19bb58m').first(),
  dropdownProduk:       page.locator(
    '.mb-3 > .css-b62m3t-container > .css-13cymwt-control > .css-hlgwow > .css-19bb58m'
  ),
  // ⚠️ Product dropdown in EDIT mode (different position)
  dropdownProdukEdit:   page.locator(
    'div:nth-child(10) > div > .css-b62m3t-container > .css-13cymwt-control > .css-hlgwow > .css-19bb58m'
  ),
  dropdownChannel:      page.locator(
    'div:nth-child(7) > div > .css-b62m3t-container > .css-13cymwt-control > .css-hlgwow > .css-19bb58m'
  ),
  // ⚠️ Customer Bonus dropdown
  dropdownCustomerBonus: page.locator('.css-b62m3t-container').filter({ hasText: 'Customer Bonus' }).locator('.css-19bb58m'),

  optionKvKategoriProgram: page.getByRole('option', { name: 'KV Kategori Program' }),
  optionKhususKv:          page.getByRole('option', { name: 'Khusus KV' }),
  optionKvProduk:          page.getByRole('option', { name: 'KV Produk' }),
  optionHaloUnlimited:     page.getByRole('option', { name: 'Halo Unlimited 80K 80rb' }),
  optionKvChannel:         page.getByRole('option', { name: 'KV Channel' }),

  uploadProgramImage: page.getByLabel('Program', { exact: true }).locator('input[type="file"]'),
  checkboxTelkomsel:    page.getByRole('checkbox', { name: 'Telkomsel',     exact: true }),
  checkboxNonTelkomsel: page.getByRole('checkbox', { name: 'Non-Telkomsel'               }),
  btnSimpan:            page.getByRole('button', { name: 'Simpan' }),
});

// ── Tab: Foto ─────────────────────────────────────────────────────────────────

export const tabFotoElements = (page: Page) => ({
  tabFoto:              page.getByRole('tab',     { name: 'Foto' }),
  uploadFoto:           page.getByRole('tabpanel', { name: 'Foto' }).locator('input[type="file"]'),
  inputFotoJudul:       page.locator('input[name="FOTO_JUDUL"]'),
  textareaFotoDeskripsi: page.locator('textarea[name="FOTO_DESKRIPSI"]'),
  inputWording:         page.getByRole('textbox', { name: 'Nikmati Promo {Produk} Segera' }),
  btnTambahWording:     page.getByRole('button',  { name: 'Tambah Wording' }),
});

// ── Tab: Payment Limitation ───────────────────────────────────────────────────

export const tabPaymentLimitationElements = (page: Page) => ({
  tabPaymentLimitation: page.getByRole('tab',     { name: 'Payment Limitation' }),
  btnTambah:            page.getByRole('button', { name: 'Tambah' }),
  comboboxPayment:      page.getByRole('combobox'),
  btnKonfirmasiRow:     page.getByRole('button').nth(1),
  inputTermAndCondition: page.locator('#TERM_AND_CONDITION_1'),
  btnSimpan:            page.getByRole('button', { name: 'Simpan' }),
});

// ── Tab: Sales Fee ────────────────────────────────────────────────────────────

export const tabSalesFeeElements = (page: Page) => ({
  tabSalesFee:         page.getByRole('tab',     { name: 'Sales Fee' }),
  comboboxPeriod:      page.getByRole('combobox'),
  inputAgentUpline:    page.locator('input[name="SALES_FEE.AGENT_UPLINE"]'),
  inputAgentDownline1: page.locator('input[name="SALES_FEE.AGENT_DOWNLINE_1"]'),
  btnSimpan:           page.getByRole('button', { name: 'Simpan' }),
});

// ── Program List (table) ──────────────────────────────────────────────────────

export const programListElements = (page: Page) => ({
  inputSearch: page.getByRole('textbox', { name: 'Search' }),
});

// ── Approval Modal ────────────────────────────────────────────────────────────

export const approvalFormElements = (page: Page) => ({
  radioApprove: page.getByRole('radio').first(),
  radioReject:  page.getByRole('radio').nth(1),
  btnKirim:     page.getByRole('button', { name: 'Kirim' }),
});

// ── Delete Confirmation Modal ─────────────────────────────────────────────────

export const deleteModalElements = (page: Page) => ({
  btnConfirmDelete: page.getByRole('button', { name: 'Ya' }),
});

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 3 – NAVIGATION ACTIONS
// ══════════════════════════════════════════════════════════════════════════════

export async function navigateToCreateProgram(page: Page): Promise<void> {
  const sidebar = sidebarElements(page);
  await navigateSidebar(page, sidebar.btnManageProgram, sidebar.linkProgramManagement);
  await page.getByRole('link', { name: 'Tambah' }).click();
}

export async function navigateToProgramManagement(page: Page): Promise<void> {
  const sidebar = sidebarElements(page);
  await navigateSidebar(page, sidebar.btnManageProgram, sidebar.linkProgramManagement);
}

export async function navigateToProgramApproval(page: Page): Promise<void> {
  const sidebar = sidebarElements(page);
  await sidebar.linkProgramApproval.click();
  await page.waitForLoadState('networkidle');
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 4 – PROGRAM MANAGEMENT ACTIONS
// ══════════════════════════════════════════════════════════════════════════════

export async function fillTabProgram(page: Page, imagePath: string): Promise<void> {
  const el = tabProgramElements(page);
  const d = TEST_DATA.program;

  await el.inputNama.fill(d.name);
  await el.inputKode.fill(d.code);
  await el.inputThresholdExpired.fill(d.thresholdExpired);
  await el.textareaInfo.fill(d.name);
  await el.inputPromoId.fill(d.benefit);

  // ⚠️ React-Select dropdowns — brittle CSS selectors
  await el.dropdownKategori.click();
  await el.optionKvKategoriProgram.click();
  await el.dropdownSubKategori.click();
  await el.optionKhususKv.click();
  await el.dropdownSubKategori.click();
  await el.optionKvProduk.click();
  await el.dropdownProduk.click();
  await el.optionHaloUnlimited.click();

  await el.spinbuttonTanggalMulai.fill('2');
  await el.spinbuttonBulanMulai.fill('2');
  await el.spinbuttonTanggalAkhir.fill('1');
  await el.spinbuttonBulanAkhir.fill('5');

  await el.btnSimpan.click();

  await el.textareaKvWording.fill(d.name);
  await el.uploadProgramImage.setInputFiles(imagePath);
  await el.inputRedirectLink.fill(d.redirectLink);
  await el.inputMaxPoin.fill(d.maxPoin);
  await el.inputBudget.fill(d.budget);
  await el.inputThresholdBudget.fill(d.thresholdBudget);

  await el.dropdownChannel.click();
  await el.optionKvChannel.click();

  await el.textareaNotifSms.fill(d.name);
  await el.checkboxTelkomsel.check();
  await el.checkboxNonTelkomsel.check();
}

export async function fillTabFoto(page: Page, imagePath: string): Promise<void> {
  const el = tabFotoElements(page);
  const d = TEST_DATA.program;

  await el.tabFoto.click();
  await el.uploadFoto.setInputFiles(imagePath);
  await el.inputFotoJudul.fill(d.name);
  await el.textareaFotoDeskripsi.fill(d.name);
  await el.inputWording.fill(d.wording);
  await el.btnTambahWording.click();
}

export async function fillTabPaymentLimitation(page: Page): Promise<void> {
  const el = tabPaymentLimitationElements(page);

  await el.tabPaymentLimitation.click();
  await el.btnTambah.click();
  await el.comboboxPayment.selectOption('53');
  await el.btnKonfirmasiRow.click();
  await el.inputTermAndCondition.fill(' Test Automation');
  await el.btnSimpan.click();
}

export async function fillTabSalesFee(page: Page): Promise<void> {
  const el = tabSalesFeeElements(page);
  const d = TEST_DATA.program;

  await el.tabSalesFee.click();
  await el.comboboxPeriod.selectOption('1');
  await el.inputAgentUpline.fill(d.agentUpline);
  await el.inputAgentDownline1.fill(d.agentDownline1);
  await el.btnSimpan.click();
}

export async function searchProgram(page: Page, programName: string): Promise<void> {
  const el = programListElements(page);
  await el.inputSearch.fill(programName);
  await page.waitForLoadState('networkidle');
}

/** Click the 🗑 delete icon (3rd button) for the row matching `programName`. */
export async function clickDeleteIcon(page: Page, programName: string): Promise<void> {
  await clickTableRowButton(page, programName, 2);
}

/** Click the ✏️ edit icon (2nd button) for the row matching `programName`. */
export async function clickEditIcon(page: Page, programName: string): Promise<void> {
  await clickTableRowButton(page, programName, 1);
}

export async function confirmDeletion(page: Page): Promise<void> {
  await deleteModalElements(page).btnConfirmDelete.click();
}

export async function updateProgramDateRange(page: Page): Promise<void> {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 12);

  const fmt = (d: Date) => {
    const day = d.getDate();
    const suffix = day > 3 && day < 21 ? 'th' : ['st','nd','rd'][day % 10 - 1] ?? 'th';
    return {
      label: `Choose ${d.toLocaleString('en-US',{weekday:'long'})}, ${d.toLocaleString('en-US',{month:'long'})} ${day}${suffix}, ${d.getFullYear()}`,
    };
  };

  await page.getByRole('textbox', { name: 'Select date range' }).click();
  await page.getByRole('gridcell', { name: fmt(start).label }).click();
  await page.getByRole('gridcell', { name: fmt(end).label }).click();
  await page.waitForLoadState('networkidle');
}

export async function saveEditedProgram(page: Page): Promise<void> {
  await tabProgramElements(page).btnSimpan.click();
}

export async function updateProgramName(page: Page, newName: string): Promise<void> {
  const el = tabProgramElements(page);
  await el.inputNama.clear();
  await el.inputNama.fill(newName);
}

export async function updateProgramInfo(page: Page, newInfo: string): Promise<void> {
  const el = tabProgramElements(page);
  await el.textareaInfo.clear();
  await el.textareaInfo.fill(newInfo);
}

export async function addProductToProgram(page: Page, productName: string): Promise<void> {
  await tabProgramElements(page).dropdownProdukEdit.click();
  await page.getByRole('option', { name: productName }).click();
}

export async function selectCustomerBonusAndFillEarningPoin(
  page: Page,
  bonusName: string,
  earningPoinValue: string,
): Promise<void> {
  await page.locator('.mb-3 > .css-b62m3t-container > .css-13cymwt-control > .css-hlgwow > .css-19bb58m').click();
  await page.getByRole('option', { name: bonusName }).click();

  const modal = page.getByRole('dialog', { name: 'Produk' });
  await modal.waitFor({ state: 'visible', timeout: 5_000 });

  const spinbuttons = modal.getByRole('spinbutton');
  for (let i = 0; i < 4; i++) {
    await spinbuttons.nth(i).fill(earningPoinValue);
  }

  await modal.getByRole('button', { name: 'Simpan' }).click();
  await modal.waitFor({ state: 'hidden', timeout: 5_000 });
}

export async function extendProgramEndDate(page: Page, newEndDay: string, newEndMonth: string): Promise<void> {
  const tanggalAkhir = page.locator('input[name="TANGGAL_AKHIR"]');
  const bulanAkhir   = page.locator('input[name="BULAN_AKHIR"]');
  await tanggalAkhir.clear();
  await tanggalAkhir.fill(newEndDay);
  await bulanAkhir.clear();
  await bulanAkhir.fill(newEndMonth);
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 5 – PROGRAM APPROVAL ACTIONS
// ══════════════════════════════════════════════════════════════════════════════

/** Click the ☑ approve icon for the row matching `programName`. */
export async function clickApproveIcon(page: Page, programName: string): Promise<void> {
  const row = page.getByRole('row').filter({ hasText: programName });
  await row.getByRole('button', { name: '☑' }).first().click();
}

export async function submitApproval(page: Page): Promise<void> {
  const form = approvalFormElements(page);
  await form.radioApprove.click();
  await form.btnKirim.click();
}

export async function submitRejection(page: Page): Promise<void> {
  const form = approvalFormElements(page);
  await form.radioReject.click();
  await form.btnKirim.click();
}
