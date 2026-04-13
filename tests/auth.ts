import { Page, expect } from '@playwright/test';
import { admin_cred } from '../config/variables';

export async function login(page: Page) {
  await page.goto('https://dashboard.rms.dev.atklik.xyz/');

  const loginBtn = page.getByRole('button', { name: 'Masuk' });
  await expect(loginBtn).toBeVisible();
  await loginBtn.click();

  await page.getByRole('textbox', { name: /username/i }).fill(admin_cred.username);
  await page.getByRole('textbox', { name: /password/i }).fill(admin_cred.password);
  await page.getByRole('button', { name: 'Masuk' }).click();

  await expect(page.getByText('Selamat Pagi')).toBeVisible();
}

export async function logout(page: Page) {
  await page.getByRole('button', { name: 'Flowbite React Logo' }).nth(1).click();
  await page.getByRole('button', { name: 'Logout' }).click();

  await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible();
}