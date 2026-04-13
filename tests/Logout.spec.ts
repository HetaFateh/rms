import { test } from '@playwright/test';
import { login, logout } from './auth';

test('Logout Test', async ({ page }) => {
  // We need to be logged in to log out
  await login(page);
  await logout(page);
});
