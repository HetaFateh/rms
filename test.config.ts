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
  runDeleteProgram:       true,

  // ── Program Approval ──────────────────────────────────────────────────────
  /** TC-PA-001: Approve a program (full happy path) */
  runApproveProgram:      true,

  // ── Subscription Approval ─────────────────────────────────────────────────
  /** TC-SA-001: Approve a subscription (full happy path) */
  runApproveSubscription: true,

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
