import { expect } from '@playwright/test';
import { BasePage } from './base-page';

export class ClientDetailPage extends BasePage {
  async submitInteraction(transcript: string): Promise<void> {
    await this.page.getByRole('button', { name: 'Add interaction' }).click();
    await this.page.getByRole('textbox', { name: 'Transcript' }).fill(transcript);

    const [submitResponse] = await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.url().endsWith('/api/interactions') && response.request().method() === 'POST'
      ),
      this.page.waitForURL(/\/clients\/[^/]+\/interactions\/[^/]+$/, { timeout: 15_000 }),
      this.page.getByRole('button', { name: 'Submit interaction' }).click(),
    ]);

    expect(submitResponse.status(), await submitResponse.text()).toBe(201);
  }
}
