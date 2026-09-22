import { expect, test } from '@playwright/test';

test('Admin can submit an interaction for a client', async ({ page }) => {
  const transcript = `
    E2E intake notes: Acme Fund wants a staged self-custody review.
    The client currently uses exchange custody and wants an operational checklist.`;

  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@orangeconcierge.test');
  await page.getByLabel('Password').fill('DemoAdmin123!');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/clients$/);
  await page.getByRole('link', { name: 'Acme Fund' }).click();

  await expect(page.getByRole('heading', { name: 'Acme Fund' })).toBeVisible();
  await page.getByRole('button', { name: 'Add interaction' }).click();
  await page.getByRole('textbox', { name: 'Transcript' }).fill(transcript);

  const [submitResponse] = await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/interactions') && response.request().method() === 'POST'
    ),
    page.getByRole('button', { name: 'Submit interaction' }).click(),
  ]);

  expect(submitResponse.status(), await submitResponse.text()).toBe(201);

  await expect(page).toHaveURL(/\/clients\/[^/]+\/interactions\/[^/]+$/);
  await expect(page.getByRole('heading', { name: 'Analyze transcript' })).toBeVisible();
  await expect(page.getByText('Needs analysis').first()).toBeVisible();

  await page.getByRole('tab', { name: 'Transcript' }).click();
  await expect(page.getByText(transcript)).toBeVisible();
});
