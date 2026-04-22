# agents.md — AI Agent Standards for the RMS Playwright Project

> **READ THIS FIRST.**
> Every AI agent or new engineer working on this project MUST read this document
> before writing, editing, or deleting a single line of code.
> Also read **`skills.md`** for implementation patterns and code recipes.

---

## 1. Project Purpose

This project contains **end-to-end Playwright tests** for the RMS Dashboard (`https://dashboard.rms.dev.atklik.xyz/`).
The goal is **encapsulation**: spec files call helpers; helpers call Playwright; never the other way around.

---

## 2. Canonical Directory Structure

```
RMS/
├── global/
│   └── auth.ts                      # LEGACY — kept for backward compat only. Do NOT import in new specs.
├── helpers/
│   ├── base.test.ts                 # Custom test fixture (evidence: screenshots + API logs)
│   ├── data.helper.ts               # Non-sensitive test data & constants
│   ├── state.manager.ts             # ★ Singleton store for sharing IDs between test steps
│   ├── temp_codegen.txt             # Scratch pad for raw Playwright Codegen output (clear after use)
│   └── elements/
│       ├── auth.helper.ts           # ★ Auth Hub — login(), logout(), switchRole(), withAuth()
│       ├── global.elements.ts       # Sidebar, Navbar, Login, Toast locators (app-wide)
│       ├── program-mgmt.helper.ts   # Program Management locators + action helpers
│       ├── appr-program.helper.ts   # Program Approval locators + action helpers
│       ├── subs-appr.helper.ts      # Subscription Approval locators + action helpers
│       └── <feature>.helper.ts      # Add one file per new feature domain
├── test-cases/
│   ├── program-management/
│   │   ├── create-program.spec.ts
│   │   └── delete-program.spec.ts
│   ├── subscription-approval/
│   │   └── subscription-approval.spec.ts
│   └── program-approval/
│       └── program-approval.spec.ts
├── test-assets/                     # Binary files used in tests (images, PDFs, etc.)
├── evidence/                        # Auto-generated screenshots & API logs (git-ignored)
├── test.config.ts                   # ★ The Switchboard — feature toggles (runXxx: true/false)
├── skills.md                        # ★ Implementation patterns & code recipes for this project
├── playwright.config.ts
├── .env                             # Secrets — git-ignored, NEVER commit
└── .env.example                     # Template — commit this, not .env
```

★ = new infrastructure files added in v2 of this framework.

---

## 3. Naming Conventions

### 3.1 Files

| Type | Pattern | Example |
|---|---|---|
| Element factory + action helpers | `<feature-slug>.helper.ts` | `program-mgmt.helper.ts` |
| App-wide shared elements | `<scope>.elements.ts` | `global.elements.ts` |
| Spec files | `<feature>.spec.ts` | `create-program.spec.ts` |
| Data files | `<scope>.helper.ts` | `data.helper.ts` |

Feature slugs use **kebab-case** short names: `program-mgmt`, `subs-appr`, `appr-program`.

### 3.2 Locator Names (inside element factory objects)

Use camelCase with a **role prefix**:

| Role | Prefix | Example |
|---|---|---|
| `<button>` | `btn` | `btnSimpan`, `btnTambahProgram` |
| `<input type="text">` | `inp` | `inpNama`, `inpKode` |
| `<textarea>` | `textarea` | `textareaInfo`, `textareaNotifSms` |
| `<select>` / native combobox | `drp` | `drpPeriod`, `drpStatus` |
| React-Select input | `dropdown` | `dropdownKategori` |
| React-Select option | `option` | `optionKvKategoriProgram` |
| `<input type="file">` | `upload` | `uploadFoto`, `uploadProgramImage` |
| `<input type="checkbox">` | `checkbox` | `checkboxTelkomsel` |
| `<a>` / link | `link` | `linkProgramManagement` |
| `<div role="tab">` | `tab` | `tabFoto`, `tabSalesFee` |
| Toast / alert text | `toast` | `toastSuccess`, `toastError` |
| Table | `tbl` | `tblDaftarProgram` |
| Label | `lbl` | `lblStatusProgram` |
| General text matcher | `text` | `textWelcome` |

