/** Shared application-wide locators for login, sidebar navigation, navbar, and notifications. */
import { Page, expect } from '@playwright/test';

export const loginElements = (page: Page) => ({
  btnMasuk:        page.getByRole('button', { name: 'Masuk' }),
  inputUsername:   page.getByRole('textbox', { name: /username/i }),
  inputPassword:   page.getByRole('textbox', { name: /password/i }),
});

export const navbarElements = (page: Page) => ({
  btnNotifikasi:      page.getByRole('button', { name: 'Flowbite React Logo' }).first(),
  textTidakAdaNotif:  page.getByText('Tidak ada notifikasi'),
  btnAvatar:          page.getByRole('button', { name: 'Flowbite React Logo' }).nth(1),
  btnLogout:          page.getByRole('button', { name: 'Logout' }),
});

export const sidebarElements = (page: Page) => ({
  linkEditProfile:  page.getByRole('link', { name: 'Edit Profile' }),
  linkDashboard:    page.getByRole('link', { name: 'Dashboard' }),

  btnManageProgram:         page.getByRole('button', { name: 'Manage Program' }),
  linkSubscribeApproval:    page.getByRole('link',   { name: 'Subscribe Approval' }),
  linkProgramManagement:    page.getByRole('link',   { name: 'Program Management' }),
  linkProgramApproval:      page.getByRole('link',   { name: 'Program Approval' }),

  btnManageUser:    page.getByRole('button', { name: 'Manage User' }),
  linkCalonAgent:   page.getByRole('link',   { name: 'Calon Agent' }),
  linkAgent:        page.getByRole('link',   { name: 'Agent', exact: true }),
  linkUser:         page.getByRole('link',   { name: 'User' }),
  linkVerifyAgent:  page.getByRole('link',   { name: 'Verify Agent' }),

  btnPointTransaction: page.getByRole('button', { name: 'Point Transaction' }),
  linkEarningPoin:     page.getByRole('link',   { name: 'Earning Poin' }),
  linkPenukaranPoin:   page.getByRole('link',   { name: 'Penukaran Poin' }),

  btnCampaignReport: page.getByRole('button', { name: 'Campaign & Report' }),
  linkEmail:         page.getByRole('link',   { name: 'Email' }),
  linkTwibbon:       page.getByRole('link',   { name: 'Twibbon' }),
  linkUrlClicked:    page.getByRole('link',   { name: 'URL Clicked' }),
  linkSocmedShared:  page.getByRole('link',   { name: 'Socmed Shared' }),
  linkPsbTag:        page.getByRole('link',   { name: 'PSB Tag' }),

  btnSupport:  page.getByRole('button', { name: 'Support' }),
  linkTicket:  page.getByRole('link',   { name: 'Ticket' }),

  btnSetting:           page.getByRole('button', { name: 'Setting' }),
  linkProduk:           page.getByRole('link',   { name: 'Produk', exact: true }),
  linkKategoriProduk:   page.getByRole('link',   { name: 'Kategori Produk' }),
  linkKategoriProgram:  page.getByRole('link',   { name: 'Kategori Program' }),
  linkRedeem:           page.getByRole('link',   { name: 'Redeem' }),
  linkChannel:          page.getByRole('link',   { name: 'Channel' }),
  linkBank:             page.getByRole('link',   { name: 'Bank' }),
  linkBrand:            page.getByRole('link',   { name: 'Brand' }),
});

export const toastElements = (page: Page) => ({
  toastSuccess: page.getByText('Success', { exact: false }),
  toastError:   page.getByText('Error',   { exact: false }),
});

export async function expectSuccessToast(page: Page, timeout = 15_000): Promise<void> {
  await expect(toastElements(page).toastSuccess).toBeVisible({ timeout });
}
