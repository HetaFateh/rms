# AGENTS.md — RMS E2E Framework: Agent Behavioral Guide

> **Purpose**: This file defines the critical rules, patterns, and behavioral expectations for AI agents working with this Playwright E2E test framework. It consolidates all mode-specific rules and project-specific patterns into a single source of truth.

---

## 📋 Table of Contents

1. [Quick Reference](#quick-reference)
2. [Mandatory Architecture Rules](#mandatory-architecture-rules)
3. [File Organization & Imports](#file-organization--imports)
4. [Code Generation Workflow](#code-generation-workflow)
5. [Agent Behavioral Patterns](#agent-behavioral-patterns)
6. [Running Tests](#running-tests)
7. [Known Gotchas & Fragile Patterns](#known-gotchas--fragile-patterns)

---

## Quick Reference

### Before You Start ANY Task

1. **Read this file first** — All rules are non-negotiable
2. **Check [`test.config.ts`](test.config.ts)** — Verify toggle exists for your feature
3. **Review [`skills.md`](skills.md)** — Implementation recipes and patterns
4. **Scan [`helpers/elements/`](helpers/elements/)** — Reuse existing locators before creating new ones

### Critical Files

| File | Purpose | When to Modify |
|------|---------|----------------|
| [`test.config.ts`](test.config.ts) | Test execution toggles | **BEFORE** creating any new spec |
| [`helpers/base.test.ts`](helpers/base.test.ts) | Custom test fixture | Never (unless changing evidence collection) |
| [`helpers/state.manager.ts`](helpers/state.manager.ts) | Cross-test state sharing | Never (unless adding new state methods) |
| [`helpers/data.helper.ts`](helpers/data.helper.ts) | Test data constants | When adding new test data |
| [`helpers/temp_codegen.txt`](helpers/temp_codegen.txt) | Codegen scratch pad | Paste raw codegen, then clear after migration |

---

## Mandatory Architecture Rules

### 1. Custom Test Fixture (IRON LAW #1)

```typescript
// ✅ CORRECT — Import from custom fixture
import { test, expect } from '../../helpers/base.test';

// ❌ WRONG — Breaks evidence collection
import { test, expect } from '@playwright/test';
```

**Why?** [`helpers/base.test.ts`](helpers/base.test.ts:18-64) extends Playwright's test fixture to:
- Auto-capture JPEG screenshots (50% quality) after EVERY test
- Log all API calls (excluding static assets) to `./evidence/`
- Attach evidence to HTML reports with pass/fail labels

**Consequence of violation**: No screenshots, no API logs, debugging becomes impossible.

---

### 2. Auth Hub (IRON LAW #2)

```typescript
// ✅ CORRECT — Use the new auth hub
import { login, logout, switchRole, withAuth } from '../../helpers/elements/auth.helper';

// ❌ WRONG — Legacy file, DO NOT import in new specs
import { login } from '../../global/auth';
```

**Why?** [`global/auth.ts`](global/auth.ts) is kept ONLY for backward compatibility with existing specs. All new code MUST use [`helpers/elements/auth.helper.ts`](helpers/elements/auth.helper.ts).

**Login verification pattern**:
```typescript
// ✅ CORRECT — URL-based verification (time-independent)
await page.waitForURL('**/main/**');

// ❌ WRONG — Greeting text changes by time of day
await expect(page.getByText('Selamat Pagi')).toBeVisible();
```

---

### 3. Element Factory Pattern (IRON LAW #3)

**The Golden Rule**: Factories return **plain `Locator` objects** — NO `await`, NO `.click()`, NO `.fill()`.

```typescript
// ✅ CORRECT — Section 1: Pure locator factory
export const programElements = (page: Page) => ({
  btnSave:    page.getByRole('button', { name: 'Simpan' }),
  inputName:  page.locator('input[name="NAMA"]'),
  drpStatus:  page.getByRole('combobox', { name: 'Status' }),
});

// ✅ CORRECT — Section 2: Async action helper
export async function fillProgramForm(page: Page, data: { name: string }): Promise<void> {
  const el = programElements(page);
  await el.inputName.fill(data.name);
  await el.btnSave.click();
}

// ❌ WRONG — await inside factory
export const programElements = (page: Page) => ({
  btnSave: await page.getByRole('button').click(), // NEVER DO THIS
});
```

**Why?** Locators are lazy — they don't query the DOM until an action is performed. Mixing locator creation with actions breaks this pattern and causes race conditions.

---

### 4. State Manager (IRON LAW #4)

[`helpers/state.manager.ts`](helpers/state.manager.ts) is a **singleton** that shares state within the same Playwright worker.

```typescript
import { stateManager } from '../../helpers/state.manager';

// In test A (creator)
stateManager.set('programId', '42');

// In test B (consumer, same worker)
const id = stateManager.require<string>('programId'); // throws if missing

// Guard dependent tests
test.beforeAll(() => {
  if (!stateManager.get('programId')) {
    test.skip(true, 'programId not set — run create-program first');
  }
});

// Cleanup (MANDATORY in afterAll)
test.afterAll(() => {
  stateManager.clear();
});
```

**Critical behaviors**:
- State persists across tests in the **same worker only**
- Parallel workers do NOT share state
- `require<T>()` throws if key is missing — use `test.skip()` to guard
- MUST call `clear()` in `afterAll` to prevent cross-suite pollution

---

### 5. Test Toggle Switchboard (IRON LAW #5)

[`test.config.ts`](test.config.ts) is the **ONLY** place to enable/disable test execution.

**Workflow for new specs**:
1. Add toggle key to [`test.config.ts`](test.config.ts:17-48) **FIRST**
2. Guard spec with toggle in `beforeAll`

```typescript
// Step 1: Add to test.config.ts
export const testToggle = {
  runMyNewFeature: true, // TC-XX-001: Description
};

// Step 2: Guard spec file
import { testToggle } from '../../test.config';

test.describe.serial('My New Feature', () => {
  test.beforeAll(() => {
    if (!testToggle.runMyNewFeature) test.skip();
  });
  
  test('TC-XX-001 | Happy path', async ({ page }) => { ... });
});
```

**Why?** Centralized control prevents scattered `test.skip()` calls and makes it trivial to disable entire feature suites.

---

## File Organization & Imports

### Directory Structure

```
c:/Users/asset/OneDrive/Documents/RMS/
├── helpers/
│   ├── base.test.ts          ← Custom test fixture (import test from here)
│   ├── state.manager.ts      ← Cross-test state sharing
│   ├── data.helper.ts        ← Test data constants
│   ├── temp_codegen.txt      ← Codegen scratch pad (clear after use)
│   └── elements/
│       ├── auth.helper.ts    ← Login/logout/switchRole (NEW)
│       ├── global.elements.ts ← Shared UI elements
│       ├── program-mgmt.helper.ts
│       ├── appr-program.helper.ts
│       └── subs-appr.helper.ts
├── test-cases/
│   ├── program-management/
│   ├── program-approval/
│   ├── subscription-approval/
│   └── user-management/
├── test.config.ts            ← Test toggles (MANDATORY registration)
├── playwright.config.ts      ← Playwright settings
├── AGENTS.md                 ← This file
└── skills.md                 ← Implementation recipes
```

### Import Rules

```typescript
// ✅ CORRECT — Standard spec file imports
import { test, expect } from '../../helpers/base.test';
import { login, logout } from '../../helpers/elements/auth.helper';
import { testToggle } from '../../test.config';
import { stateManager } from '../../helpers/state.manager';
import { TEST_DATA } from '../../helpers/data.helper';

// ❌ WRONG — Never import these in new specs
import { test } from '@playwright/test';           // Breaks evidence collection
import { login } from '../../global/auth';         // Legacy file
```

### Helper File Structure

Every helper file in [`helpers/elements/`](helpers/elements/) follows this pattern:

```typescript
import { Page, Locator } from '@playwright/test';

// ═══════════════════════════════════════════════════════════════════════════
// Section 1: Element Factories (Pure Locators)
// ═══════════════════════════════════════════════════════════════════════════

export const myFeatureElements = (page: Page) => ({
  btnSave:    page.getByRole('button', { name: 'Simpan' }),
  inputName:  page.locator('input[name="NAMA"]'),
  // ⚠️ Fragile: CSS class auto-generated by React-Select
  dropdownKategori: page.locator('.css-19bb58m'),
});

// ═══════════════════════════════════════════════════════════════════════════
// Section 2: Action Helpers (Async Functions)
// ═══════════════════════════════════════════════════════════════════════════

export async function fillMyForm(page: Page, data: { name: string }): Promise<void> {
  const el = myFeatureElements(page);
  await el.inputName.fill(data.name);
  await el.btnSave.click();
}
```

---

## Code Generation Workflow

### Using Playwright Codegen

```powershell
# 1. Start codegen
npx playwright codegen https://dashboard.rms.dev.atklik.xyz/

# 2. Perform actions in browser
# 3. Copy generated code
# 4. Paste into helpers/temp_codegen.txt
```

### Migration Checklist

```
1. [ ] Paste raw codegen output into helpers/temp_codegen.txt
2. [ ] Create or update helpers/elements/<feature>.helper.ts
3. [ ] Extract locators into Section 1 (element factories)
4. [ ] Extract actions into Section 2 (async functions)
5. [ ] Apply naming conventions (see skills.md §6)
6. [ ] Tag fragile selectors with // ⚠️ comment
7. [ ] Add test data to helpers/data.helper.ts if needed
8. [ ] Clear helpers/temp_codegen.txt
```

**Naming conventions** (see [`skills.md`](skills.md:125-142) for full table):
- `btn` → buttons
- `inp` → text inputs
- `drp` → native `<select>` dropdowns
- `dropdown` → React-Select components
- `checkbox` → checkboxes
- `tab` → tab elements
- `toast` → toast/alert messages

---

## Agent Behavioral Patterns

### When Creating New Code

1. **Always check existing helpers first** — Reuse locators before creating duplicates
2. **Read related spec files** — Understand existing patterns before implementing
3. **Follow the Element Factory Pattern** — Section 1 (locators) + Section 2 (actions)
4. **Register toggle in test.config.ts** — BEFORE writing the spec file
5. **Use test.step() with role prefix** — Format: `'Role: Action'`

### When Modifying Existing Code

1. **Read the entire file first** — Understand context before making changes
2. **Preserve existing patterns** — Don't introduce new styles
3. **Update related files** — If changing a helper, check all specs that import it
4. **Test locally** — Run affected specs before marking complete

### When Debugging

1. **Check evidence folder** — Screenshots + API logs are auto-captured
2. **Verify toggle is enabled** — Check [`test.config.ts`](test.config.ts)
3. **Check state manager** — Use `stateManager.get()` to inspect state
4. **Run single spec** — `npx playwright test path/to/spec.ts`

### Code Encapsulation Rules

**ALWAYS follow these encapsulation patterns**:

1. **No raw selectors in spec files** — All locators via helper factories
2. **No business logic in spec files** — Extract to helper functions
3. **No hardcoded data in spec files** — Use [`helpers/data.helper.ts`](helpers/data.helper.ts)
4. **No duplicate locators** — Reuse existing factories
5. **No mixed concerns** — Locators in Section 1, actions in Section 2

**Example of proper encapsulation**:

```typescript
// ❌ WRONG — Raw selector + business logic in spec
test('Create program', async ({ page }) => {
  await page.locator('input[name="NAMA"]').fill('Test Program');
  await page.getByRole('button', { name: 'Simpan' }).click();
  await page.waitForURL('**/main/**');
});

// ✅ CORRECT — Encapsulated in helper
test('Create program', async ({ page }) => {
  await test.step('Admin: Fill program form', async () => {
    await fillProgramForm(page, TEST_DATA.program.valid);
  });
});
```

### When Asked to Implement a Feature

**Standard workflow**:

```
1. Read AGENTS.md (this file) — Understand rules
2. Read skills.md — Find implementation recipe
3. Check test.config.ts — Verify toggle exists or add it
4. Scan helpers/elements/ — Reuse existing locators
5. Read related spec files — Understand patterns
6. Implement following Element Factory Pattern
7. Add test data to data.helper.ts if needed
8. Write spec with proper test.step() labels
9. Clear temp_codegen.txt if used
```

---

## Running Tests

### Single Spec

```powershell
npx playwright test test-cases/program-management/create-program.spec.ts
```

### All Tests (Chromium Only)

```powershell
npx playwright test
```

### All Browsers

```powershell
# PowerShell
$env:ALL_BROWSERS="true"; npx playwright test

# CMD
set ALL_BROWSERS=true && npx playwright test

# Mac/Linux
ALL_BROWSERS=true npx playwright test
```

### View HTML Report

```powershell
npx playwright show-report
```

---

## Known Gotchas & Fragile Patterns

### 1. Time-Dependent Greeting Text

```typescript
// ❌ WRONG — Fails at different times of day
await expect(page.getByText('Selamat Pagi')).toBeVisible();

// ✅ CORRECT — Time-independent URL check
await page.waitForURL('**/main/**');
```

**Why?** Greeting changes: `Selamat Pagi` (morning) → `Selamat Siang` (afternoon) → `Selamat Malam` (evening).

---

### 2. React-Select Auto-Generated Classes

```typescript
// ⚠️ FRAGILE — Will break on library updates
const dropdownKategori = page.locator('.css-19bb58m');
```

**Fix**: Tag with `// ⚠️` comment and replace with `data-testid` when available.

---

### 3. State Manager Cross-Worker Isolation

```typescript
// ❌ WRONG — Assumes state is shared across parallel workers
const id = stateManager.require<string>('programId'); // May throw in parallel run

// ✅ CORRECT — Guard dependent tests
test.beforeAll(() => {
  if (!stateManager.get('programId')) {
    test.skip(true, 'programId not set — run create-program first');
  }
});
```

**Why?** Each Playwright worker is a separate process with its own state manager instance.

---

### 4. Parallel Test Execution

```typescript
// ✅ CORRECT — Use serial for dependent tests
test.describe.serial('Program E2E Flow', () => {
  test('Create program', async ({ page }) => { ... });
  test('Approve program', async ({ page }) => { ... });
});

// ❌ WRONG — Parallel execution breaks dependencies
test.describe('Program E2E Flow', () => {
  test('Create program', async ({ page }) => { ... });
  test('Approve program', async ({ page }) => { ... }); // May run before create
});
```

---

### 5. Evidence Collection Timing

Evidence (screenshots + API logs) is captured **after each test completes**, not during execution. If you need mid-test screenshots, use:

```typescript
await page.screenshot({ path: `./evidence/debug-${Date.now()}.jpg` });
```

---

## Mode-Specific Notes

### Code Mode
- No access to MCP servers or browser automation tools
- Use only file operations and command execution
- Follow all architecture rules above

### Advanced Mode
- HAS access to MCP servers and browser automation tools
- Can use additional tools beyond standard file operations
- Follow all architecture rules above

### Ask Mode
- Focus on explaining architecture and patterns
- Reference this file and [`skills.md`](skills.md) for answers
- Highlight non-obvious behaviors and gotchas

---

## Quick Checklist for New Features

```
Before writing ANY code:
[ ] Read AGENTS.md (this file)
[ ] Read skills.md for implementation recipes
[ ] Add toggle to test.config.ts
[ ] Check helpers/elements/ for reusable locators
[ ] Review similar existing specs

While implementing:
[ ] Import test from helpers/base.test.ts
[ ] Import auth from helpers/elements/auth.helper.ts
[ ] Follow Element Factory Pattern (Section 1 + 2)
[ ] Use test.step() with 'Role: Action' format
[ ] Tag fragile selectors with // ⚠️
[ ] Add test data to helpers/data.helper.ts
[ ] Guard spec with toggle in beforeAll
[ ] Clear state in afterAll if using stateManager

After implementation:
[ ] Clear helpers/temp_codegen.txt if used
[ ] Run spec locally to verify
[ ] Check evidence folder for screenshots/logs
```

---

**Last Updated**: 2026-05-19  
**Maintained By**: QA Automation Architect  
**Companion File**: [`skills.md`](skills.md) — Implementation recipes and code patterns
