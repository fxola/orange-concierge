import { expect, test } from '@playwright/test';
import { ClientsPage } from '../support/clients-page';
import { LoginPage } from '../support/login-page';

test('A logged in Admin user can view seeded clients', async ({ page }) => {
  await new LoginPage(page).signInAs('admin');

  const clients = new ClientsPage(page);
  await expect(clients.heading()).toBeVisible();
  await expect(clients.clientLink('Acme Fund')).toBeVisible();
  await expect(clients.clientLink('TBW')).toBeVisible();
  await expect(clients.clientLink('Origami')).toBeVisible();
});
