import { test, expect } from '../../helpers/base.test';
import path from 'path';
import { login, logout } from '../../global/auth';
import {
    navigationElements,
    createProgramTabElements,
    fotoTabElements,
    paymentLimitationTabElements,
    salesFeeTabElements,
} from '../../helpers/elements.helper';
import { form_daftar_program } from '../../helpers/data.helper';

const IMAGE_PATH = path.join(
    'C:', 'Users', 'asset', 'OneDrive', 'Pictures', 'Saved Pictures', 'promofm.jpg'
);

test.describe.serial('Create Program Flow', () => {

    test('TC-001 | Create Program – full happy path', async ({ page }) => {

        // ── Step 1: Login ────────────────────────────────────────────────────────
        await test.step('1. Login as Admin', async () => {
            await login(page, 'admin');
        });

        // ── Step 2: Navigate ─────────────────────────────────────────────────────
        await test.step('2. Navigate to Create Program', async () => {
            const nav = navigationElements(page);
            await nav.manageProgramButton.click();
            await nav.programManagementLink.click();
            await nav.tambahLink.click();
        });

        // ── Step 3: Fill Tab Program ─────────────────────────────────────────────
        await test.step('3. Fill Tab Program', async () => {
            const el = createProgramTabElements(page);

            await el.namaInput.fill(form_daftar_program.name);
            await el.kodeInput.fill(form_daftar_program.code);
            await el.thresholdExpiredInput.fill(form_daftar_program.thresholdExpired);
            await el.infoTextarea.fill(form_daftar_program.name);

            // React-Select dropdowns (⚠️ brittle CSS selectors — tag for future data-testid)
            await el.categoryDropdownInput.click();
            await el.optionKvKategoriProgram.click();
            await el.subCategoryInput.click();
            await el.optionKhususKv.click();
            await el.subCategoryInput.click();
            await el.optionKvProduk.click();
            await el.productDropdownInput.click();
            await el.optionHaloUnlimited.click();

            // Date-range / numeric spinbuttons
            await el.spinbuttonFirst.fill('2');
            await el.spinbuttonSecond.fill('2');
            await el.spinbuttonThird.fill('1');
            await el.spinbuttonFourth.fill('5');

            await el.simpanButton.click();

            await el.kvWordingTextarea.fill(form_daftar_program.name);
            await el.programImageUpload.setInputFiles(IMAGE_PATH);

            await el.redirectLinkInput.fill(form_daftar_program.redirectLink);
            await el.maxPoinInput.fill(form_daftar_program.maxPoin);
            await el.budgetInput.fill(form_daftar_program.budget);
            await el.thresholdBudgetInput.fill(form_daftar_program.thresholdBudget);

            await el.channelDropdownInput.click();
            await el.optionKvChannel.click();

            await el.notifSmsTextarea.fill(form_daftar_program.name);

            await el.telkomselCheckbox.check();
            await el.nonTelkomselCheckbox.check();
        });

        // ── Step 4: Tab Foto ─────────────────────────────────────────────────────
        await test.step('4. Fill Tab Foto', async () => {
            const el = fotoTabElements(page);

            await el.fotoTab.click();
            await el.fotoFileUpload.setInputFiles(IMAGE_PATH);
            await el.fotoJudulInput.fill(form_daftar_program.name);
            await el.fotoDeskripsiTextarea.fill(form_daftar_program.name);
            await el.wordingTextbox.fill(form_daftar_program.wording);
            await el.tambahWordingButton.click();
        });

        // ── Step 5: Tab Payment Limitation ───────────────────────────────────────
        await test.step('5. Fill Tab Payment Limitation', async () => {
            const el = paymentLimitationTabElements(page);

            await el.paymentLimitationTab.click();
            await el.tambahButton.click();
            await el.paymentCombobox.selectOption('53');
            await el.confirmRowButton.click();
            await el.termInput.fill(' Test Automation');
            await el.simpanButton.click();
        });

        // ── Step 6: Tab Sales Fee ─────────────────────────────────────────────────
        await test.step('6. Fill Tab Sales Fee', async () => {
            const el = salesFeeTabElements(page);

            await el.salesFeeTab.click();
            await el.periodCombobox.selectOption('1');
            await el.agentUplineInput.fill(form_daftar_program.agentUpline);
            await el.agentDownline1Input.fill(form_daftar_program.agentDownline1);
            await el.simpanButton.click();
        });

        // ── Step 7: Logout ────────────────────────────────────────────────────────
        await test.step('7. Logout', async () => {
            await logout(page);
        });

    });

});
