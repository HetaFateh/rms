import { test, expect, Page, BrowserContext } from '@playwright/test';
import path from 'path';
import os from 'os';
import { admin_cred, form_daftar_program } from '../config/variables';
import { login, logout } from './auth';

const IMAGE_PATH = path.join('C:', 'Users', 'asset', 'OneDrive', 'Pictures', 'Saved Pictures', 'promofm.jpg');

let context: BrowserContext;
let page: Page;

const apiLogs: { url: string; method: string; status: number; statusText: string }[] = [];

const STATIC_ASSET_RE = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|map)(\?|$)/i;

test.describe.serial('Create Program Flow', () => {

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();

    // Listen to every response and record API calls.
    page.on('response', (response) => {
      const url = response.url();
      if (!STATIC_ASSET_RE.test(url)) {
        apiLogs.push({
          url,
          method: response.request().method(),
          status: response.status(),
          statusText: response.statusText(),
        });
      }
    });
  });

  test.afterEach(async ({}, testInfo) => {
    const screenshotPath = path.join(os.tmpdir(), `screenshot-${Date.now()}.jpg`);
    await page.screenshot({ type: 'jpeg', quality: 40, fullPage: false, path: screenshotPath });
    await testInfo.attach('📸 Screenshot', {
      path: screenshotPath,
      contentType: 'image/jpeg',
    });

    await testInfo.attach('🌐 API Response Log', {
      body: Buffer.from(JSON.stringify(apiLogs, null, 2)),
      contentType: 'application/json',
    });
    apiLogs.length = 0;
  });

  test.afterAll(async () => {
    await context.close();
  });

  // ---------------------------------TEST CASE--------------------------------- //
  test('Create Program', async () => {
    
    await test.step('1. Login as an Admin', async () => {
      await login(page);
    });

    await test.step('2. Navigate to Create Program', async () => {
      await page.getByRole('button', { name: 'Manage Program' }).click();
      await page.getByRole('link', { name: 'Program Management' }).click();
      await page.getByRole('link', { name: 'Tambah' }).click();
    });

    await test.step('3. Fill Tab Program', async () => {
      const namaInput = page.locator('input[name="NAMA"]');
      await namaInput.click();
      await namaInput.fill(form_daftar_program.name);

      const kodeInput = page.locator('input[name="KODE"]');
      await kodeInput.click();
      await kodeInput.fill(form_daftar_program.code);

      const thresholdExpiredInput = page.locator('input[name="THRESHOLD_EXPIRED_PROGRAM"]');
      await thresholdExpiredInput.click();
      await thresholdExpiredInput.fill(form_daftar_program.thresholdExpired);

      const infoTextarea = page.locator('textarea[name="INFO"]');
      await infoTextarea.click();
      await infoTextarea.fill(form_daftar_program.name);

      // ⚠️ NOTE: CSS class names below are auto-generated and may break on a UI rebuild.
      await page.locator('.css-19bb58m').first().click();
      await page.getByRole('option', { name: 'KV Kategori Program' }).click();
      await page.locator('.css-hlgwow > .css-19bb58m').first().click();
      await page.getByRole('option', { name: 'Khusus KV' }).click();
      await page.locator('.css-hlgwow > .css-19bb58m').first().click();
      await page.getByRole('option', { name: 'KV Produk' }).click();
      await page.locator('.mb-3 > .css-b62m3t-container > .css-13cymwt-control > .css-hlgwow > .css-19bb58m').click();
      await page.getByRole('option', { name: 'Halo Unlimited 80K 80rb' }).click();

      await page.getByRole('spinbutton').first().click();
      await page.getByRole('spinbutton').first().fill('2');
      await page.getByRole('spinbutton').nth(1).click();
      await page.getByRole('spinbutton').nth(1).fill('2');
      await page.getByRole('spinbutton').nth(2).click();
      await page.getByRole('spinbutton').nth(2).fill('1');
      await page.getByRole('spinbutton').nth(3).click();
      await page.getByRole('spinbutton').nth(3).fill('5');

      await page.getByRole('button', { name: 'Simpan' }).click();
    
      const kvWordingTextarea = page.locator('textarea[name="KV_WORDING"]');
      await kvWordingTextarea.click();
      await kvWordingTextarea.fill(form_daftar_program.name);

      await page.getByLabel('Program', { exact: true }).locator('input[type="file"]').setInputFiles(IMAGE_PATH);

      const redirectInput = page.locator('input[name="redirect_link"]');
      await redirectInput.click();
      await redirectInput.fill(form_daftar_program.redirectLink);

      const maxPoinInput = page.locator('input[name="MAKSIMUM_JUMLAH_POIN"]');
      await maxPoinInput.click();
      await maxPoinInput.fill(form_daftar_program.maxPoin);

      const budgetInput = page.locator('input[name="BUDGET_PER_PROGRAM"]');
      await budgetInput.click();
      await budgetInput.fill(form_daftar_program.budget);

      const thresholdBudgetInput = page.locator('input[name="THRESHOLD_BUDGET_PROGRAM"]');
      await thresholdBudgetInput.click();
      await thresholdBudgetInput.fill(form_daftar_program.thresholdBudget); 

      await page.locator('div:nth-child(7) > div > .css-b62m3t-container > .css-13cymwt-control > .css-hlgwow > .css-19bb58m').click();
      await page.getByRole('option', { name: 'KV Channel' }).click();

      const notifSmsTextarea = page.locator('textarea[name="NOTIFICATION_SMS"]');
      await notifSmsTextarea.click();
      await notifSmsTextarea.fill(form_daftar_program.name);

      await page.getByRole('checkbox', { name: 'Telkomsel', exact: true }).check();
      await page.getByRole('checkbox', { name: 'Non-Telkomsel' }).check();
    });

    await test.step('4. Tab Foto', async () => {
      await page.getByRole('tab', { name: 'Foto' }).click();
      await page.getByRole('tabpanel', { name: 'Foto' }).locator('input[type="file"]').setInputFiles(IMAGE_PATH);

      const fotoJudulInput = page.locator('input[name="FOTO_JUDUL"]');
      await fotoJudulInput.click();
      await fotoJudulInput.fill(form_daftar_program.name);

      const fotoDeskripsiTextarea = page.locator('textarea[name="FOTO_DESKRIPSI"]');
      await fotoDeskripsiTextarea.click();
      await fotoDeskripsiTextarea.fill(form_daftar_program.name);

      const wordingTextbox = page.getByRole('textbox', { name: 'Nikmati Promo {Produk} Segera' });
      await wordingTextbox.click();
      await wordingTextbox.fill(form_daftar_program.wording);
      await page.getByRole('button', { name: 'Tambah Wording' }).click();
    });

    await test.step('5. Tab Payment Limitation', async () => {
      await page.getByRole('tab', { name: 'Payment Limitation' }).click();
      await page.getByRole('button', { name: 'Tambah' }).click();
      await page.getByRole('combobox').selectOption('53');
      await page.getByRole('button').nth(1).click();

      const termInput = page.locator('#TERM_AND_CONDITION_1');
      await termInput.click();
      await termInput.fill(' Test Automation');
    });

    await test.step('6. Tab Sales Fee', async () => {
      await page.getByRole('tab', { name: 'Sales Fee' }).click();
      await page.getByRole('combobox').selectOption('1');

      const agentUplineInput = page.locator('input[name="SALES_FEE.AGENT_UPLINE"]');
      await agentUplineInput.click();
      await agentUplineInput.fill(form_daftar_program.agentUpline);

      const agentDownline1Input = page.locator('input[name="SALES_FEE.AGENT_DOWNLINE_1"]');
      await agentDownline1Input.click();
      await agentDownline1Input.fill(form_daftar_program.agentDownline1);

      await page.getByRole('button', { name: 'Simpan' }).click();
    });

    await test.step('7. Logout', async () => {
      await logout(page);
    });

  });

});
