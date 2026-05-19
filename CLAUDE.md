# RMS QA Automation — E2E Test Suite

## Project Overview

Playwright TypeScript E2E test suite for the **RMS (Reward Management System)** dashboard at `dashboard.rms.dev.atklik.xyz`. The app is a Telkomsel loyalty/rewards platform with role-based access (admin, approver, agent). Tests are written in Indonesian-UI language (Bahasa Indonesia).

## Tech Stack

- **Runtime**: Node.js with `@playwright/test` ^1.59, `dotenv`, `@types/node`
- **Browser**: Chromium (default), optionally Firefox/WebKit via `ALL_BROWSERS=true`
- **Chrome path**: `/usr/bin/google-chrome-stable` (configured in `playwright.config.ts`)
- **Headless**: `false` — all tests run in headed mode
- **Workers**: `1` — no parallel workers (serial execution within describe blocks)

## Running Tests

```bash
# Install deps
npm install

# Run all enabled tests
npx playwright test

# Run specific test file
npx playwright test test-cases/program-management/create-program.spec.ts

# Run with all browsers
ALL_BROWSERS=true npx playwright test

# Run in CI mode (retries: 2, forbidOnly: true)
CI=true npx playwright test
```

## Project Structure

```
rms/
├── playwright.config.ts          # Playwright config (browser, base URL, retries)
├── test.config.ts                 # Feature toggle registry (enable/disable test cases)
├── helpers/
│   ├── base.test.ts               # Custom test fixture (API logging + screenshot evidence)
│   ├── data.helper.ts             # Test data constants (program fields, image path)
│   ├── state.manager.ts           # Singleton in-memory store for cross-test state
│   └── elements/
│       ├── global.elements.ts     # Shared locators: login, sidebar, navbar, toasts
│       ├── auth.helper.ts         # Auth actions: login/logout/switchRole/withAuth
│       └── program.helper.ts      # Program CRUD + approval actions and element locators
├── test-cases/
│   ├── program-management/
│   │   ├── create-program.spec.ts     # TC-PM-001
│   │   ├── delete-program.spec.ts     # TC-PM-002
│   │   └── edit-program-e2e.spec.ts   # TC-PM-E2E-001
│   ├── program-approval/
│   │   ├── approve-existing-program.spec.ts  # TC-PA-002
│   │   └── approve-program-e2e.spec.ts       # TC-PA-E2E-001
│   ├── subscription-approval/
│   │   └── subscription-approval.spec.ts     # TC-SA-001 (stub, disabled)
│   ├── user-management/
│   │   └── edit-profile.spec.ts             # TC-UP-001
│   └── dashboard/
│       └── dashboard-navigation.spec.ts      # TC-DB-001, TC-DB-002
├── test-assets/
│   └── promofm.jpg               # Program image used across tests
├── evidence/                     # Auto-generated screenshots + API logs (gitignored)
└── .env                          # Credentials + BASE_URL (gitignored)
```

## Architecture & Patterns

### Pattern: Element-Action Separation

Element files (`*.elements.ts`, `*.helper.ts`) define locators as factory functions that take a `Page` and return plain objects. **No `await`, no `.click()`, no actions in element definitions.** Actions live in separate exported functions in the same or helper files.

```
// Locators (pure, no side effects)
export const tabProgramElements = (page: Page) => ({
  inputNama: page.locator('input[name="NAMA"]'),
  btnSimpan: page.getByRole('button', { name: 'Simpan' }),
});

// Actions (use the locators)
export async function fillTabProgram(page: Page, imagePath: string): Promise<void> { ... }
```

### Pattern: Custom Test Fixture (base.test.ts)

Extends Playwright's `test` with automatic per-test teardown:
1. Intercepts all non-static HTTP responses → collects API log entries
2. After test completes: captures JPEG screenshot + saves API log as JSON
3. Attaches both to Playwright's test report as artifacts
4. Evidence saved to `./evidence/` (path configurable via `EVIDENCE_DIR` env var)

### Pattern: Feature Toggles (test.config.ts)

Every test case has a boolean toggle. Specs call `test.skip()` in `beforeAll` if their toggle is `false`. **Mandatory**: adding a new test requires adding its toggle to `test.config.ts`.

### Pattern: Auth Role System (auth.helper.ts)

Three roles: `admin`, `approver`, `agent`. Credentials read from `process.env`:
- `ADMIN_USERNAME` / `ADMIN_PASSWORD`
- `APPROVER_USERNAME` / `APPROVER_PASSWORD`
- `AGENT_USERNAME` / `AGENT_PASSWORD`

