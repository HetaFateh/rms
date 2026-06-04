export const testToggle = {

  // ── Program Management ────────────────────────────────────────────────────
  runCreateProgram:       false,
  runDeleteProgram:       false,

  // ── Program Approval ──────────────────────────────────────────────────────
  runApproveExistingProgram: false,
  runApproveProgramE2E:   false,
  runEditProgramE2E:      false,

  // ── Subscription Approval ─────────────────────────────────────────────────
  runApproveSubscription: false,
  runRejectSubscription:  false,  // TC-SA-002: Admin rejects a subscription

  // ── User Management ───────────────────────────────────────────────────────
  runEditProfile:         false,
  runRegisterAgent:       false,

  // ── Dashboard ─────────────────────────────────────────────────────────────
  runDashboardNavigation: false,

  // ── Brand Management ──────────────────────────────────────────────────────
  runBrandManagement:     false,  // TC-BM-E2E-001: Create, Edit, Delete brand in single flow

  // ── Channel Management ──────────────────────────────────────────────────────
  runChannelManagement:   false,  // TC-CH-E2E-001: Create, Edit, Delete channel in single flow

  // ── Redeem Management ─────────────────────────────────────────────────────
  runRedeemManagement:    true,   // TC-RM-001: Admin creates a redeem entry

  // ── Bank Management ───────────────────────────────────────────────────────
  runBankManagement:      false,  // TC-BANK-E2E-001: Create, Edit, Delete bank in single flow

  // ── Kategori Program Management ───────────────────────────────────────────
  runKategoriProgramManagement: true,  // TC-KP-E2E-001: Create, Edit, Delete kategori program in single flow

} as const;

export function getDisabledToggles(): string[] {
  return Object.entries(testToggle)
    .filter(([, enabled]) => !enabled)
    .map(([key]) => key);
}
