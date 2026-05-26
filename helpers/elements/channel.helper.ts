/** Channel management locators and actions. */
import { Page, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Section 1: Element Factories (pure locators — no await, no actions)
// ---------------------------------------------------------------------------

export const channelElements = (page: Page) => ({
  btnTambah:  page.getByRole('button', { name: 'Tambah' }),
  btnSimpan:  page.getByRole('button', { name: 'Simpan' }),
  btnHapus:   page.getByRole('button', { name: 'Hapus' }),
  inputName:  page.getByRole('textbox', { name: 'Nama' }),
  inputCode:  page.getByRole('textbox', { name: 'Code' }),
  inputDesc:  page.getByRole('textbox', { name: 'Desc' }),
  inputSearch: page.getByRole('textbox', { name: 'Search' }),
});

/**
 * Get edit button for a specific channel by finding the row containing the channel name.
 */
export const getChannelEditButton = (page: Page, channelName: string) => {
  return page.getByRole('row').filter({ hasText: channelName }).getByRole('button').nth(0);
};

/**
 * Get delete button for a specific channel by finding the row containing the channel name.
 */
export const getChannelDeleteButton = (page: Page, channelName: string) => {
  return page.getByRole('row').filter({ hasText: channelName }).getByRole('button').nth(1);
};

/**
 * Get channel cell to verify channel exists in table.
 */
export const getChannelCell = (page: Page, channelName: string) => {
  return page.getByRole('cell', { name: channelName, exact: true });
};

// ---------------------------------------------------------------------------
// Section 2: Action Helpers (async functions)
// ---------------------------------------------------------------------------

export async function navigateToChannel(page: Page): Promise<void> {
  const { sidebarElements } = await import('./global.elements');
  const sidebar = sidebarElements(page);
  await sidebar.btnSetting.click();
  await sidebar.linkChannel.click();
  await page.waitForLoadState('networkidle');
}

export async function createChannel(
  page: Page,
  name: string,
  code: string,
  desc: string,
): Promise<void> {
  const el = channelElements(page);
  await el.btnTambah.click();
  await el.inputName.waitFor({ state: 'visible', timeout: 10_000 });
  await el.inputName.fill(name);
  await el.inputCode.fill(code);
  await el.inputDesc.fill(desc);
  await el.btnSimpan.click();
}

export async function searchChannel(page: Page, channelName: string): Promise<void> {
  const el = channelElements(page);
  await el.inputSearch.fill(channelName);
  await page.waitForLoadState('networkidle');
}

export async function editChannel(
  page: Page,
  oldName: string,
  newName: string,
  newCode: string,
): Promise<void> {
  const el = channelElements(page);
  await searchChannel(page, oldName);
  await getChannelEditButton(page, oldName).click();
  await el.inputName.waitFor({ state: 'visible', timeout: 10_000 });
  await el.inputName.fill(newName);
  await el.inputCode.fill(newCode);
  await el.btnSimpan.click();
}

export async function deleteChannel(page: Page, channelName: string): Promise<void> {
  const el = channelElements(page);
  await searchChannel(page, channelName);
  await getChannelDeleteButton(page, channelName).click();
  await el.btnHapus.waitFor({ state: 'visible', timeout: 10_000 });
  await el.btnHapus.click();
}

export async function expectChannelVisible(page: Page, channelName: string): Promise<void> {
  await searchChannel(page, channelName);
  await expect(getChannelCell(page, channelName)).toBeVisible({ timeout: 10_000 });
}
