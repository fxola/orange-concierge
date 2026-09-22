import { expect, test } from '@playwright/test';
import { seedUsers } from 'scripts/e2e/config';

test('A logged in Admin user can view seeded clients', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill(seedUsers.admin.email);
  await page.getByLabel('Password').fill(seedUsers.admin.password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/clients$/);
  await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Acme Fund' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'TBW' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Origami' })).toBeVisible();
});
