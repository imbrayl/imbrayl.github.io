import { type Locator, type Page } from '@playwright/test';

export class HeroSection {
  readonly heading: Locator;
  readonly specFile: Locator;
  readonly specCode: Locator;
  readonly ciStatus: Locator;

  constructor(page: Page) {
    this.heading = page.getByRole('heading', { level: 1 });
    this.specFile = page.getByTestId('spec-file');
    this.specCode = page.getByTestId('spec-code');
    this.ciStatus = page.getByTestId('ci-status');
  }
}
