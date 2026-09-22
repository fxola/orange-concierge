import { expect, test } from '@playwright/test';
import { seedUsers } from 'scripts/e2e/config';

test('Admin can sign in', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill(seedUsers.admin.email);
  await page.getByLabel('Password').fill(seedUsers.admin.password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/clients$/);
});

test('Consultant can sign in', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill(seedUsers.consultant.email);
  await page.getByLabel('Password').fill(seedUsers.consultant.password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/clients$/);
});

test('Reviewer can sign in', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill(seedUsers.reviewer.email);
  await page.getByLabel('Password').fill(seedUsers.reviewer.password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/clients$/);
});
