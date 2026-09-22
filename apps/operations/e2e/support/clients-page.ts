import { expect, type Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class ClientsPage extends BasePage {
  heading(): Locator {
    return this.page.getByRole('heading', { name: 'Clients' });
  }

  clientLink(displayName: string): Locator {
    return this.page.getByRole('link', { name: displayName });
  }

  async openClient(displayName: string): Promise<void> {
    await this.clientLink(displayName).click();
    await expect(this.page.getByRole('heading', { name: displayName })).toBeVisible();
  }
}
