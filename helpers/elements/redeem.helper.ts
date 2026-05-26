/** Redeem management locators and actions. */
import { Page } from '@playwright/test';
import { sidebarElements } from './global.elements';

// ---------------------------------------------------------------------------
// Section 1: Element Factories (pure locators — no await, no actions)
// ---------------------------------------------------------------------------

export const redeemElements = (page: Page) => ({
  btnTambah:             page.getByRole('button', { name: 'Tambah' }).or(page.getByRole('link', { name: 'Tambah' })),
  btnSimpan:             page.getByRole('button', { name: 'Simpan' }),
  inputPoin:             page.locator('input[name="POIN"]'),
  inputMinimumPoinRedeem: page.locator('input[name="MINIMUM_POIN_REDEEM"]'),
  inputStartDate:        page.locator('#expired-start-date'),
  inputEndDate:          page.locator('#expired-end-date'),
  inputHari:             page.locator('#hari'),
  inputAdminFee:         page.locator('input[name="ADMIN_FEE"]'),
});

// ---------------------------------------------------------------------------
// Section 2: Action Helpers (async functions)
// ---------------------------------------------------------------------------

export async function navigateToRedeem(page: Page): Promise<void> {
  const sidebar = sidebarElements(page);
  await sidebar.btnSetting.click();
  await sidebar.linkRedeem.click();
  await page.waitForLoadState('networkidle');
}

/** Returns today's date and today+7 as ISO strings (YYYY-MM-DD). */
function getRedeemDates(): { startDate: string; endDate: string } {
  const today = new Date();
  const end   = new Date(today);
  end.setDate(today.getDate() + 7);

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  return { startDate: fmt(today), endDate: fmt(end) };
}

export async function createRedeem(
  page: Page,
  poin: string,
  minimumPoinRedeem: string,
  hari: string,
  adminFee: string,
): Promise<void> {
  const el = redeemElements(page);
  const { startDate, endDate } = getRedeemDates();

  await el.btnTambah.click();
  await el.inputPoin.waitFor({ state: 'visible', timeout: 10_000 });

  await el.inputPoin.fill(poin);
  await el.inputMinimumPoinRedeem.fill(minimumPoinRedeem);
  await el.inputStartDate.fill(startDate);
  await el.inputEndDate.fill(endDate);
  await el.inputHari.fill(hari);
  await el.inputAdminFee.fill(adminFee);

  await el.btnSimpan.click();
}