> ⛔ **Forbidden**: generic names like `button1`, `el`, `input2`, raw indices without context.

### 3.3 Action Helper Functions

Use camelCase, prefixed by verb:

- `navigate*` — page/section navigation
- `fill*` — fills a form section and saves it
- `approve*`, `reject*` — approval-flow actions
- `verify*` — assertion helpers (return `void`, use `expect` internally)
- `switch*` — role transitions

---

## 4. Element Factory Rules (THE IRON LAW)

```typescript
// ✅ CORRECT — pure locator factory, no side effects
export const tabFotoElements = (page: Page) => ({
  tabFoto:   page.getByRole('tab', { name: 'Foto' }),
  btnSimpan: page.getByRole('button', { name: 'Simpan' }),
});

// ❌ WRONG — await and actions inside a factory
export const tabFotoElements = (page: Page) => ({
  tabFoto: await page.getByRole('tab', { name: 'Foto' }).click(), // NEVER
});
```

**Rules:**
1. Element factories are **plain synchronous functions** returning a plain object of `Locator` values.
2. **No `await`**, **no `.click()`**, **no `.fill()`** inside factory return objects.
3. Actions only live in `async` action helper functions (Section 2 of each helper file).
4. One `page: Page` argument only — no other parameters.

---

## 5. Spec File Rules (Tidy Spec Pattern)

```typescript
// ✅ CORRECT — spec imports helpers and calls them
import { test, expect }    from '../../helpers/base.test';
import { login, logout }   from '../../helpers/elements/auth.helper';  // ← always auth.helper, not global/auth
import { testToggle }      from '../../test.config';
import { stateManager }    from '../../helpers/state.manager';
import { fillTabProgram }  from '../../helpers/elements/program-mgmt.helper';

test.describe.serial('Feature Flow', () => {
  test.beforeAll(() => {
    if (!testToggle.runCreateProgram) test.skip();
  });

  test('TC-PM-001 | ...', async ({ page }) => {
    await test.step('Admin: Login', async () => { await login(page, 'admin'); });
    await test.step('Admin: Fill Tab Program', async () => { await fillTabProgram(page, IMAGE_PATH); });
    await test.step('Admin: Logout', async () => { await logout(page); });
  });
});

// ❌ WRONG — raw selectors in a spec file
test('TC-001 | ...', async ({ page }) => {
  await page.locator('input[name="NAMA"]').fill('Test');  // NEVER
});
```

**Rules:**
1. Spec files import **only** from `helpers/`, `test.config.ts`, and Node built-ins.
2. ⛔ **Never** import from `global/auth.ts` in new specs — use `auth.helper.ts`.
3. Zero raw Playwright selectors directly in a spec file.
4. Use `test.step('Role: Action', ...)` — step label must include the acting role.
5. Test IDs follow: `TC-<FEATURE_CODE>-<###>` (e.g., `TC-SA-001`).
6. Guard every spec with a `testToggle` check in `beforeAll`.

---

## 6. Feature Split Strategy

Helpers are split **by feature domain**, not by page. Each domain gets one helper file.

| Feature | Helper File | Spec File(s) | Toggle Key |
|---|---|---|---|
| Authentication | `auth.helper.ts` | — (imported by all) | — |
| Program Management | `program-mgmt.helper.ts` | `create-program.spec.ts`, `delete-program.spec.ts` | `runCreateProgram`, `runDeleteProgram` |
| Subscription Approval | `subs-appr.helper.ts` | `subscription-approval.spec.ts` | `runApproveSubscription` |
| Program Approval | `appr-program.helper.ts` | `program-approval.spec.ts` | `runApproveProgram` |
| App-wide (sidebar, navbar) | `global.elements.ts` | — (imported by all) | — |

**When to create a new helper file:** When a new feature module requires ≥ 3 unique locators that don't belong to any existing helper.

