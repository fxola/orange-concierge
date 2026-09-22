import { expect, test } from '@playwright/test';
import { ClientDetailPage } from '../support/client-detail-page';
import { ClientsPage } from '../support/clients-page';
import { InteractionDetailPage } from '../support/interaction-detail-page';
import { LoginPage } from '../support/login-page';

test('Admin can submit an interaction for a client', async ({ page }) => {
  const transcript = `
    E2E intake notes: Acme Fund wants a staged self-custody review.
    The client currently uses exchange custody and wants an operational checklist.`;

  await new LoginPage(page).signInAs('admin');
  await new ClientsPage(page).openClient('Acme Fund');
  await new ClientDetailPage(page).submitInteraction(transcript);

  await expect(page.getByRole('heading', { name: 'Analyze transcript' })).toBeVisible();
  await expect(page.getByText('Needs analysis').first()).toBeVisible();

  const interaction = new InteractionDetailPage(page);
  await interaction.openTab('Transcript');
  await expect(page.getByText(transcript)).toBeVisible();
});
