# agents.md — AI Agent Standards for the RMS Playwright Project

> **READ THIS FIRST.**  
> Every AI agent or new engineer working on this project MUST read this document before writing, editing, or deleting a single line of code.

---

## 1. Project Purpose

This project contains **end-to-end Playwright tests** for the RMS Dashboard (`https://dashboard.rms.dev.atklik.xyz/`).  
The goal is **encapsulation**: spec files call helpers; helpers call Playwright; never the other way around.

---

## 2. Canonical Directory Structure

```
RMS/
├── global/
│   └── auth.ts                      # login(), logout(), withAuth() — NEVER touch credentials here
├── helpers/
│   ├── base.test.ts                 # Custom test fixture (evidence collector)
│   ├── data.helper.ts               # Non-sensitive test data & constants
│   ├── temp_codegen.txt             # Scratch pad for raw Playwright Codegen output
│   └── elements/
│       ├── global.elements.ts       # Sidebar, Navbar, Login, Toast locators (app-wide)
│       ├── program-mgmt.helper.ts   # Program Management locators + action helpers
│       ├── subs-appr.helper.ts      # Subscription Approval (placeholder)
│       └── appr-program.helper.ts   # Program Approval (placeholder)
├── test-cases/
│   ├── program-management/
│   │   └── create-program.spec.ts
│   ├── subscription-approval/
│   │   └── subscription-approval.spec.ts
│   └── program-approval/
│       └── program-approval.spec.ts
├── test-assets/                     # Binary files used in tests (images, PDFs, etc.)
├── evidence/                        # Auto-generated screenshots & API logs (git-ignored)
├── playwright.config.ts
├── .env                             # Secrets — git-ignored, NEVER commit
└── .env.example                     # Template — commit this, not .env
```

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
| `<input type="text">` | `input` | `inputNama`, `inputKode` |
| `<textarea>` | `textarea` | `textareaInfo`, `textareaNotifSms` |
| `<select>` / combobox | `combobox` | `comboboxPeriod` |
| React-Select input | `dropdown` | `dropdownKategori` |
| React-Select option | `option` | `optionKvKategoriProgram` |
| `<input type="file">` | `upload` | `uploadFoto`, `uploadProgramImage` |
| `<input type="checkbox">` | `checkbox` | `checkboxTelkomsel` |
| `<a>` / link | `link` | `linkProgramManagement` |
| `<div role="tab">` | `tab` | `tabFoto`, `tabSalesFee` |
| Toast / alert text | `toast` | `toastSuccess`, `toastError` |
| General text matcher | `text` | `textWelcome` |

> ⛔ **Forbidden**: generic names like `button1`, `el`, `input2`, raw indices without context.

### 3.3 Action Helper Functions

Use camelCase, prefixed by verb:

- `navigate*` — page/section navigation (clicks sidebar, etc.)
- `fill*` — fills a form section and saves it
- `approve*`, `reject*` — approval-flow actions
- `verify*` — assertion helpers (return `void`, use `expect` internally)

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
import { fillTabProgram } from '../../helpers/elements/program-mgmt.helper';

test('TC-001 | ...', async ({ page }) => {
  await test.step('3. Fill Tab Program', async () => {
    await fillTabProgram(page, IMAGE_PATH);
  });
});

// ❌ WRONG — raw selectors in a spec file
test('TC-001 | ...', async ({ page }) => {
  await page.locator('input[name="NAMA"]').fill('Test');  // NEVER
});
```

**Rules:**
1. Spec files import **only** from `helpers/`, `global/`, and Node built-ins.
2. Zero raw Playwright selectors (no `page.locator(...)`, `page.getByRole(...)`, etc.) directly in a spec file.
3. Use `test.step()` for every logical group of actions.
4. Test IDs follow: `TC-<FEATURE_CODE>-<###>` (e.g., `TC-SA-001`).

---

## 6. Feature Split Strategy

Helpers are split **by feature domain**, not by page. Each domain gets one helper file.

| Feature | Helper File | Spec File |
|---|---|---|
| Program Management | `program-mgmt.helper.ts` | `create-program.spec.ts` |
| Subscription Approval | `subs-appr.helper.ts` | `subscription-approval.spec.ts` |
| Program Approval | `appr-program.helper.ts` | `program-approval.spec.ts` |
| App-wide (sidebar, navbar) | `global.elements.ts` | — (imported by all) |

**When to create a new helper file:** When a new feature module requires ≥3 unique locators that don't belong to any existing helper.

---

## 7. Locator Priority (Most to Least Stable)

1. `getByTestId` — requires `data-testid` attr on the component ✅ best
2. `getByRole` — semantic, language-agnostic ✅ preferred
3. `getByLabel` — form fields with `<label>` ✅ good
4. `locator('[name="…"]')` — name attribute (stable if server-rendered) ✅ acceptable
5. `locator('#id')` — HTML id (stable only if static) ⚠️ use with caution
6. CSS / XPath — **last resort**; always add `// ⚠️` comment explaining why

---

## 8. Adding a New Feature (Step-by-Step)

1. **Codegen**: Run `npx playwright codegen <url>` and paste raw output into `helpers/temp_codegen.txt`.
2. **Elements**: Create `helpers/elements/<feature-slug>.helper.ts`.
   - Section 1: Element factories (no `await`).
   - Section 2: Action helpers (`async` functions).
3. **Data**: Add test data constants to `helpers/data.helper.ts`.
4. **Spec**: Create `test-cases/<feature>/<feature>.spec.ts` — only import from helpers.
5. **Cleanup**: Clear `temp_codegen.txt` after migration.
6. **Update this doc**: Add the new feature row to the table in §6.

---

## 9. Environment Variables

All secrets live in `.env` (git-ignored). Never hardcode credentials.

| Variable | Purpose |
|---|---|
| `BASE_URL` | Target application URL |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Admin role credentials |
| `AGENT_USERNAME` / `AGENT_PASSWORD` | Agent role credentials |
| `EVIDENCE_DIR` | Output directory for screenshots/logs (default: `./evidence`) |

Copy `.env.example` → `.env` and fill in the values before running tests.

---

## 10. Running Tests

```powershell
# Run all tests
npx playwright test

# Run a single spec file
npx playwright test test-cases/program-management/create-program.spec.ts

# Run with all browsers
$env:ALL_BROWSERS="true"; npx playwright test

# View the HTML report
npx playwright show-report
```

---

*Last updated: 2026-04-21 | Maintained by the QA Automation team.*
