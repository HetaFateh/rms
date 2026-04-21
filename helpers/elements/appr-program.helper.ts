/**
 * helpers/elements/appr-program.helper.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Locators and action helpers for the Program Approval feature.
 *
 * STATUS: 🚧 PLACEHOLDER — implement locators when the feature spec is ready.
 *
 * Instructions for the next engineer / AI agent:
 *   1. Record raw locators with `npx playwright codegen` and paste into
 *      `helpers/temp_codegen.txt`.
 *   2. Follow the same factory-function pattern used in `program-mgmt.helper.ts`.
 *   3. Add high-level action helpers in SECTION 2 below.
 *   4. Update `agents.md` if new naming conventions are introduced.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { Page } from '@playwright/test';
import { sidebarElements } from './global.elements';

// ── Navigation ────────────────────────────────────────────────────────────────

export const apprProgramNavElements = (page: Page) => ({
  btnManageProgram:    sidebarElements(page).btnManageProgram,
  linkProgramApproval: sidebarElements(page).linkProgramApproval,
});

// ── TODO: Add page-specific element factories here ────────────────────────────
// export const apprProgramListElements = (page: Page) => ({ ... });

// ── TODO: Add high-level action helpers here ──────────────────────────────────
// export async function approveProgram(page: Page, programName: string): Promise<void> { ... }
