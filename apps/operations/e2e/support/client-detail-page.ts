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
      this.page.getByRole('button', { name: 'Submit interaction' }).click(),
    ]);

    expect(submitResponse.status(), await submitResponse.text()).toBe(201);
    await expect(this.page).toHaveURL(/\/clients\/[^/]+\/interactions\/[^/]+$/);
  }
}
