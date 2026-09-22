import { expect, type APIRequestContext } from '@playwright/test';

export class MockAIProvider {
  constructor(private readonly request: APIRequestContext) {}

  private baseURL(): string {
    const baseURL = process.env.E2E_AI_BASE_URL;
    expect(baseURL).toBeTruthy();

    return baseURL as string;
  }

  async reset(): Promise<void> {
    await this.request.post(`${this.baseURL()}/__e2e/reset`);
  }

  async modelRequestCount(): Promise<number> {
    const response = await this.request.get(`${this.baseURL()}/__e2e/requests`);
    expect(response.ok()).toBe(true);

    const body = (await response.json()) as { modelRequestCount: number };

    return body.modelRequestCount;
  }
}
