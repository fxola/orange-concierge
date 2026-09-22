import { expect, test } from '@playwright/test';
import { LoginPage } from '../support/login-page';

test('Admin can sign in', async ({ page }) => {
  await new LoginPage(page).signInAs('admin');

  await expect(page).toHaveURL(/\/clients$/);
});

test('Consultant can sign in', async ({ page }) => {
  await new LoginPage(page).signInAs('consultant');

  await expect(page).toHaveURL(/\/clients$/);
});

test('Reviewer can sign in', async ({ page }) => {
  await new LoginPage(page).signInAs('reviewer');

  await expect(page).toHaveURL(/\/clients$/);
});
