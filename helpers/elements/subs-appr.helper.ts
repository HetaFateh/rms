/** Locators and actions for the Subscribe Approval flow. */
import { Page, Locator } from '@playwright/test';
import { sidebarElements } from './global.elements';

async function navigateSidebar(
  page: Page,
  groupBtn: Locator,
  link: Locator,
): Promise<void> {
  await groupBtn.click();
  await link.waitFor({ state: 'visible', timeout: 10_000 });
  await link.click();
}

// ---------------------------------------------------------------------------
// Section 1: Element Factories (pure locators — no await, no actions)
// ---------------------------------------------------------------------------

export const subsApprovalElements = (page: Page) => ({
  inpSearch:      page.getByRole('textbox', { name: 'Search' }),
  tblElements:    page.getByTestId('table-element'),
  btnKirim:       page.getByRole('button', { name: 'Kirim' }),
  radioReject:    page.locator('#reject'),
});

// ---------------------------------------------------------------------------
// Section 2: Action Helpers (async functions)
// ---------------------------------------------------------------------------

export async function navigateToSubscribeApproval(page: Page): Promise<void> {
  const sidebar = sidebarElements(page);
  await navigateSidebar(page, sidebar.btnManageProgram, sidebar.linkSubscribeApproval);
  await page.waitForLoadState('networkidle');
}

export async function searchAgent(page: Page, agentName: string): Promise<void> {
  const el = subsApprovalElements(page);
  await el.inpSearch.fill(agentName);
  await page.waitForLoadState('networkidle');
}

export async function clickApprovalButton(page: Page): Promise<void> {
  const el = subsApprovalElements(page);
  await el.tblElements.getByRole('button', { name: 'Approval' }).first().click();
}

export async function submitApproval(page: Page): Promise<void> {
  const el = subsApprovalElements(page);
  await el.btnKirim.click();
}

export async function selectReject(page: Page): Promise<void> {
  const el = subsApprovalElements(page);
  await el.radioReject.check();
}

export async function submitRejection(page: Page): Promise<void> {
  const el = subsApprovalElements(page);
  await el.btnKirim.click();
}
