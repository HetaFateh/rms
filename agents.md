# AGENTS.md — RMS E2E Test Suite

This file is the main reference for working on this codebase. Read it before making any changes.
Companion file: [skills.md](skills.md) — implementation recipes and naming conventions.

---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Project Overview](#project-overview)
3. [Tech Stack](#tech-stack)
4. [Architecture Rules](#architecture-rules)
5. [File Organization](#file-organization)
6. [Test Case Inventory](#test-case-inventory)
7. [Key Flows](#key-flows)
8. [Codegen Workflow](#codegen-workflow)
9. [Working Guidelines](#working-guidelines)
10. [Running Tests](#running-tests)
11. [Known Issues and Fragile Patterns](#known-issues-and-fragile-patterns)
12. [Checklist for New Features](#checklist-for-new-features)

---

## Quick Reference

Before starting any task:

1. Read this file in full — the rules here are not optional
2. Check [test.config.ts](test.config.ts) — make sure a toggle exists for your feature before writing any spec
3. Read [skills.md](skills.md) — implementation recipes and naming conventions
4. Look through [helpers/elements/](helpers/elements/) — reuse existing locators before creating new ones

### Key files

| File | Purpose | Notes on when to change |
|------|---------|--------------------------|
| [test.config.ts](test.config.ts) | Enable/disable individual test cases | Update this before creating a new spec |
| [helpers/base.test.ts](helpers/base.test.ts) | Custom Playwright fixture | Only touch if changing how evidence is collected |
| [helpers/state.manager.ts](helpers/state.manager.ts) | Cross-test state sharing | Only touch if adding new state methods |
| [helpers/data.helper.ts](helpers/data.helper.ts) | Test data constants | Update when you need new test data |
| [helpers/temp_codegen.txt](helpers/temp_codegen.txt) | Codegen scratch pad | Paste raw codegen here, clear it after migrating |

---

## Project Overview

RMS (Reward Management System) is a Playwright TypeScript E2E test suite for the dashboard at `dashboard.rms.dev.atklik.xyz`. The application is a Telkomsel loyalty and rewards platform. There are three user roles:

- admin — creates and edits programs
- approver — approves or rejects programs
- agent — end-user role

The UI is in Bahasa Indonesia. Locators, step labels, and test data use Indonesian text, for example `'Simpan'`, `'Tambah'`, `'Kirim'`.

---

## Tech Stack

- Runtime: Node.js with `@playwright/test` ^1.59, `dotenv`, `@types/node`
- Browser: Chromium by default, optionally Firefox and WebKit via `ALL_BROWSERS=true`
- Headless: false — all tests run in headed mode
- Workers: 1 — serial execution only, no parallel workers

### Environment variables

The `.env` file is gitignored. Required keys:

```
BASE_URL=
ADMIN_USERNAME=
ADMIN_PASSWORD=
APPROVER_USERNAME=
APPROVER_PASSWORD=
AGENT_USERNAME=
AGENT_PASSWORD=
```

Credentials must never be hardcoded in spec files or helper files. Always read from `process.env`.

---

## Architecture Rules

These rules apply to all code in this repository without exception.

### 1. Always import test and expect from the custom fixture

```typescript
// correct
import { test, expect } from '../../helpers/base.test';

// wrong — this skips evidence collection entirely
import { test, expect } from '@playwright/test';
```

`helpers/base.test.ts` extends the Playwright fixture to auto-capture a JPEG screenshot after every test, log all non-static API calls to `./evidence/`, and attach both to the HTML report. Importing directly from `@playwright/test` disables all of that.

---

### 2. Use auth.helper.ts, not global/auth.ts

```typescript
// correct
import { login, logout, switchRole, withAuth } from '../../helpers/elements/auth.helper';

// wrong — this is a legacy file kept only for backward compatibility
import { login } from '../../global/auth';
```

`global/auth.ts` exists only to avoid breaking older specs. All new code must use `helpers/elements/auth.helper.ts`.

The three auth functions work as follows:
- `login()` — clears cookies, navigates to base URL, fills credentials, waits for `**/main/**`
- `switchRole()` — full logout followed by login as a different role
- `withAuth()` — try/finally wrapper for a single-role flow

For tests that switch roles mid-flow (E2E cross-role tests), use explicit `login()` and `logout()` calls instead of `withAuth()`. The role switch is part of what the test is validating, so it should be visible in the test steps.

Login verification must use the URL, not greeting text:

```typescript
// correct — works at any time of day
await page.waitForURL('**/main/**');

// wrong — greeting changes depending on the time of day
await expect(page.getByText('Selamat Pagi')).toBeVisible();
```

---

### 3. Element factory pattern — locators and actions stay separate

Every helper file in `helpers/elements/` is split into two sections. Section 1 defines locators as plain factory functions. Section 2 defines async action functions that use those locators.

Factories return plain `Locator` objects. No `await`, no `.click()`, no `.fill()` inside a factory.

```typescript
// Section 1 — pure locator factory, no side effects
export const programElements = (page: Page) => ({
  btnSave:   page.getByRole('button', { name: 'Simpan' }),
  inputName: page.locator('input[name="NAMA"]'),
  drpStatus: page.getByRole('combobox', { name: 'Status' }),
});

// Section 2 — async action function
export async function fillProgramForm(page: Page, data: { name: string }): Promise<void> {
  const el = programElements(page);
  await el.inputName.fill(data.name);
  await el.btnSave.click();
}

// wrong — calling an action inside a factory breaks lazy evaluation
export const programElements = (page: Page) => ({
  btnSave: await page.getByRole('button').click(), // do not do this
});
```

Locators are lazy — they do not query the DOM until an action is called. Mixing locator creation with actions defeats this and causes race conditions.

Locator priority from most to least preferred:

1. `getByRole` — semantic, most resilient to markup changes
2. `getByLabel` — good for labeled form fields
3. `locator('[name="..."]')` — for named inputs without a good role
4. CSS class selectors — last resort only; mark these with a `// fragile:` comment

---

### 4. State manager — cross-test data sharing

`helpers/state.manager.ts` is a singleton `Map<string, unknown>`. It shares data between tests that run in the same Playwright worker.

```typescript
import { stateManager } from '../../helpers/state.manager';

// store a value in one test
stateManager.set('programId', '42');

// read it in a later test in the same worker
const id = stateManager.require<string>('programId'); // throws if the key is missing

// guard tests that depend on earlier tests having run
test.beforeAll(() => {
  if (!stateManager.get('programId')) {
    test.skip(true, 'programId not set — run create-program first');
  }
});

// clear state at the end of every suite
test.afterAll(() => {
  stateManager.clear();
});
```

Important notes:
- State is per-worker only. Parallel workers do not share state.
- `require<T>()` throws if the key is missing. Always guard dependent tests with `test.skip()`.
- Always call `clear()` in `afterAll` to prevent state from leaking into other suites.
- Do not store credentials or secrets in the state manager.

---

### 5. Test toggles — all in test.config.ts

`test.config.ts` is the only place to enable or disable test execution. No scattered `test.skip()` calls anywhere else.

When adding a new spec:

1. Add a toggle key to `test.config.ts` first
2. Guard the spec with that toggle in `beforeAll`

```typescript
// Step 1 — add to test.config.ts
export const testToggle = {
  runMyNewFeature: true, // TC-XX-001: brief description
};

// Step 2 — guard the spec
import { testToggle } from '../../test.config';

test.describe.serial('My New Feature', () => {
  test.beforeAll(() => {
    if (!testToggle.runMyNewFeature) test.skip();
  });

  test('TC-XX-001 | Happy path', async ({ page }) => { ... });
});
```

---

## File Organization

### Directory structure

```
rms/
├── playwright.config.ts
├── test.config.ts
├── helpers/
│   ├── base.test.ts              # custom test fixture — import test from here
│   ├── data.helper.ts            # test data constants
│   ├── state.manager.ts          # cross-test state sharing
│   ├── temp_codegen.txt          # codegen scratch pad — clear after use
│   └── elements/
│       ├── global.elements.ts    # shared locators: login form, sidebar, navbar, toasts
│       ├── auth.helper.ts        # login, logout, switchRole, withAuth
│       └── program.helper.ts     # program CRUD and approval locators + actions
├── test-cases/
│   ├── program-management/
│   │   ├── create-program.spec.ts      # TC-PM-001
│   │   ├── delete-program.spec.ts      # TC-PM-002
│   │   └── edit-program-e2e.spec.ts    # TC-PM-E2E-001
│   ├── program-approval/
│   │   ├── approve-existing-program.spec.ts  # TC-PA-002
│   │   └── approve-program-e2e.spec.ts       # TC-PA-E2E-001
│   ├── subscription-approval/
│   │   └── subscription-approval.spec.ts     # TC-SA-001
│   ├── user-management/
│   │   └── edit-profile.spec.ts              # TC-UP-001
│   ├── dashboard/
│   │   └── dashboard-navigation.spec.ts      # TC-DB-001, TC-DB-002
│   ├── brand-management/
│   │   └── brand-management.spec.ts          # TC-BM-E2E-001
│   ├── bank-management/
│   │   └── bank-management.spec.ts           # TC-BANK-E2E-001
│   └── channel-management/
│       └── channel-management.spec.ts        # TC-CH-E2E-001
├── test-assets/
│   └── promofm.jpg
├── evidence/                     # auto-generated screenshots and API logs — gitignored
└── .env                          # credentials and BASE_URL — gitignored
```

### Standard imports in spec files

```typescript
import { test, expect } from '../../helpers/base.test';
import { login, logout } from '../../helpers/elements/auth.helper';
import { testToggle } from '../../test.config';
import { stateManager } from '../../helpers/state.manager';
import { TEST_DATA } from '../../helpers/data.helper';

// do not import these in new specs:
// import { test } from '@playwright/test';    — skips evidence collection
// import { login } from '../../global/auth';  — legacy file
```

### Helper file structure

```typescript
import { Page, Locator } from '@playwright/test';

// ---------------------------------------------------------------------------
// Section 1: Element Factories (pure locators — no await, no actions)
// ---------------------------------------------------------------------------

export const myFeatureElements = (page: Page) => ({
  btnSave:          page.getByRole('button', { name: 'Simpan' }),
  inputName:        page.locator('input[name="NAMA"]'),
  // fragile: CSS class auto-generated by React-Select, will break on library update
  dropdownKategori: page.locator('.css-19bb58m'),
});

// ---------------------------------------------------------------------------
// Section 2: Action Helpers (async functions)
// ---------------------------------------------------------------------------

export async function fillMyForm(page: Page, data: { name: string }): Promise<void> {
  const el = myFeatureElements(page);
  await el.inputName.fill(data.name);
  await el.btnSave.click();
}
```

### Element naming prefix conventions

| Prefix | Element type |
|--------|-------------|
| `btn` | Buttons |
| `inp` | Text inputs |
| `drp` | Native `<select>` dropdowns |
| `dropdown` | React-Select components |
| `checkbox` | Checkboxes |
| `tab` | Tab elements |
| `toast` | Toast / alert messages |

See [skills.md](skills.md) for the full table and implementation recipes.

---

## Test Case Inventory

| ID | Toggle key | Status | File | Description |
|----|-----------|--------|------|-------------|
| TC-PM-001 | `runCreateProgram` | disabled | `create-program.spec.ts` | Admin creates program across all 4 tabs, verifies toast |
| TC-PM-002 | `runDeleteProgram` | disabled | `delete-program.spec.ts` | Admin deletes program from list |
| TC-PM-E2E-001 | `runEditProgramE2E` | disabled | `edit-program-e2e.spec.ts` | Admin edits date range, Approver approves |
| TC-PA-002 | `runApproveExistingProgram` | disabled | `approve-existing-program.spec.ts` | Approver approves an existing program |
| TC-PA-E2E-001 | `runApproveProgramE2E` | disabled | `approve-program-e2e.spec.ts` | Admin creates a program, Approver approves it |
| TC-SA-001 | `runApproveSubscription` | disabled | `subscription-approval.spec.ts` | Admin approves a subscription — full happy path |
| TC-UP-001 | `runEditProfile` | disabled | `edit-profile.spec.ts` | Admin navigates to Edit Profile, verifies URL |
| TC-DB-001 | `runDashboardNavigation` | disabled | `dashboard-navigation.spec.ts` | Dashboard URL verification |
| TC-DB-002 | `runDashboardNavigation` | disabled | `dashboard-navigation.spec.ts` | Expands all 6 sidebar groups |
| TC-BM-E2E-001 | `runBrandManagement` | disabled | `brand-management.spec.ts` | Admin creates, edits, and deletes a brand in single flow |
| TC-BANK-E2E-001 | `runBankManagement` | disabled | `bank-management.spec.ts` | Admin creates, edits, and deletes a bank in single flow |
| TC-CH-E2E-001 | `runChannelManagement` | enabled | `channel-management.spec.ts` | Admin creates, edits, and deletes a channel in single flow |

Note: all program-related tests read the program name from `TEST_DATA.program.name` in `data.helper.ts`. Changing that value affects every spec that searches for or interacts with that program.

---

## Key Flows

### Create Program (TC-PM-001)

1. Admin logs in, navigates to Program Management, clicks the "Tambah" link
2. Tab Program: fill name, code, threshold, dropdowns (Kategori, SubKategori, Produk, Channel), date spinbuttons, image upload, text fields, checkboxes
3. Tab Foto: upload image, fill title, description, wording, click "Tambah Wording"
4. Tab Payment Limitation: add a row, select payment option, fill T&C, save
5. Tab Sales Fee: select period, fill agent upline and downline, save
6. Verify success toast, logout

### Approve Program E2E (TC-PA-E2E-001)

Runs steps 1-6 of Create Program, then:

7. Admin logs out, Approver logs in
8. Navigate to Program Approval, click the approve icon on the program row
9. Select the "Approve" radio button, click "Kirim", verify success toast, logout

### Edit and Approve (TC-PM-E2E-001)

1. Admin logs in, goes to Program Management, searches for the program, clicks the edit icon
2. Update the date range (yesterday to +12 days) using the date picker
3. Save, verify toast, logout
4. Approver logs in, goes to Program Approval, approves the program, verifies toast, logout

---

## Codegen Workflow

Start a codegen session:

```powershell
npx playwright codegen https://dashboard.rms.dev.atklik.xyz/
```

After recording:

1. Copy the generated code
2. Paste it into `helpers/temp_codegen.txt`
3. Create or update the relevant `helpers/elements/<feature>.helper.ts`
4. Move locators into Section 1 (factory functions)
5. Move actions into Section 2 (async functions)
6. Apply naming conventions from the prefix table above
7. Mark any fragile CSS selectors with a `// fragile:` comment
8. Add test data to `helpers/data.helper.ts` if needed
9. **DO NOT clear or edit `helpers/temp_codegen.txt`** — it is managed by the user only

---

## Working Guidelines

### When adding new code

- Check `helpers/elements/` before creating any new locator — reuse what already exists
- Read related spec files to understand the existing patterns before writing anything
- Register the toggle in `test.config.ts` before writing the spec file
- Format `test.step()` labels as `'Role: Action'`, for example `'Admin: Fill program form'`

### When modifying existing code

- Read the full file before making changes
- Keep the existing patterns consistent — do not introduce new styles
- If you change a helper, check every spec that imports it
- Run the affected specs locally before marking the work as done

### When debugging

- Check the `evidence/` folder — screenshots and API logs are captured automatically after each test
- Confirm the toggle is enabled in `test.config.ts`
- Inspect shared state with `stateManager.get()`
- Run a single spec with `npx playwright test path/to/spec.ts`

### Encapsulation rules

These apply everywhere without exception:

| Rule | Wrong | Right |
|------|-------|-------|
| No raw selectors in spec files | `page.locator('input[name="NAMA"]')` in spec | Define in a helper factory, use that |
| No business logic in spec files | Inline action steps in spec body | Extract to async helper functions |
| No hardcoded test data | `'Test Program Name'` string literal | `TEST_DATA.program.name` |
| No duplicate locators | Same locator defined in two places | Reuse the existing factory |
| No mixed concerns | Actions inside Section 1 | Locators in Section 1, actions in Section 2 |

Example:

```typescript
// wrong — raw selector and inline logic in spec
test('Create program', async ({ page }) => {
  await page.locator('input[name="NAMA"]').fill('Test Program');
  await page.getByRole('button', { name: 'Simpan' }).click();
});

// right — logic extracted to helper, spec is just orchestration
test('Create program', async ({ page }) => {
  await test.step('Admin: Fill program form', async () => {
    await fillProgramForm(page, TEST_DATA.program.valid);
  });
});
```

### Standard workflow for implementing a feature

1. Read `AGENTS.md` and `skills.md` before every request — they are the single source of truth
2. Add the toggle to `test.config.ts`
3. Check `helpers/elements/` for reusable locators
4. Read related spec files
5. Implement using the two-section helper file pattern
6. Add test data to `data.helper.ts` — make all values env-configurable so they are reusable across specs
7. Write the spec with `test.step()` labels, placing the file under `test-cases/`
8. Run the new spec locally before marking the work done
9. **NEVER edit `helpers/temp_codegen.txt`** — it is managed exclusively by the user
10. Prioritize token efficiency — be concise in both code and responses
11. If a file is no longer needed, flag it for deletion rather than leaving dead code

---

## Response Style

All responses must be:
- **Simple and direct** — no unnecessary preamble
- **Detailed and comprehensive** — cover everything relevant
- **Easy to read** — use tables, bullet lists, and code blocks
- Elaborate only when the user explicitly asks for it

---

## Running Tests

```powershell
# install dependencies
npm install

# run all enabled tests on Chromium
npx playwright test

# run a single spec file
npx playwright test test-cases/program-management/create-program.spec.ts

# run with all browsers (Chromium + Firefox + WebKit)
$env:ALL_BROWSERS="true"; npx playwright test    # PowerShell
set ALL_BROWSERS=true && npx playwright test      # CMD
ALL_BROWSERS=true npx playwright test             # bash / CI

# run in CI mode (retries: 2, forbidOnly: true)
CI=true npx playwright test

# open the HTML report
npx playwright show-report
```

---

## Known Issues and Fragile Patterns

### Greeting text changes by time of day

The app shows different greetings depending on the hour — `Selamat Pagi`, `Selamat Siang`, `Selamat Malam`. Do not assert on greeting text for login verification. Use the URL instead.

```typescript
// wrong — will fail depending on when the test runs
await expect(page.getByText('Selamat Pagi')).toBeVisible();

// right
await page.waitForURL('**/main/**');
```

### React-Select generates unstable CSS class names

React-Select auto-generates class names like `.css-19bb58m` and `.css-hlgwow`. These change when the library is updated. Any locator using these must be marked with a comment:

```typescript
// fragile: CSS class auto-generated by React-Select, replace with data-testid when available
dropdownKategori: page.locator('.css-19bb58m'),
```

### State manager is per-worker, not global

Each Playwright worker runs in its own Node.js process with its own state manager instance. Do not assume state set in one test is available across parallel runs. Guard dependent tests:

```typescript
// wrong — will throw if the key was not set in this worker's run
const id = stateManager.require<string>('programId');

// right — guard with skip
test.beforeAll(() => {
  if (!stateManager.get('programId')) {
    test.skip(true, 'programId not set — run create-program first');
  }
});
```

### All suites must use test.describe.serial

Tests in a suite often depend on earlier tests having run. Use `test.describe.serial` to enforce this. Without it, Playwright may run tests in any order.

```typescript
// right
test.describe.serial('Program E2E Flow', () => {
  test('Create program', async ({ page }) => { ... });
  test('Approve program', async ({ page }) => { ... });
});

// wrong — Approve may run before Create
test.describe('Program E2E Flow', () => {
  test('Create program', async ({ page }) => { ... });
  test('Approve program', async ({ page }) => { ... });
});
```

### Evidence is captured after each test, not during

Screenshots and API logs are written when a test finishes. For a debug screenshot mid-test:

```typescript
await page.screenshot({ path: `./evidence/debug-${Date.now()}.jpg` });
```

---

## Common Mistakes and Lessons Learned

This section documents recurring mistakes to avoid in future implementations.

### Mistake 1: Splitting sequential flows into separate tests

**Problem:** Creating separate `test()` blocks for sequential operations (create → edit → delete) causes Playwright to create new browser contexts between tests, closing the page and losing session state.

**Symptom:** Tests fail with "Target page, context or browser has been closed" error after the first test completes.

**Solution:** Combine sequential operations into a single E2E test with multiple `test.step()` blocks.

```typescript
// wrong — separate tests lose browser context
test('Create brand', async ({ page }) => { ... });
test('Edit brand', async ({ page }) => { ... });  // fails — page is closed
test('Delete brand', async ({ page }) => { ... }); // fails — page is closed

// right — single E2E test maintains context
test('TC-BM-E2E-001 | Create, Edit, and Delete brand', async ({ page }) => {
  await test.step('Admin: Create brand', async () => { ... });
  await test.step('Admin: Edit brand', async () => { ... });
  await test.step('Admin: Delete brand', async () => { ... });
});
```

### Mistake 2: Not waiting for modals or forms to appear

**Problem:** Clicking a button that opens a modal/form, then immediately trying to interact with elements inside it before they're visible.

**Symptom:** Timeout errors like "waiting for locator('#name')" when the element exists but hasn't rendered yet.

**Solution:** Add explicit wait for the element to be visible before interacting with it.

```typescript
// wrong — assumes modal is instantly visible
await el.btnTambah.click();
await el.inputName.fill(brandName);  // may fail if modal is still opening

// right — wait for element to be visible
await el.btnTambah.click();
await el.inputName.waitFor({ state: 'visible', timeout: 10_000 });
await el.inputName.fill(brandName);
```

### Mistake 3: Assuming page stays on the same URL after actions

**Problem:** After creating/editing/deleting an item, the page may redirect or show a success modal, making the sidebar or other navigation elements temporarily unavailable.

**Solution:** For sequential operations in the same test, navigate back to the required page explicitly or close modals before the next step.

```typescript
// wrong — assumes we're still on the Brand page after create
await createBrand(page, brandName);
await editBrand(page, oldName, newName);  // fails — page may have redirected

// right — navigate back to Brand page between operations
await createBrand(page, brandName);
await sidebar.btnSetting.click();
await sidebar.linkBrand.click();
await editBrand(page, oldName, newName);
```

### Mistake 4: Editing `helpers/temp_codegen.txt`

**Problem:** Clearing or modifying `helpers/temp_codegen.txt` after implementing features, thinking it's a temporary scratch file.

**Reality:** This file is managed exclusively by the user and should NEVER be modified by agents.

**Solution:** Read from it, implement the features, but leave the file untouched.

### Mistake 5: Asserting table visibility without re-searching after an edit

**Problem:** After editing an item (which internally calls `searchChannel(oldName)`), the search bar retains the old name. Calling `expectChannelVisible(newName)` then fails because the table is still filtered by the old term.

**Symptom:** `expect(locator).toBeVisible()` times out even though the edit succeeded — the new name simply isn't in the filtered results.

**Solution:** Any `expectXxxVisible` helper should call `searchXxx(channelName)` first to reset the filter before asserting.

```typescript
// wrong — table still filtered by old name after edit
await editChannel(page, name1, name2, code2);
await expectChannelVisible(page, name2); // fails

// right — expectChannelVisible searches first internally
export async function expectChannelVisible(page: Page, channelName: string): Promise<void> {
  await searchChannel(page, channelName); // reset the search filter
  await expect(getChannelCell(page, channelName)).toBeVisible({ timeout: 10_000 });
}
```

---

## Checklist for New Features

Before writing any code:

- [ ] Read `AGENTS.md` and `skills.md`
- [ ] Add toggle to `test.config.ts`
- [ ] Check `helpers/elements/` for reusable locators
- [ ] Review similar existing specs

While implementing:

- [ ] Import `test` and `expect` from `helpers/base.test.ts`, not from `@playwright/test`
- [ ] Import auth functions from `helpers/elements/auth.helper.ts`, not from `global/auth`
- [ ] Follow the two-section helper file pattern (Section 1 locators, Section 2 actions)
- [ ] Format `test.step()` labels as `'Role: Action'`
- [ ] Mark fragile CSS selectors with a `// fragile:` comment
- [ ] Add test data to `helpers/data.helper.ts` — all values must be env-configurable
- [ ] Guard spec with toggle in `beforeAll`
- [ ] Use `test.describe.serial` for all suites
- [ ] Clear state in `afterAll` if using the state manager
- [ ] Read credentials from `process.env` only — never hardcode
- [ ] Place spec file under `test-cases/<feature>/`
- [ ] Do not leave dead or unused files — flag them for deletion

After implementation:

- [ ] **NEVER edit `helpers/temp_codegen.txt`** — user manages this file exclusively
- [ ] Run the new spec locally to verify it passes
- [ ] Check `evidence/` folder for screenshots and logs

---

Last updated: 2026-05-26
Maintained by: QA team
Companion file: [skills.md](skills.md)
