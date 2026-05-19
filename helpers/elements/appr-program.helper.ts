import { Page } from '@playwright/test';
import { sidebarElements } from './global.elements';

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 1 – ELEMENT FACTORIES
// ══════════════════════════════════════════════════════════════════════════════

// ── Sidebar Navigation ────────────────────────────────────────────────────────

export const apprProgramNavElements = (page: Page) => ({
  btnManageProgram:    sidebarElements(page).btnManageProgram,
  linkProgramApproval: sidebarElements(page).linkProgramApproval,
});

// ── Program Approval List (table) ─────────────────────────────────────────────

export const apprProgramListElements = (page: Page) => ({
  /**
   * Returns the full <tr> row that contains the given program name text.
   * Scope all subsequent locators to this row to avoid acting on the wrong row.
   * Source: getByRole('cell', { name: 'Test Automation' }).first()
   */
  rowByProgramName: (name: string) =>
    page.getByRole('row').filter({ hasText: name }),

  /**
   * The ☑ approve/checklist icon button inside a specific row.
   * Intended usage: apprProgramListElements(page).btnApproveInRow(row)
   * Source: getByRole('button', { name: '☑' }).first()
   */
  btnApproveInRow: (row: ReturnType<Page['getByRole']>) =>
    row.getByRole('button', { name: '☑' }),
});

// ── Approval Modal / Drawer ───────────────────────────────────────────────────

export const apprProgramFormElements = (page: Page) => ({
  /**
   * "Approve" radio button (first radio — index 0).
   * Source: getByRole('radio').first()
   */
  radioApprove: page.getByRole('radio').first(),

  /**
   * "Reject" radio button (second radio — index 1) — reserved for future TC.
   */
  radioReject: page.getByRole('radio').nth(1),

  /**
   * Submit button that finalises the approval/rejection decision.
   * Source: getByRole('button', { name: 'Kirim' })
   */
  btnKirim: page.getByRole('button', { name: 'Kirim' }),
});

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 2 – HIGH-LEVEL ACTION HELPERS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Navigate from the dashboard to the Program Approval list page.
 * For Approver role: After login, click the "Program Approval" link directly.
 */
export async function navigateToProgramApproval(page: Page): Promise<void> {
  const nav = apprProgramNavElements(page);
  await nav.linkProgramApproval.click();
  await page.waitForLoadState('networkidle');
}

/**
 * Click the ☑ approve icon for the row matching `programName`.
 * This opens the approval modal/drawer.
 * If multiple programs have the same name, clicks the first one.
 */
export async function clickApproveIcon(page: Page, programName: string): Promise<void> {
  const list = apprProgramListElements(page);
  const row  = list.rowByProgramName(programName);
  await list.btnApproveInRow(row).first().click();
}

/**
 * Select the "Approve" radio button and submit the Kirim form.
 * Call this after `clickApproveIcon()` has opened the modal.
 */
export async function submitApproval(page: Page): Promise<void> {
  const form = apprProgramFormElements(page);
  await form.radioApprove.click();
  await form.btnKirim.click();
}

/**
 * Select the "Reject" radio button and submit the Kirim form.
 * Reserved for the rejection test case.
 */
export async function submitRejection(page: Page): Promise<void> {
  const form = apprProgramFormElements(page);
  await form.radioReject.click();
  await form.btnKirim.click();
}
