import { expect, type Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async signOut(): Promise<void> {
    await this.page.getByRole('button', { name: 'Sign out' }).click();
    await expect(this.page).toHaveURL(/\/login$/);
  }
}
