# Project Architecture Rules (Non-Obvious Only)

## Element Factory Architecture Constraint
- Factories MUST return plain `Locator` objects — NO async, NO side effects
- Actions live in separate `async` functions (Section 2 of helper files)
- This separation is MANDATORY — violating it breaks the entire architecture
- One `page: Page` parameter only — no other arguments allowed

## State Manager Singleton Limitation
- State only persists within same Playwright worker process
- Parallel workers do NOT share state (architectural decision, not a bug)
- `stateManager.require<T>()` throws intentionally — forces explicit error handling
- Must call `stateManager.clear()` in `afterAll` to prevent cross-suite pollution

## Test Toggle Centralization Pattern
- `test.config.ts` is the ONLY source of truth for test execution
- NOT distributed across spec files or playwright.config.ts
- Every new test MUST register a toggle key BEFORE implementation
- This enforces explicit test inventory management

## Auth Hub Session Isolation
- `switchRole()` performs FULL logout → login cycle (not just credential swap)
- This guarantees session isolation between roles (architectural requirement)
- `global/auth.ts` kept for backward compatibility only — new code uses `auth.helper.ts`

## Evidence Collection Architecture
- Custom test fixture in `helpers/base.test.ts` extends Playwright's base test
- Auto-captures screenshots (JPEG 50%) + API logs after EVERY test
- Static assets filtered via regex to reduce log noise
- Evidence saved to `./evidence/` directory (git-ignored)

## Helper File Split Strategy
- Helpers split by FEATURE DOMAIN, not by page or component
- Each domain gets ONE helper file with both locators and actions
- New helper file created when feature has ≥3 unique locators
- Prevents helper file explosion and maintains clear boundaries

## React-Select Locator Fragility (Architectural Risk)
- CSS classes like `.css-19bb58m` are library-generated — WILL break on updates
- No stable `data-testid` attributes available (external library limitation)
- Tagged with `// ⚠️` for future replacement when library adds test IDs
- This is a known technical debt item

## Login Verification Non-Standard Pattern
- Success verified by URL pattern `**/main/**`, NOT DOM elements
- Greeting text changes by time of day — intentionally avoided
- This prevents time-dependent test failures (architectural decision)

## Codegen Workflow Staging Pattern
- Raw output goes to `helpers/temp_codegen.txt` (staging area)
- NOT directly into helper files (prevents polluting codebase)
- Manual migration enforces naming conventions and architecture compliance
- Temp file MUST be cleared after migration (hygiene requirement)