/** Single source of truth for all authentication actions and role management. */
import { Page, expect } from '@playwright/test';
import { loginElements, navbarElements } from './global.elements';

export type RoleName = 'admin' | 'agent' | 'approver';

export interface UserRole {
  name: RoleName;
  username: string;
  password: string;
}

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

const BASE_URL = process.env.BASE_URL ?? 'https://dashboard.rms.dev.atklik.xyz/';

export async function login(page: Page, roleName: RoleName = 'admin'): Promise<void> {
  const role = resolveRole(roleName);
  const el   = loginElements(page);

  await page.context().clearCookies();
  await page.goto(BASE_URL);

  await expect(el.btnMasuk).toBeVisible({ timeout: 10_000 });
  await el.btnMasuk.click();

  await el.inputUsername.fill(role.username);
  await el.inputPassword.fill(role.password);
  await el.btnMasuk.click();

  await page.waitForURL('**/main/**', { timeout: 15_000 });
  await page.waitForLoadState('networkidle');
}

export async function logout(page: Page): Promise<void> {
  const nav = navbarElements(page);
  const login = loginElements(page);

  await nav.btnAvatar.click();
  await nav.btnLogout.click();

  await expect(login.btnMasuk).toBeVisible({ timeout: 10_000 });
}

export async function switchRole(page: Page, nextRole: RoleName): Promise<void> {
  await logout(page);
  await login(page, nextRole);
}

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
