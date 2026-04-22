/**
 * global/auth.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Centralised login/logout utilities.
 *
 * Design decisions:
 *  - UserRole interface enforces type safety on credential objects.
 *  - Roles are resolved entirely from environment variables (loaded by dotenv
 *    in playwright.config.ts) so no secrets live in source code.
 *  - A withAuth() wrapper lets any spec run Login → Test → Logout in one call.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { Page, expect } from '@playwright/test';

// ── Role type definitions ─────────────────────────────────────────────────────

export type RoleName = 'admin' | 'agent' | 'approver';

export interface UserRole {
  name: RoleName;
  username: string;
  password: string;
}

// ── Available roles (resolved from env) ──────────────────────────────────────

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
      `[auth] Missing credentials for role "${name}". ` +
      `Ensure ${name.toUpperCase()}_USERNAME and ${name.toUpperCase()}_PASSWORD are set in .env`
    );
  }
  return role;
}

// ── Core helpers ──────────────────────────────────────────────────────────────

const BASE_URL = process.env.BASE_URL ?? 'https://dashboard.rms.dev.atklik.xyz/';

/**
 * Navigate to the app and log in as the given role.
 * Default role is 'admin'.
 */
export async function login(page: Page, roleName: RoleName = 'admin'): Promise<void> {
  const role = resolveRole(roleName);

  await page.goto(BASE_URL);

  const loginBtn = page.getByRole('button', { name: 'Masuk' });
  await expect(loginBtn).toBeVisible({ timeout: 10_000 });
  await loginBtn.click();

  await page.getByRole('textbox', { name: /username/i }).fill(role.username);
  await page.getByRole('textbox', { name: /password/i }).fill(role.password);
  await page.getByRole('button', { name: 'Masuk' }).click();

  // Assert successful login — greeting appears on dashboard.
  await expect(page.getByText('Selamat Pagi')).toBeVisible({ timeout: 15_000 });
}

/**
 * Log out the currently authenticated user.
 */
export async function logout(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Flowbite React Logo' }).nth(1).click();
  await page.getByRole('button', { name: 'Logout' }).click();

  // Confirm we are back on the login screen.
  await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible({ timeout: 10_000 });
}

/**
 * Higher-order wrapper: Login → run testBody() → Logout.
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
