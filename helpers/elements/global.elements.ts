/**
 * helpers/elements/global.elements.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Shared, application-wide locators:
 *   - Login page
 *   - Sidebar navigation (all menu groups)
 *   - Navbar (notification bell, profile/avatar menu)
 *   - Notification toasts
 *
 * Rules (see agents.md):
 *   ✅ Only locator definitions — NO `await`, NO `.click()`, NO actions here.
 *   ✅ Return a plain object so callers can destructure or dot-access naturally.
 *   ✅ Prefer getByRole > getByLabel > locator('[name]') > CSS (last resort).
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { Page } from '@playwright/test';

// ── Login Page ────────────────────────────────────────────────────────────────

export const loginElements = (page: Page) => ({
  /** Primary CTA on the landing screen */
  btnMasuk:        page.getByRole('button', { name: 'Masuk' }),
  inputUsername:   page.getByRole('textbox', { name: /username/i }),
  inputPassword:   page.getByRole('textbox', { name: /password/i }),
  /** Post-login greeting text visible on the dashboard */
  textWelcome:     page.getByText('Selamat Pagi'),
});

// ── Navbar ────────────────────────────────────────────────────────────────────

export const navbarElements = (page: Page) => ({
  /** Notification bell (first Flowbite logo button in the navbar) */
  btnNotifikasi:      page.getByRole('button', { name: 'Flowbite React Logo' }).first(),
  /** "No notifications" label inside the notification panel */
  textTidakAdaNotif:  page.getByText('Tidak ada notifikasi'),
  /** Profile/Avatar dropdown trigger (second Flowbite logo button) */
  btnAvatar:          page.getByRole('button', { name: 'Flowbite React Logo' }).nth(1),
  /** Logout action inside the avatar dropdown */
  btnLogout:          page.getByRole('button', { name: 'Logout' }),
});

// ── Sidebar – Top-level links ─────────────────────────────────────────────────

export const sidebarElements = (page: Page) => ({
  // ── Single links ─────────────────────────────────────────────────────────
  linkEditProfile:  page.getByRole('link', { name: 'Edit Profile' }),
  linkDashboard:    page.getByRole('link', { name: 'Dashboard' }),

  // ── Manage Program group ──────────────────────────────────────────────────
  btnManageProgram:         page.getByRole('button', { name: 'Manage Program' }),
  linkSubscribeApproval:    page.getByRole('link',   { name: 'Subscribe Approval' }),
  linkProgramManagement:    page.getByRole('link',   { name: 'Program Management' }),
  linkProgramApproval:      page.getByRole('link',   { name: 'Program Approval' }),

  // ── Manage User group ─────────────────────────────────────────────────────
  btnManageUser:    page.getByRole('button', { name: 'Manage User' }),
  linkCalonAgent:   page.getByRole('link',   { name: 'Calon Agent' }),
  linkAgent:        page.getByRole('link',   { name: 'Agent', exact: true }),
  linkUser:         page.getByRole('link',   { name: 'User' }),
  linkVerifyAgent:  page.getByRole('link',   { name: 'Verify Agent' }),

  // ── Point Transaction group ───────────────────────────────────────────────
  btnPointTransaction: page.getByRole('button', { name: 'Point Transaction' }),
  linkEarningPoin:     page.getByRole('link',   { name: 'Earning Poin' }),
  linkPenukaranPoin:   page.getByRole('link',   { name: 'Penukaran Poin' }),

  // ── Campaign & Report group ───────────────────────────────────────────────
  btnCampaignReport: page.getByRole('button', { name: 'Campaign & Report' }),
  linkEmail:         page.getByRole('link',   { name: 'Email' }),
  linkTwibbon:       page.getByRole('link',   { name: 'Twibbon' }),
  linkUrlClicked:    page.getByRole('link',   { name: 'URL Clicked' }),
  linkSocmedShared:  page.getByRole('link',   { name: 'Socmed Shared' }),
  linkPsbTag:        page.getByRole('link',   { name: 'PSB Tag' }),

  // ── Support group ─────────────────────────────────────────────────────────
  btnSupport:  page.getByRole('button', { name: 'Support' }),
  linkTicket:  page.getByRole('link',   { name: 'Ticket' }),

  // ── Setting group ─────────────────────────────────────────────────────────
  btnSetting:           page.getByRole('button', { name: 'Setting' }),
  linkProduk:           page.getByRole('link',   { name: 'Produk', exact: true }),
  linkKategoriProduk:   page.getByRole('link',   { name: 'Kategori Produk' }),
  linkKategoriProgram:  page.getByRole('link',   { name: 'Kategori Program' }),
  linkRedeem:           page.getByRole('link',   { name: 'Redeem' }),
  linkChannel:          page.getByRole('link',   { name: 'Channel' }),
  linkBank:             page.getByRole('link',   { name: 'Bank' }),
  linkBrand:            page.getByRole('link',   { name: 'Brand' }),
});

// ── Global Notification Toasts ────────────────────────────────────────────────

export const toastElements = (page: Page) => ({
  /** Generic success toast (any text containing "Success") */
  toastSuccess: page.getByText('Success', { exact: false }),
  /** Generic error toast (any text containing "Error") */
  toastError:   page.getByText('Error',   { exact: false }),
});
