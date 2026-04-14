/**
 * helpers/elements.helper.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all page locators.
 *
 * Locator priority (most to least stable):
 *   1. getByTestId  – requires data-testid attributes on the component
 *   2. getByRole    – semantic, language-agnostic
 *   3. getByLabel   – form fields associated with <label>
 *   4. locator('[name="…"]') – name attribute (fairly stable)
 *   5. locator('#id')        – HTML id (stable if static)
 *   6. CSS / XPath           – last resort; flag with ⚠️ warning comment
 *
 * How to add a new page:
 *   1. Create a new function following the pattern below.
 *   2. Accept `page: Page` as its only argument.
 *   3. Return a plain object of named locators.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { Page } from '@playwright/test';

// ── Login Page ────────────────────────────────────────────────────────────────

export function loginElements(page: Page) {
  return {
    /** Primary CTA on the landing screen */
    masukButton:    page.getByRole('button', { name: 'Masuk' }),
    usernameInput:  page.getByRole('textbox', { name: /username/i }),
    passwordInput:  page.getByRole('textbox', { name: /password/i }),
    /** Post-login greeting visible on the dashboard */
    welcomeGreeting: page.getByText('Selamat Pagi'),
  };
}

// ── Navigation / Sidebar ──────────────────────────────────────────────────────

export function navigationElements(page: Page) {
  return {
    manageProgramButton:      page.getByRole('button', { name: 'Manage Program' }),
    programManagementLink:    page.getByRole('link',   { name: 'Program Management' }),
    tambahLink:               page.getByRole('link',   { name: 'Tambah' }),
  };
}

// ── User / Profile Menu ───────────────────────────────────────────────────────

export function profileMenuElements(page: Page) {
  return {
    /** Avatar / logo button that opens the profile dropdown */
    avatarButton: page.getByRole('button', { name: 'Flowbite React Logo' }).nth(1),
    logoutButton: page.getByRole('button', { name: 'Logout' }),
  };
}

// ── Create Program – Tab: Program ─────────────────────────────────────────────

export function createProgramTabElements(page: Page) {
  return {
    // ── Input fields (name attribute — stable server-rendered form) ──────────
    namaInput:              page.locator('input[name="NAMA"]'),
    kodeInput:              page.locator('input[name="KODE"]'),
    thresholdExpiredInput:  page.locator('input[name="THRESHOLD_EXPIRED_PROGRAM"]'),
    infoTextarea:           page.locator('textarea[name="INFO"]'),
    kvWordingTextarea:      page.locator('textarea[name="KV_WORDING"]'),
    redirectLinkInput:      page.locator('input[name="redirect_link"]'),
    maxPoinInput:           page.locator('input[name="MAKSIMUM_JUMLAH_POIN"]'),
    budgetInput:            page.locator('input[name="BUDGET_PER_PROGRAM"]'),
    thresholdBudgetInput:   page.locator('input[name="THRESHOLD_BUDGET_PROGRAM"]'),
    notifSmsTextarea:       page.locator('textarea[name="NOTIFICATION_SMS"]'),

    // ── Spinbuttons (date range pickers / numeric inputs) ────────────────────
    spinbuttonFirst:  page.getByRole('spinbutton').first(),
    spinbuttonSecond: page.getByRole('spinbutton').nth(1),
    spinbuttonThird:  page.getByRole('spinbutton').nth(2),
    spinbuttonFourth: page.getByRole('spinbutton').nth(3),

    // ── React-Select dropdowns ────────────────────────────────────────────────
    // ⚠️ CSS class names are auto-generated; will break on UI rebuild.
    // Replace with getByTestId() once data-testid attrs are added to the component.
    categoryDropdownInput:  page.locator('.css-19bb58m').first(),
    subCategoryInput:       page.locator('.css-hlgwow > .css-19bb58m').first(),
    productDropdownInput:   page.locator(
      '.mb-3 > .css-b62m3t-container > .css-13cymwt-control > .css-hlgwow > .css-19bb58m'
    ),
    channelDropdownInput:   page.locator(
      'div:nth-child(7) > div > .css-b62m3t-container > .css-13cymwt-control > .css-hlgwow > .css-19bb58m'
    ),

    // ── Dropdown options ─────────────────────────────────────────────────────
    optionKvKategoriProgram: page.getByRole('option', { name: 'KV Kategori Program' }),
    optionKhususKv:          page.getByRole('option', { name: 'Khusus KV' }),
    optionKvProduk:          page.getByRole('option', { name: 'KV Produk' }),
    optionHaloUnlimited:     page.getByRole('option', { name: 'Halo Unlimited 80K 80rb' }),
    optionKvChannel:         page.getByRole('option', { name: 'KV Channel' }),

    // ── File upload ──────────────────────────────────────────────────────────
    programImageUpload: page.getByLabel('Program', { exact: true }).locator('input[type="file"]'),

    // ── Checkboxes ───────────────────────────────────────────────────────────
    telkomselCheckbox:    page.getByRole('checkbox', { name: 'Telkomsel', exact: true }),
    nonTelkomselCheckbox: page.getByRole('checkbox', { name: 'Non-Telkomsel' }),

    // ── Action buttons ───────────────────────────────────────────────────────
    simpanButton: page.getByRole('button', { name: 'Simpan' }),
  };
}

// ── Create Program – Tab: Foto ────────────────────────────────────────────────

export function fotoTabElements(page: Page) {
  return {
    fotoTab:         page.getByRole('tab',     { name: 'Foto' }),
    fotoFileUpload:  page.getByRole('tabpanel', { name: 'Foto' }).locator('input[type="file"]'),
    fotoJudulInput:  page.locator('input[name="FOTO_JUDUL"]'),
    fotoDeskripsiTextarea: page.locator('textarea[name="FOTO_DESKRIPSI"]'),
    wordingTextbox:  page.getByRole('textbox', { name: 'Nikmati Promo {Produk} Segera' }),
    tambahWordingButton: page.getByRole('button', { name: 'Tambah Wording' }),
  };
}

// ── Create Program – Tab: Payment Limitation ──────────────────────────────────

export function paymentLimitationTabElements(page: Page) {
  return {
    paymentLimitationTab: page.getByRole('tab',    { name: 'Payment Limitation' }),
    tambahButton:         page.getByRole('button', { name: 'Tambah' }),
    paymentCombobox:      page.getByRole('combobox'),
    /** Confirm button inside the add-row modal (index 1) */
    confirmRowButton:     page.getByRole('button').nth(1),
    termInput:            page.locator('#TERM_AND_CONDITION_1'),
    simpanButton:         page.getByRole('button', { name: 'Simpan' }),
  };
}

// ── Create Program – Tab: Sales Fee ──────────────────────────────────────────

export function salesFeeTabElements(page: Page) {
  return {
    salesFeeTab:        page.getByRole('tab',     { name: 'Sales Fee' }),
    periodCombobox:     page.getByRole('combobox'),
    agentUplineInput:   page.locator('input[name="SALES_FEE.AGENT_UPLINE"]'),
    agentDownline1Input: page.locator('input[name="SALES_FEE.AGENT_DOWNLINE_1"]'),
    simpanButton:       page.getByRole('button', { name: 'Simpan' }),
  };
}
