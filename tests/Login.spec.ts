import { test } from '@playwright/test';
import { login } from './auth';

test('Login Test', async ({ page }) => {
  await login(page);
});