---

## 7. Infrastructure Files (v2)

### 7.1 Auth Hub — `helpers/elements/auth.helper.ts`

Single source of truth for all authentication. Always import from here in new specs.

| Export | Description |
|---|---|
| `login(page, role)` | Navigate to app and authenticate |
| `logout(page)` | Sign out and confirm landing page |
| `switchRole(page, role)` | Full `logout()` → `login()` (session isolation) |
| `withAuth(page, role, fn)` | Wrapper: login → run fn → logout (even on error) |

> ⚠️ Login success is confirmed via `page.waitForURL('**/main/**')`, **not** by greeting text,
> because the greeting changes by time of day (*Selamat Pagi / Siang / Malam*).

### 7.2 State Manager — `helpers/state.manager.ts`

Singleton in-memory store for sharing transient data (e.g. `programId`) between dependent test steps.

```typescript
stateManager.set('programId', '42');          // store
stateManager.get<string>('programId');         // retrieve (undefined if missing)
stateManager.require<string>('programId');     // retrieve or throw (use for hard dependencies)
stateManager.clear();                          // wipe — call in afterAll
```

Use `test.skip()` when a required key is absent to avoid false failures:
```typescript
if (!stateManager.get('programId')) test.skip(true, 'Need programId from create step');
```

### 7.3 The Switchboard — `test.config.ts`

Central feature toggle registry.

```typescript
import { testToggle } from '../../test.config';

// In beforeAll:
if (!testToggle.runApproveProgram) test.skip();
```

**⚠️ MANDATORY:** Every new test case added to the suite **MUST** have a corresponding key in `test.config.ts`.

---

## 8. Locator Priority (Most to Least Stable)

1. `getByTestId` — requires `data-testid` attr ✅ best
2. `getByRole` — semantic, language-agnostic ✅ preferred
3. `getByLabel` — form fields with `<label>` ✅ good
4. `locator('[name="…"]')` — stable if server-rendered ✅ acceptable
5. `locator('#id')` — only if static ⚠️ use with caution
6. CSS / XPath — **last resort**; always add `// ⚠️` comment explaining why

Placeholder rule: if a locator is genuinely unknown, use:
```typescript
page.locator('//PLACEHOLDER_FOR_[NAME]') // TODO: replace with stable locator
```

---

## 9. Adding a New Feature (Step-by-Step)

1. **Codegen**: Run `npx playwright codegen <url>` → paste into `helpers/temp_codegen.txt`.
2. **Toggle**: Add `runMyNewFeature: true` to `test.config.ts` ← **do this first**.
3. **Elements**: Create `helpers/elements/<slug>.helper.ts`.
   - Section 1: Element factories (no `await`).
   - Section 2: Action helpers (`async` functions).
4. **Data**: Add constants to `helpers/data.helper.ts`.
5. **Spec**: Create `test-cases/<feature>/<feature>.spec.ts` — import only from helpers.
6. **Cleanup**: Clear `temp_codegen.txt` after migration.
7. **Update docs**: Add new feature row to the table in §6.

---

## 10. Environment Variables

All secrets live in `.env` (git-ignored). Never hardcode credentials.

| Variable | Purpose |
|---|---|
| `BASE_URL` | Target application URL |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Admin role credentials |
| `APPROVER_USERNAME` / `APPROVER_PASSWORD` | Approver role credentials |
| `AGENT_USERNAME` / `AGENT_PASSWORD` | Agent role credentials |
| `EVIDENCE_DIR` | Output directory for screenshots/logs (default: `./evidence`) |

Copy `.env.example` → `.env` and fill in values before running.

---

## 11. Running Tests

```powershell
# Run all tests
npx playwright test

# Run a single spec
npx playwright test test-cases/program-management/create-program.spec.ts

# Run with all browsers
$env:ALL_BROWSERS="true"; npx playwright test

# View HTML report
npx playwright show-report
```

---

*Last updated: 2026-04-22 | v2.0 — Master E2E Framework | Maintained by the QA Automation Architect.*
