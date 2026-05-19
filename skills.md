# skills.md — RMS E2E Framework: Implementation Recipes

> **Companion to [`AGENTS.md`](AGENTS.md)**. While AGENTS.md defines **rules and behaviors**, skills.md documents **how** to implement patterns correctly in this codebase.

---

## 📋 Table of Contents

1. [Adding a New Feature (End-to-End)](#1-adding-a-new-feature-end-to-end)
2. [Auth Hub Usage](#2-auth-hub-usage)
3. [State Manager Usage](#3-state-manager-usage)
4. [Test Toggle Switchboard](#4-test-toggle-switchboard)
5. [Element Factory Pattern](#5-element-factory-pattern)
6. [Locator Naming Conventions](#6-locator-naming-conventions)
7. [Spec File Template](#7-spec-file-template)
8. [Helper File Template](#8-helper-file-template)
9. [Test Data Management](#9-test-data-management)
10. [Common Patterns & Recipes](#10-common-patterns--recipes)
11. [Known Gotchas Reference](#11-known-gotchas-reference)

---

## 1. Adding a New Feature (End-to-End)

### Complete Workflow Checklist

```
Phase 1: Preparation
[ ] Read AGENTS.md to understand all rules
[ ] Check helpers/elements/ for reusable locators
[ ] Review similar existing specs for patterns
[ ] Add toggle key to test.config.ts (MANDATORY)

Phase 2: Code Generation
[ ] Run: npx playwright codegen https://dashboard.rms.dev.atklik.xyz/
[ ] Paste raw output into helpers/temp_codegen.txt
[ ] DO NOT commit temp_codegen.txt with content

Phase 3: Implementation
[ ] Create/update helpers/elements/<feature>.helper.ts
  [ ] Section 1: Element factories (pure locators)
  [ ] Section 2: Action helpers (async functions)
[ ] Apply naming conventions (see §6)
[ ] Tag fragile selectors with // ⚠️
[ ] Add test data to helpers/data.helper.ts
[ ] Create test-cases/<feature>/<feature>.spec.ts
  [ ] Import from helpers/base.test.ts
  [ ] Import from helpers/elements/auth.helper.ts
  [ ] Guard with toggle in beforeAll
  [ ] Use test.step() with 'Role: Action' format
  [ ] Clear state in afterAll if using stateManager

Phase 4: Cleanup & Verification
[ ] Clear helpers/temp_codegen.txt
[ ] Run spec locally: npx playwright test path/to/spec.ts
[ ] Check ./evidence/ for screenshots and API logs
[ ] Verify all imports are correct
```

---

## 2. Auth Hub Usage

### Import Statement

```typescript
import { login, logout, switchRole, withAuth } from '../../helpers/elements/auth.helper';
```

### Basic Login/Logout

```typescript
// Login as specific role
await login(page, 'admin');
await login(page, 'approver');
await login(page, 'agent');

// Logout
await logout(page);
```

### Role Switching

```typescript
// Full logout → login sequence (guarantees session isolation)
await switchRole(page, 'approver');
```

### Convenience Wrapper

```typescript
// Automatically logs out even if test fails
await withAuth(page, 'agent', async () => {
  // Your test actions here
  await navigateToFeature(page);
  await performAction(page);
});
// Logout happens automatically
```

### Login Verification Pattern

```typescript
// ✅ CORRECT — Time-independent URL check
await page.waitForURL('**/main/**');

// ❌ WRONG — Greeting text changes by time of day
await expect(page.getByText('Selamat Pagi')).toBeVisible();
```

**Why?** Greeting changes throughout the day:
- Morning: `Selamat Pagi`
- Afternoon: `Selamat Siang`
- Evening: `Selamat Malam`

---

## 3. State Manager Usage

### Import Statement

```typescript
import { stateManager } from '../../helpers/state.manager';
```

### Basic Operations

```typescript
// Set a value (in creator test)
stateManager.set('programId', '42');
stateManager.set('programName', 'Test Program');

// Get a value (in consumer test, same worker)
const id = stateManager.get<string>('programId');
const name = stateManager.get<string>('programName');

// Require a value (throws if missing)
const id = stateManager.require<string>('programId');
```

### Guarding Dependent Tests

```typescript
test.describe.serial('Program E2E Flow', () => {
  
  test.beforeAll(() => {
    // Skip entire suite if prerequisite data is missing
    if (!stateManager.get('programId')) {
      test.skip(true, 'programId not set — run create-program first');
    }
  });

  test('TC-XX-002 | Edit program', async ({ page }) => {
    const id = stateManager.require<string>('programId');
    // Use id in test...
  });

  test.afterAll(() => {
    // MANDATORY: Clear state to prevent pollution
    stateManager.clear();
  });
});
```

### Critical Behaviors

- ✅ State persists across tests in the **same worker**
- ❌ State does NOT persist across **parallel workers**
- ⚠️ Always call `stateManager.clear()` in `afterAll`
- ⚠️ Use `test.describe.serial` for dependent tests

---

## 4. Test Toggle Switchboard

### Import Statement

```typescript
import { testToggle } from '../../test.config';
```

### Adding a New Toggle

**Step 1**: Add to [`test.config.ts`](test.config.ts)

```typescript
export const testToggle = {
  // ... existing toggles ...
  
  /** TC-XX-001: Description of what this feature tests */
  runMyNewFeature: true,
};
```

**Step 2**: Guard spec file

```typescript
import { testToggle } from '../../test.config';

test.describe.serial('My New Feature', () => {
  
  test.beforeAll(() => {
    if (!testToggle.runMyNewFeature) {
      test.skip();
    }
  });

  test('TC-XX-001 | Test case', async ({ page }) => {
    // Test implementation
  });
});
```

### Toggle Naming Convention

```typescript
// Pattern: run<FeatureName>
runCreateProgram: true,
runApproveProgram: true,
runEditProfile: true,
runDashboardNavigation: true,
```

---

## 5. Element Factory Pattern

### The Iron Law

**Factories return plain `Locator` objects — NO `await`, NO actions**

### Section 1: Element Factories (Pure Locators)

```typescript
import { Page, Locator } from '@playwright/test';

export const programElements = (page: Page) => ({
  // Buttons
  btnSave:    page.getByRole('button', { name: 'Simpan' }),
  btnCancel:  page.getByRole('button', { name: 'Batal' }),
  
  // Text inputs
  inputName:  page.locator('input[name="NAMA"]'),
  inputDesc:  page.locator('textarea[name="DESKRIPSI"]'),
  
  // Native dropdowns
  drpStatus:  page.getByRole('combobox', { name: 'Status' }),
  
  // React-Select (fragile)
  // ⚠️ Fragile: CSS class auto-generated by React-Select
  dropdownKategori: page.locator('.css-19bb58m'),
  
  // Checkboxes
  checkboxActive: page.locator('input[type="checkbox"][name="ACTIVE"]'),
  
  // Toast messages
  toastSuccess: page.locator('.Toastify__toast--success'),
});
```

### Section 2: Action Helpers (Async Functions)

```typescript
export async function fillProgramForm(
  page: Page,
  data: { name: string; desc: string }
): Promise<void> {
  const el = programElements(page);
  await el.inputName.fill(data.name);
  await el.inputDesc.fill(data.desc);
  await el.btnSave.click();
}

export async function navigateToProgramList(page: Page): Promise<void> {
  await page.goto('/program-management');
  await page.waitForURL('**/program-management/**');
}

export async function waitForSuccessToast(page: Page): Promise<void> {
  const el = programElements(page);
  await expect(el.toastSuccess).toBeVisible({ timeout: 10000 });
}
```

### Common Mistakes

```typescript
// ❌ WRONG — await inside factory
export const programElements = (page: Page) => ({
  btnSave: await page.getByRole('button').click(), // NEVER
});

// ❌ WRONG — action inside factory
export const programElements = (page: Page) => ({
  btnSave: page.getByRole('button').click(), // NEVER
});

// ❌ WRONG — mixing locators and actions
export const programElements = (page: Page) => ({
  btnSave: page.getByRole('button', { name: 'Simpan' }),
  async clickSave() { await this.btnSave.click(); }, // NEVER
});
```

---

## 6. Locator Naming Conventions

### Prefix Reference Table

| Element Type | Prefix | Example | Playwright Method |
|--------------|--------|---------|-------------------|
| Button | `btn` | `btnSimpan`, `btnBatal` | `getByRole('button')` |
| Text input | `inp` | `inpNama`, `inpEmail` | `locator('input[name]')` |
| File upload | `upload` | `uploadFoto`, `uploadDokumen` | `locator('input[type="file"]')` |
| Checkbox | `checkbox` | `checkboxTelkomsel`, `checkboxActive` | `locator('input[type="checkbox"]')` |
| Radio button | `radio` | `radioYes`, `radioNo` | `locator('input[type="radio"]')` |
| Native dropdown | `drp` | `drpStatus`, `drpKategori` | `getByRole('combobox')` |
| React-Select | `dropdown` | `dropdownKategori`, `dropdownOperator` | `locator('.css-*')` ⚠️ |
| React-Select option | `option` | `optionKvKategori`, `optionTelkomsel` | `getByText()` |
| Textarea | `textarea` | `textareaInfo`, `textareaDeskripsi` | `locator('textarea')` |
| Link | `link` | `linkProgramManagement`, `linkLogout` | `getByRole('link')` |
| Tab | `tab` | `tabFoto`, `tabProgram` | `getByRole('tab')` |
| Toast/Alert | `toast` | `toastSuccess`, `toastError` | `locator('.Toastify__toast')` |
| Text/Label | `text` | `textWelcome`, `textTitle` | `getByText()` |
| Table | `tbl` | `tblDaftarProgram`, `tblUsers` | `locator('table')` |
| Label | `lbl` | `lblStatusProgram`, `lblNama` | `getByLabel()` |
| Icon | `icon` | `iconEdit`, `iconDelete` | `locator('svg')` |
| Modal/Dialog | `modal` | `modalConfirm`, `modalDelete` | `locator('[role="dialog"]')` |

### Locator Priority (Most → Least Stable)

1. `getByTestId('data-testid')` — Best (requires dev team cooperation)
2. `getByRole('button', { name: 'Text' })` — Excellent (semantic)
3. `getByLabel('Label text')` — Good (form fields)
4. `locator('input[name="FIELD"]')` — Good (stable attributes)
5. `locator('#unique-id')` — Acceptable (if IDs are stable)
6. `locator('.css-class')` — ⚠️ Fragile (auto-generated classes)
7. XPath — ❌ Avoid (brittle, hard to maintain)

### Naming Style Guide

```typescript
// ✅ CORRECT — Clear, descriptive, follows convention
btnSimpan: page.getByRole('button', { name: 'Simpan' }),
inpNamaProgram: page.locator('input[name="NAMA_PROGRAM"]'),
dropdownKategori: page.locator('.css-19bb58m'), // ⚠️ Fragile

// ❌ WRONG — Unclear, inconsistent
button1: page.getByRole('button'),
saveBtn: page.getByRole('button', { name: 'Simpan' }),
kategori_dropdown: page.locator('.css-19bb58m'),
```

---

## 7. Spec File Template

### Complete Template

```typescript
import { test, expect } from '../../helpers/base.test';
import { login, logout } from '../../helpers/elements/auth.helper';
import { testToggle } from '../../test.config';
import { stateManager } from '../../helpers/state.manager';
import { TEST_DATA } from '../../helpers/data.helper';
import {
  navigateToFeature,
  fillFeatureForm,
  featureElements,
} from '../../helpers/elements/feature.helper';

test.describe.serial('Feature Name', () => {

  test.beforeAll(() => {
    // Guard with toggle
    if (!testToggle.runMyFeature) {
      test.skip();
    }
  });

  test('TC-XX-001 | Happy path description', async ({ page }) => {

    await test.step('Admin: Login', async () => {
      await login(page, 'admin');
    });

    await test.step('Admin: Navigate to feature', async () => {
      await navigateToFeature(page);
    });

    await test.step('Admin: Fill and submit form', async () => {
      await fillFeatureForm(page, TEST_DATA.feature.valid);
    });

    await test.step('Admin: Verify success', async () => {
      const el = featureElements(page);
      await expect(el.toastSuccess).toBeVisible();
    });

    await test.step('Admin: Logout', async () => {
      await logout(page);
    });

  });

  test('TC-XX-002 | Dependent test', async ({ page }) => {
    
    // Guard if depends on previous test
    const featureId = stateManager.get<string>('featureId');
    if (!featureId) {
      test.skip(true, 'featureId not set — run TC-XX-001 first');
    }

    await test.step('Approver: Login', async () => {
      await login(page, 'approver');
    });

    // ... rest of test

  });

  test.afterAll(() => {
    // Clear state if used
    stateManager.clear();
  });

});
```

### Test Step Format

```typescript
// Format: 'Role: Action'
await test.step('Admin: Login', async () => { ... });
await test.step('Admin: Navigate to program list', async () => { ... });
await test.step('Admin: Fill program form', async () => { ... });
await test.step('Admin: Submit form', async () => { ... });
await test.step('Admin: Verify success toast', async () => { ... });
await test.step('Admin: Logout', async () => { ... });
```

---

## 8. Helper File Template

### Complete Template

```typescript
import { Page, Locator, expect } from '@playwright/test';

// ═══════════════════════════════════════════════════════════════════════════
// Section 1: Element Factories (Pure Locators)
// ═══════════════════════════════════════════════════════════════════════════

export const featureElements = (page: Page) => ({
  // Navigation
  linkFeature: page.getByRole('link', { name: 'Feature Name' }),
  
  // Buttons
  btnCreate:  page.getByRole('button', { name: 'Tambah' }),
  btnSave:    page.getByRole('button', { name: 'Simpan' }),
  btnCancel:  page.getByRole('button', { name: 'Batal' }),
  btnEdit:    page.getByRole('button', { name: 'Edit' }),
  btnDelete:  page.getByRole('button', { name: 'Hapus' }),
  
  // Form inputs
  inputName:  page.locator('input[name="NAMA"]'),
  inputDesc:  page.locator('textarea[name="DESKRIPSI"]'),
  drpStatus:  page.getByRole('combobox', { name: 'Status' }),
  
  // ⚠️ Fragile: CSS class auto-generated by React-Select
  dropdownKategori: page.locator('.css-19bb58m'),
  
  // Checkboxes
  checkboxActive: page.locator('input[type="checkbox"][name="ACTIVE"]'),
  
  // Toast messages
  toastSuccess: page.locator('.Toastify__toast--success'),
  toastError:   page.locator('.Toastify__toast--error'),
  
  // Table
  tblFeatureList: page.locator('table'),
});

// ═══════════════════════════════════════════════════════════════════════════
// Section 2: Action Helpers (Async Functions)
// ═══════════════════════════════════════════════════════════════════════════

export async function navigateToFeature(page: Page): Promise<void> {
  const el = featureElements(page);
  await el.linkFeature.click();
  await page.waitForURL('**/feature-path/**');
}

export async function clickCreateButton(page: Page): Promise<void> {
  const el = featureElements(page);
  await el.btnCreate.click();
}

export async function fillFeatureForm(
  page: Page,
  data: { name: string; desc: string }
): Promise<void> {
  const el = featureElements(page);
  await el.inputName.fill(data.name);
  await el.inputDesc.fill(data.desc);
}

export async function submitForm(page: Page): Promise<void> {
  const el = featureElements(page);
  await el.btnSave.click();
}

export async function waitForSuccessToast(page: Page): Promise<void> {
  const el = featureElements(page);
  await expect(el.toastSuccess).toBeVisible({ timeout: 10000 });
}

export async function selectDropdownOption(
  page: Page,
  optionText: string
): Promise<void> {
  const el = featureElements(page);
  await el.dropdownKategori.click();
  await page.getByText(optionText, { exact: true }).click();
}
```

---

## 9. Test Data Management

### Adding Test Data

**File**: [`helpers/data.helper.ts`](helpers/data.helper.ts)

```typescript
export const TEST_DATA = {
  
  program: {
    valid: {
      name: 'Test Program Auto',
      description: 'Created by automation',
      category: 'KV Kategori',
      operator: 'Telkomsel',
    },
    invalid: {
      name: '', // Empty name
      description: 'Invalid test',
    },
  },
  
  user: {
    admin: {
      username: 'admin@example.com',
      password: 'password123',
    },
    approver: {
      username: 'approver@example.com',
      password: 'password123',
    },
  },
  
  // Add your feature data here
  myFeature: {
    valid: {
      field1: 'value1',
      field2: 'value2',
    },
  },
  
};
```

### Using Test Data in Specs

```typescript
import { TEST_DATA } from '../../helpers/data.helper';

test('Create feature', async ({ page }) => {
  await fillFeatureForm(page, TEST_DATA.myFeature.valid);
});
```

---

## 10. Common Patterns & Recipes

### Pattern 1: Create → Verify → Store ID

```typescript
test('TC-XX-001 | Create item', async ({ page }) => {
  
  await test.step('Admin: Fill and submit form', async () => {
    await fillForm(page, TEST_DATA.item.valid);
    await submitForm(page);
  });

  await test.step('Admin: Verify success and store ID', async () => {
    await waitForSuccessToast(page);
    
    // Extract ID from URL or DOM
    const url = page.url();
    const id = url.match(/\/item\/(\d+)/)?.[1];
    
    if (id) {
      stateManager.set('itemId', id);
    }
  });
});
```

### Pattern 2: Role Switching in E2E Flow

```typescript
test('TC-XX-E2E | Create and approve', async ({ page }) => {
  
  // Phase 1: Admin creates
  await test.step('Admin: Login', async () => {
    await login(page, 'admin');
  });
  
  await test.step('Admin: Create item', async () => {
    await createItem(page, TEST_DATA.item.valid);
  });
  
  await test.step('Admin: Logout', async () => {
    await logout(page);
  });

  // Phase 2: Approver approves
  await test.step('Approver: Login', async () => {
    await login(page, 'approver');
  });
  
  await test.step('Approver: Approve item', async () => {
    const id = stateManager.require<string>('itemId');
    await approveItem(page, id);
  });
  
  await test.step('Approver: Logout', async () => {
    await logout(page);
  });
});
```

### Pattern 3: Handling React-Select Dropdowns

```typescript
export async function selectReactSelectOption(
  page: Page,
  dropdownLocator: Locator,
  optionText: string
): Promise<void> {
  // Click to open dropdown
  await dropdownLocator.click();
  
  // Wait for options to appear
  await page.waitForTimeout(500);
  
  // Click the option (exact match)
  await page.getByText(optionText, { exact: true }).click();
  
  // Wait for dropdown to close
  await page.waitForTimeout(300);
}

// Usage
const el = programElements(page);
await selectReactSelectOption(page, el.dropdownKategori, 'KV Kategori');
```

### Pattern 4: Table Row Selection

```typescript
export async function selectTableRow(
  page: Page,
  rowIdentifier: string
): Promise<void> {
  const row = page.locator(`tr:has-text("${rowIdentifier}")`);
  await row.click();
}

export async function clickEditInRow(
  page: Page,
  rowIdentifier: string
): Promise<void> {
  const row = page.locator(`tr:has-text("${rowIdentifier}")`);
  await row.getByRole('button', { name: 'Edit' }).click();
}
```

### Pattern 5: File Upload

```typescript
export async function uploadFile(
  page: Page,
  uploadLocator: Locator,
  filePath: string
): Promise<void> {
  await uploadLocator.setInputFiles(filePath);
}

// Usage
const el = programElements(page);
await uploadFile(page, el.uploadFoto, './test-assets/promofm.jpg');
```

### Pattern 6: Waiting for Navigation

```typescript
export async function navigateAndWait(
  page: Page,
  path: string,
  urlPattern: string
): Promise<void> {
  await page.goto(path);
  await page.waitForURL(urlPattern);
}

// Usage
await navigateAndWait(page, '/program-management', '**/program-management/**');
```

---

## 11. Known Gotchas Reference

### Quick Reference Table

| Issue | Root Cause | Solution |
|-------|------------|----------|
| `getByText('Selamat Pagi')` fails | Greeting changes by time | Use `page.waitForURL('**/main/**')` |
| React-Select breaks | CSS classes auto-generated | Tag with `// ⚠️`, replace with `data-testid` |
| `stateManager.require()` throws | Previous test failed/skipped | Guard with `test.skip()` pattern |
| Parallel workers don't share state | Each worker = separate process | Use `test.describe.serial` |
| Evidence not captured | Wrong test import | Import from `helpers/base.test.ts` |
| Auth not working | Using legacy file | Import from `helpers/elements/auth.helper.ts` |
| Toggle not working | Not registered | Add to `test.config.ts` first |

### Detailed Solutions

#### Gotcha 1: Time-Dependent Text

```typescript
// ❌ WRONG
await expect(page.getByText('Selamat Pagi')).toBeVisible();

// ✅ CORRECT
await page.waitForURL('**/main/**');
```

#### Gotcha 2: React-Select Fragility

```typescript
// ⚠️ FRAGILE — Tag and document
// ⚠️ Fragile: CSS class auto-generated by React-Select
// TODO: Replace with data-testid when available
dropdownKategori: page.locator('.css-19bb58m'),
```

#### Gotcha 3: State Manager Throws

```typescript
// ❌ WRONG — Will throw if previous test failed
const id = stateManager.require<string>('programId');

// ✅ CORRECT — Guard the test
test.beforeAll(() => {
  if (!stateManager.get('programId')) {
    test.skip(true, 'programId not set — run create-program first');
  }
});

const id = stateManager.require<string>('programId');
```

#### Gotcha 4: Parallel Execution

```typescript
// ❌ WRONG — Tests may run in any order
test.describe('Feature', () => {
  test('Create', async ({ page }) => { ... });
  test('Edit', async ({ page }) => { ... }); // May run before Create
});

// ✅ CORRECT — Serial execution
test.describe.serial('Feature', () => {
  test('Create', async ({ page }) => { ... });
  test('Edit', async ({ page }) => { ... }); // Always runs after Create
});
```

---

## Quick Command Reference

```powershell
# Run single spec
npx playwright test test-cases/feature/spec.spec.ts

# Run all tests (Chromium only)
npx playwright test

# Run all browsers
$env:ALL_BROWSERS="true"; npx playwright test

# View HTML report
npx playwright show-report

# Start codegen
npx playwright codegen https://dashboard.rms.dev.atklik.xyz/

# Run specific test by title
npx playwright test -g "TC-XX-001"

# Run in debug mode
npx playwright test --debug

# Run headed (visible browser)
npx playwright test --headed
```

---

**Last Updated**: 2026-05-19  
**Maintained By**: QA Automation Architect  
**Companion File**: [`AGENTS.md`](AGENTS.md) — Rules and behavioral patterns
