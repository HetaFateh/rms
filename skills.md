# skills.md — RMS E2E Framework: Architect's Skill Reference

> Companion to `agents.md`. While `agents.md` defines **rules**, `skills.md`
> documents **how** to implement patterns correctly in this codebase.

---

## 1. Adding a New Feature (End-to-End Checklist)

```
1. [ ] Paste raw Playwright codegen output into helpers/temp_codegen.txt
2. [ ] Create helpers/elements/<feature-slug>.helper.ts
       — Section 1: Element factories (no await, no side effects)
       — Section 2: Action helpers (async functions)
3. [ ] Add test data constants to helpers/data.helper.ts
4. [ ] Add a toggle key to test.config.ts  ← MANDATORY
5. [ ] Create test-cases/<feature>/<feature>.spec.ts
6. [ ] Import from auth.helper.ts (NOT global/auth.ts)
7. [ ] Clear temp_codegen.txt after migration
8. [ ] Update the Feature Split table in agents.md §6
```

---

## 2. Auth Hub Usage (`helpers/elements/auth.helper.ts`)

```typescript
import { login, logout, switchRole, withAuth } from '../../helpers/elements/auth.helper';

// Simple login/logout
await login(page, 'admin');
await logout(page);

// Role transition (full logout → login — session isolation guaranteed)
await switchRole(page, 'approver');

// Convenience wrapper
await withAuth(page, 'agent', async () => {
  // test actions here — logout runs even on error
});
```

**Why `auth.helper.ts` and NOT `global/auth.ts`?**  
`global/auth.ts` is the legacy file. All new specs must import from `auth.helper.ts`.
`global/auth.ts` is kept only for backward compatibility with existing specs.

---

## 3. State Manager Usage (`helpers/state.manager.ts`)

```typescript
import { stateManager } from '../../helpers/state.manager';

// In the creator test step
stateManager.set('programId', '42');

// In the consumer test step (same worker run)
const id = stateManager.get<string>('programId');

// Guard against missing keys — prevents false failures
const id = stateManager.require<string>('programId'); // throws if unset

// Skip a dependent test if the key never got set
if (!stateManager.get('programId')) {
  test.skip(true, 'programId not available — run create-program first');
}

// Cleanup
stateManager.clear(); // call in afterAll
```

---

## 4. Switchboard Usage (`test.config.ts`)

```typescript
import { testToggle } from '../../test.config';

test.describe.serial('Program Approval Flow', () => {

  // Guard at the describe level — skips entire block if toggle is off
  test.beforeAll(() => {
    if (!testToggle.runApproveProgram) {
      test.skip();
    }
  });

  test('TC-PA-001 | Approve a program', async ({ page }) => { ... });
});
```

**Adding a new toggle key** (repeat every time a new spec is created):
```typescript
// In test.config.ts:
runMyNewFeature: true,   // TC-XX-001: Description of what this covers
```

---

## 5. Element Factory Pattern (The Iron Law)

```typescript
// ✅ CORRECT — pure locator factory
export const myFeatureElements = (page: Page) => ({
  btnSave:    page.getByRole('button', { name: 'Simpan' }),
  inputName:  page.locator('input[name="NAMA"]'),
  drpStatus:  page.getByRole('combobox', { name: 'Status' }),  // combobox = <select>
});

// ✅ CORRECT — async action helper that imports the factory
export async function fillMyForm(page: Page, data: { name: string }): Promise<void> {
  const el = myFeatureElements(page);
  await el.inputName.fill(data.name);
  await el.btnSave.click();
}

// ❌ WRONG — await inside factory
export const myFeatureElements = (page: Page) => ({
  btnSave: await page.getByRole('button').click(),  // NEVER
});
```

---

## 6. Locator Prefix Cheat Sheet

| Element | Prefix | Example |
|---|---|---|
| `<button>` | `btn` | `btnSimpan` |
| `<input type="text">` | `inp` | `inpNama` |
| `<input type="file">` | `upload` | `uploadFoto` |
| `<input type="checkbox">` | `checkbox` | `checkboxTelkomsel` |
| `<select>` / native combobox | `drp` | `drpStatus` |
| React-Select input | `dropdown` | `dropdownKategori` |
| React-Select option item | `option` | `optionKvKategori` |
| `<textarea>` | `textarea` | `textareaInfo` |
| `<a>` / link | `link` | `linkProgramManagement` |
| `<div role="tab">` | `tab` | `tabFoto` |
| Toast / alert text | `toast` | `toastSuccess` |
| General text | `text` | `textWelcome` |
| Table | `tbl` | `tblDaftarProgram` |
| Label | `lbl` | `lblStatusProgram` |

> Source locator priority (most → least stable):  
> `getByTestId` → `getByRole` → `getByLabel` → `locator('[name]')` → `locator('#id')` → CSS/XPath

---

## 7. Spec File Pattern

```typescript
import { test, expect } from '../../helpers/base.test';
import { login, logout }  from '../../helpers/elements/auth.helper';
import { testToggle }     from '../../test.config';
import { stateManager }   from '../../helpers/state.manager';
import { navigateToX, fillX } from '../../helpers/elements/feature.helper';

test.describe.serial('Feature Flow', () => {

  test.beforeAll(() => {
    if (!testToggle.runMyFeature) test.skip();
  });

  test('TC-XX-001 | Happy path', async ({ page }) => {

    await test.step('Role: Login as admin', async () => {
      await login(page, 'admin');
    });

    await test.step('Admin: Navigate to feature', async () => {
      await navigateToX(page);
    });

    await test.step('Admin: Fill and submit form', async () => {
      await fillX(page, testData);
    });

    await test.step('Admin: Logout', async () => {
      await logout(page);
    });

  });
});
```

---

## 8. Known Gotchas

| Issue | Root Cause | Fix |
|---|---|---|
| `getByText('Selamat Pagi')` fails | Greeting changes by time of day | Use `page.waitForURL('**/main/**')` instead |
| React-Select locators break on build | CSS class names are auto-generated | Tag with `// ⚠️` and replace when `data-testid` is added |
| `stateManager.require()` throws | Preceding test failed or was skipped | Guard with `test.skip()` pattern (see §3) |
| Parallel workers share no state | Each worker has its own process | Use `test.describe.serial` for dependent tests |

---

*Last updated: 2026-04-22 | Maintained by the QA Automation Architect.*
