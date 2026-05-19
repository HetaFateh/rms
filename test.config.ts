/**
 * test.config.ts  —  The Switchboard
 * ──────────────────────────────────────────────────────────────────────────────
 * Central feature toggle registry. Set a flag to `false` to skip that entire
 * test case family without modifying spec files.
 *
 * ⚠️  MANDATORY: Every time a new test case is added to the suite, a
 *     corresponding `true/false` key MUST be added here. This is the only
 *     place where test execution is enabled or disabled.
 *
 * Usage in a spec file:
 *   import { testToggle } from '../../test.config';
 *   if (!testToggle.runCreateProgram) test.skip();
 * ──────────────────────────────────────────────────────────────────────────────
 */

export const testToggle = {

  // ── Program Management ────────────────────────────────────────────────────
  /** TC-PM-001: Create a new program (full happy path) */
  runCreateProgram:       true,

  /** TC-PM-002: Delete an existing program */
  runDeleteProgram:       false,

  // ── Program Approval ──────────────────────────────────────────────────────
  /** TC-PA-002: Approve existing program (approval only, no creation) */
  runApproveExistingProgram: true,

  /** TC-PA-E2E-001: Create and approve program (full E2E flow) */
  runApproveProgramE2E:   true,

  /** TC-PA-E2E-002: Edit existing program and approve (full E2E flow) */
  runEditProgramE2E:      true,

  // ── Subscription Approval ─────────────────────────────────────────────────
  /** TC-SA-001: Approve a subscription (full happy path) */
  runApproveSubscription: false,

  // ── User Management ───────────────────────────────────────────────────────
  /** TC-UP-001: View and edit user profile */
  runEditProfile:         true,

  // ── Dashboard ─────────────────────────────────────────────────────────────
  /** TC-DB-001, TC-DB-002: Dashboard navigation and menu exploration */
  runDashboardNavigation: true,

} as const;

/**
 * Helper to get a human-readable list of all disabled toggles.
 * Useful for debugging which features are turned off.
 */
export function getDisabledToggles(): string[] {
  return Object.entries(testToggle)
    .filter(([, enabled]) => !enabled)
    .map(([key]) => key);
}
