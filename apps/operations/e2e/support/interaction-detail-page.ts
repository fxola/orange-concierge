import { expect, type Locator } from '@playwright/test';
import { BasePage } from './base-page';

export type InteractionTab = 'Transcript' | 'Analysis' | 'Recommendations';

export class InteractionDetailPage extends BasePage {
  recommendationCard(title: string): Locator {
    return this.page.locator('article', {
      has: this.page.getByRole('heading', { name: title }),
    });
  }

  async openTab(name: InteractionTab): Promise<void> {
    await this.page.getByRole('tab', { name }).click();
  }

  async analyze(): Promise<void> {
    const [analyzeResponse] = await Promise.all([
      this.page.waitForResponse(
        (response) =>
          /\/api\/interactions\/[^/]+\/analyze$/.test(new URL(response.url()).pathname) &&
          response.request().method() === 'POST'
      ),
      this.page.getByRole('button', { name: 'Analyze interaction' }).click(),
    ]);

    expect(analyzeResponse.status(), await analyzeResponse.text()).toBe(200);
  }

  async generate(): Promise<void> {
    const [generateResponse] = await Promise.all([
      this.page.waitForResponse(
        (response) =>
          /\/api\/interactions\/[^/]+\/recommendations$/.test(new URL(response.url()).pathname) &&
          response.request().method() === 'POST'
      ),
      this.page.getByRole('button', { name: 'Generate' }).click(),
    ]);

    expect(generateResponse.status(), await generateResponse.text()).toBe(200);
  }

  async submitDraftForReview(): Promise<void> {
    await this.page
      .getByRole('checkbox', {
        name: 'I reviewed the transcript, facts, and proof behind this draft.',
      })
      .check();

    const [submitForReviewResponse] = await Promise.all([
      this.page.waitForResponse(
        (response) =>
          /\/api\/recommendations\/.+\/submit$/.test(new URL(response.url()).pathname) &&
          response.request().method() === 'POST'
      ),
      this.page.getByRole('button', { name: 'Submit for review' }).click(),
    ]);

    expect(submitForReviewResponse.status(), await submitForReviewResponse.text()).toBe(200);
  }

  async approve(): Promise<void> {
    const [reviewResponse] = await Promise.all([
      this.page.waitForResponse(
        (response) =>
          /\/api\/recommendations\/.+\/review$/.test(new URL(response.url()).pathname) &&
          response.request().method() === 'POST'
      ),
      this.page.getByRole('button', { name: 'Approve', exact: true }).click(),
    ]);

    expect(reviewResponse.status(), await reviewResponse.text()).toBe(200);
  }
}
