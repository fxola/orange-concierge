import { expect, test } from '@playwright/test';
import { seedUsers } from 'scripts/e2e/config';

test('Block prohibited secrets before llm invocation', async ({ page, request }) => {
  const AIBaseURL = process.env.E2E_AI_BASE_URL;
  expect(AIBaseURL).toBeTruthy();

  await request.post(`${AIBaseURL}/__e2e/reset`);

  const transcript = `
  I am pasting my seed phrase, just because.
  seed phrase: abandon ability able about above absent absorb abstract absurd abuse access accident
  `;

  await page.goto('/login');
  await page.getByLabel('Email').fill(seedUsers.consultant.email);
  await page.getByLabel('Password').fill(seedUsers.consultant.password);
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

  const [analyzeResponse] = await Promise.all([
    page.waitForResponse(
      (response) =>
        /\/api\/interactions\/[^/]+\/analyze$/.test(new URL(response.url()).pathname) &&
        response.request().method() === 'POST'
    ),
    page.getByRole('button', { name: 'Analyze interaction' }).click(),
  ]);

  expect(analyzeResponse.status(), await analyzeResponse.text()).toBe(200);
  const blockedBanner = page.getByText(
    'Sensitive material detected. This transcript was not sent to the model.',
    { exact: true }
  );
  await expect(blockedBanner).toBeVisible();

  await page.getByRole('tab', { name: 'Analysis' }).click();
  const blocked = page.getByText('Analysis was blocked because sensitive material was detected.');
  await expect(blocked).toBeVisible();

  const requestCountResponse = await request.get(`${AIBaseURL}/__e2e/requests`);
  expect(requestCountResponse.ok()).toBe(true);
  const requestCountBody = await requestCountResponse.json();

  expect(requestCountBody).toMatchObject({ modelRequestCount: 0 });
});
