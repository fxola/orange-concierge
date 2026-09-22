import { expect, test } from '@playwright/test';

test('E2E tooling is discoverable', async () => {
  expect(test.info().project.name).toBe('chromium');
});
