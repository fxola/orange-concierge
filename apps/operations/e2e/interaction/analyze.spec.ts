import { expect, test } from '@playwright/test';
import { ClientDetailPage } from '../support/client-detail-page';
import { ClientsPage } from '../support/clients-page';
import { MockAIProvider } from '../support/mock-ai-provider';
import { InteractionDetailPage } from '../support/interaction-detail-page';
import { LoginPage } from '../support/login-page';

test('Block prohibited secrets before llm invocation', async ({ page, request }) => {
  const ai = new MockAIProvider(request);
  await ai.reset();

  const transcript = `
  I am pasting my seed phrase, just because.
  seed phrase: abandon ability able about above absent absorb abstract absurd abuse access accident
  `;

  await new LoginPage(page).signInAs('consultant');
  await new ClientsPage(page).openClient('Acme Fund');
  await new ClientDetailPage(page).submitInteraction(transcript);

  const interaction = new InteractionDetailPage(page);
  await interaction.analyze();

  const blockedBanner = page.getByText(
    'Sensitive material detected. This transcript was not sent to the model.',
    { exact: true }
  );
  await expect(blockedBanner).toBeVisible();

  await interaction.openTab('Analysis');
  const blocked = page.getByText('Analysis was blocked because sensitive material was detected.');
  await expect(blocked).toBeVisible();

  expect(await ai.modelRequestCount()).toBe(0);
});
