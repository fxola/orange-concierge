import { seedUsers } from 'scripts/e2e/config';
import { BasePage } from './base-page';

export type TestRole = 'admin' | 'consultant' | 'reviewer';

export class LoginPage extends BasePage {
  async signInAs(role: TestRole): Promise<void> {
    const user = seedUsers[role];
    await this.page.goto('/login');
    await this.page.getByLabel('Email').fill(user.email);
    await this.page.getByLabel('Password').fill(user.password);

    await Promise.all([
      this.page.waitForURL(/\/clients$/, { timeout: 15_000 }),
      this.page.getByRole('button', { name: 'Sign in' }).click(),
    ]);
  }
}
