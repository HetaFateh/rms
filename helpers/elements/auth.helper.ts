/**
 * helpers/elements/auth.helper.ts  —  Auth Hub
 * ──────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all authentication actions.
 *
 * Design decisions:
 *   - resolveRole() reads credentials exclusively from process.env — no secrets
 *     in source code.
 *   - login() uses locators from global.elements.ts so selectors stay DRY.
 *   - switchRole() enforces full logout → login to guarantee session isolation
 *     between roles (as required by the architecture).
 *   - withAuth() is a convenience wrapper for single-role test bodies.
 *
 * Exported types / functions:
 *   RoleName          — union of all supported roles
 *   UserRole          — credential object shape
 *   login()           — navigate to app and authenticate
 *   logout()          — sign out and confirm landing back on login screen
 *   switchRole()      — logout current user then login as a different role
 *   withAuth()        — higher-order wrapper: login → body → logout
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { Page, expect } from '@playwright/test';
import { loginElements, navbarElements } from './global.elements';

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 1 – TYPES & ROLE RESOLUTION
// ══════════════════════════════════════════════════════════════════════════════

export type RoleName = 'admin' | 'agent' | 'approver';

export interface UserRole {
  name: RoleName;
  username: string;
  password: string;
}

/**
 * Resolve credentials for a given role from environment variables.
 * Throws a descriptive error if credentials are missing.
 */
function resolveRole(name: RoleName): UserRole {
  const roles: Record<RoleName, UserRole> = {
    admin: {
      name: 'admin',
      username: process.env.ADMIN_USERNAME ?? '',
      password: process.env.ADMIN_PASSWORD ?? '',
    },
    approver: {
      name: 'approver',
      username: process.env.APPROVER_USERNAME ?? '',
      password: process.env.APPROVER_PASSWORD ?? '',
    },
    agent: {
      name: 'agent',
      username: process.env.AGENT_USERNAME ?? '',
      password: process.env.AGENT_PASSWORD ?? '',
    },
  };

  const role = roles[name];
  if (!role.username || !role.password) {
    throw new Error(
      `[AuthHelper] Missing credentials for role "${name}". ` +
      `Ensure ${name.toUpperCase()}_USERNAME and ${name.toUpperCase()}_PASSWORD ` +
      `are set in .env`
    );
  }
  return role;
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 2 – ACTION HELPERS
// ══════════════════════════════════════════════════════════════════════════════

const BASE_URL = process.env.BASE_URL ?? 'https://dashboard.rms.dev.atklik.xyz/';

/**
 * Navigate to the app and log in as the given role.
 * Asserts the dashboard is reached before returning.
 *
 * @param page      - Playwright Page object
 * @param roleName  - Role to authenticate as (default: 'admin')
 */
export async function login(page: Page, roleName: RoleName = 'admin'): Promise<void> {
  const role = resolveRole(roleName);
  const el   = loginElements(page);

  // Clear cookies to ensure clean session
  await page.context().clearCookies();
  
  await page.goto(BASE_URL);

  // Wait for login page to be ready
  await expect(el.btnMasuk).toBeVisible({ timeout: 10_000 });
  await el.btnMasuk.click();

  await el.inputUsername.fill(role.username);
  await el.inputPassword.fill(role.password);
  await el.btnMasuk.click();

  // Confirm successful login — wait for dashboard URL rather than greeting text,
  // because the greeting changes based on time of day (Selamat Pagi / Siang / Malam).
  await page.waitForURL('**/main/**', { timeout: 15_000 });
  
  // Wait for page to fully load after login
  await page.waitForLoadState('networkidle');
}

/**
 * Log out the currently authenticated user and confirm the login screen appears.
 *
 * @param page - Playwright Page object
 */
export async function logout(page: Page): Promise<void> {
  const nav = navbarElements(page);
  const login = loginElements(page);

  await nav.btnAvatar.click();
  await nav.btnLogout.click();

  // Confirm we are back on the login screen.
  await expect(login.btnMasuk).toBeVisible({ timeout: 10_000 });
}

/**
 * Switch from the currently logged-in role to a different role.
 * Performs a full logout → login cycle to guarantee session isolation.
 *
 * @param page        - Playwright Page object
 * @param nextRole    - The role to authenticate as after logging out
 */
export async function switchRole(page: Page, nextRole: RoleName): Promise<void> {
  await logout(page);
  await login(page, nextRole);
}

/**
 * Higher-order wrapper: Login → run testBody() → Logout.
 * The logout runs even if testBody() throws.
 *
 * @param page      - Playwright Page object
 * @param roleName  - Role to authenticate as
 * @param testBody  - Async callback containing the test actions
 *
 * Usage:
 *   await withAuth(page, 'admin', async () => {
 *     // your test actions here
 *   });
 */
export async function withAuth(
  page: Page,
  roleName: RoleName,
  testBody: () => Promise<void>
): Promise<void> {
  await login(page, roleName);
  try {
    await testBody();
  } finally {
    await logout(page);
  }
}
