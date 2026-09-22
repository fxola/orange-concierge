import { expect, test } from '@playwright/test';
import { REVIEW_TRANSCRIPT } from 'scripts/e2e/ai-provider/llm-fixtures';
import { ClientDetailPage } from '../support/client-detail-page';
import { ClientsPage } from '../support/clients-page';
import { InteractionDetailPage } from '../support/interaction-detail-page';
import { LoginPage } from '../support/login-page';

test.setTimeout(120_000);

const RECOMMENDATION_TITLE = 'Move funds into hardware wallet self-custody';

test('Admin drafts a recommendation, consultant cannot approve, reviewer approves', async ({
  page,
}) => {
  const login = new LoginPage(page);
  const clients = new ClientsPage(page);
  const detail = new ClientDetailPage(page);
  const interaction = new InteractionDetailPage(page);

  await login.signInAs('admin');
  await clients.openClient('Acme Fund');
  await detail.submitInteraction(REVIEW_TRANSCRIPT);

  const interactionUrl = page.url();
  await interaction.analyze();
  await expect(page.getByText('Complete').first()).toBeVisible();

  await interaction.openTab('Recommendations');
  await interaction.generate();
  await expect(page.getByRole('heading', { name: RECOMMENDATION_TITLE })).toBeVisible();

  await interaction.submitDraftForReview();

  const draftCard = interaction.recommendationCard(RECOMMENDATION_TITLE);
  await expect(draftCard.getByText('Pending review')).toBeVisible();

  await interaction.signOut();

  await login.signInAs('consultant');
  await page.goto(interactionUrl);
  await interaction.openTab('Recommendations');

  const pendingCard = interaction.recommendationCard(RECOMMENDATION_TITLE);
  await expect(pendingCard.getByText('Pending review')).toBeVisible();
  await expect(pendingCard.getByRole('button', { name: 'Approve', exact: true })).toHaveCount(0);
  await expect(pendingCard.getByRole('button', { name: 'Reject', exact: true })).toHaveCount(0);

  await interaction.signOut();

  await login.signInAs('reviewer');
  await page.goto(interactionUrl);
  await interaction.openTab('Recommendations');
  await interaction.approve();

  const reviewedCard = interaction.recommendationCard(RECOMMENDATION_TITLE);
  await expect(reviewedCard.getByText('Approved')).toBeVisible();
});
