import { expect, test } from '@playwright/test';

test('app health endpoint is reachable through the local web server', async ({ request }) => {
  const response = await request.get('/api/health');

  expect(response.ok()).toBe(true);
  const body = await response.json();

  expect(body).toMatchObject({
    status: 'ok',
    service: 'operations',
  });
});