`login()` clears cookies, navigates to base URL, fills credentials, waits for `**/main/**` URL. `switchRole()` does full logout→login. `withAuth()` is a try/finally wrapper.

### Pattern: Cross-Test State (state.manager.ts)

Singleton `Map<string, unknown>` for sharing data (e.g., program IDs) between dependent tests within a worker. Must call `stateManager.clear()` in `afterAll`. Never store secrets here.

### Pattern: Test Data (data.helper.ts)

Static test data object `TEST_DATA.program` with constant values for program creation. Image path resolves to `test-assets/promofm.jpg`.

## Test Case Inventory

| ID | Toggle Key | Status | File | Description |
|----|-----------|--------|------|-------------|
| TC-PM-001 | `runCreateProgram` | Enabled | create-program.spec.ts | Admin creates program (all 4 tabs), verifies toast |
| TC-PM-002 | `runDeleteProgram` | Disabled | delete-program.spec.ts | Admin deletes program from list |
| TC-PA-002 | `runApproveExistingProgram` | Enabled | approve-existing-program.spec.ts | Approver approves existing program |
| TC-PA-E2E-001 | `runApproveProgramE2E` | Enabled | approve-program-e2e.spec.ts | Admin creates → Approver approves (full E2E) |
| TC-PM-E2E-001 | `runEditProgramE2E` | Enabled | edit-program-e2e.spec.ts | Admin edits date range → Approver approves (full E2E) |
| TC-SA-001 | `runApproveSubscription` | Disabled | subscription-approval.spec.ts | Stub — not yet implemented |
| TC-UP-001 | `runEditProfile` | Enabled | edit-profile.spec.ts | Admin navigates to Edit Profile, verifies URL |
| TC-DB-001 | `runDashboardNavigation` | Enabled | dashboard-navigation.spec.ts | Dashboard URL verification + all sidebar menu expansion |
| TC-DB-002 | `runDashboardNavigation` | Enabled | dashboard-navigation.spec.ts | Expands all 6 sidebar groups |

## Key Flows

### Create Program (TC-PM-001)
1. Admin login → navigate to Program Management → click "Tambah" link
2. Fill **Tab Program**: name, code, threshold, dropdowns (Kategori, SubKategori, Produk, Channel), date spinbuttons, image upload, all text fields, checkboxes
3. Fill **Tab Foto**: upload image, title, description, wording, click "Tambah Wording"
4. Fill **Tab Payment Limitation**: add row, select payment option, fill T&C, save
5. Fill **Tab Sales Fee**: select period, fill agent upline/downline, save
6. Verify success toast → logout

### Approve Program E2E (TC-PA-E2E-001)
Same as Create Program steps 1-6, then:
7. Admin logout → Approver login
8. Navigate to Program Approval → click approve icon (☑) on program row
9. Select "Approve" radio → click "Kirim" → verify success toast → logout

### Edit & Approve (TC-PM-E2E-001)
1. Admin login → Program Management → search for program → click edit icon
2. Update date range (yesterday to +12 days) via date picker
3. Save → verify toast → logout
4. Approver login → Program Approval → approve → verify toast → logout

## Rules

1. **Element files are locator-only** — no `await`, no `.click()`, no side effects. Actions go in exported async functions.
2. **Prefer `getByRole` > `getByLabel` > `locator('[name]')` > CSS** (last resort only).
3. **Every new test case must have a toggle** in `test.config.ts` with JSDoc referencing its TC ID.
4. **All tests use `test.describe.serial`** — no parallel test execution within suites.
5. **Credentials never in source** — always from `process.env` via `.env`.
6. **E2E tests that cross roles** use explicit login/logout steps (not `withAuth`), since role-switching is part of the flow.
7. **Import `test` and `expect` from `helpers/base.test.ts`**, not from `@playwright/test` directly (to get evidence capture).
8. **Program name constant** uses `TEST_DATA.program.name` — shared across all program-related tests.
9. **All test steps use `test.step()`** for clear report grouping.
10. **`.env.example` is removed** — refer to `.env` for required variables: `BASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `APPROVER_USERNAME`, `APPROVER_PASSWORD`, `AGENT_USERNAME`, `AGENT_PASSWORD`.
11. **Evidence files** (screenshots, API logs) are auto-generated in `./evidence/` and gitignored — may contain sensitive data.
12. **React-Select dropdowns** use brittle CSS class selectors (`.css-19bb58m`, `.css-hlgwow`) — should be replaced with `data-testid` when available upstream.
