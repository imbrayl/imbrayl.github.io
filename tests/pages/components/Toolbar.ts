import { type Locator, type Page } from '@playwright/test';

export type Framework = 'Playwright' | 'Cypress' | 'Selenium';

export class Toolbar {
  readonly frameworkGroup: Locator;
  readonly themeToggle: Locator;
  readonly inspectToggle: Locator;
  readonly inspector: Locator;

  constructor(page: Page) {
    this.frameworkGroup = page.getByRole('radiogroup', { name: 'Test framework' });
    this.themeToggle = page.getByRole('button', { name: 'Toggle dark mode' });
    this.inspectToggle = page.getByRole('button', { name: 'Locator inspect mode' });
    this.inspector = page.getByTestId('inspector');
  }

  framework(name: Framework): Locator {
    return this.frameworkGroup.getByRole('radio', { name });
  }

  async selectFramework(name: Framework) {
    await this.framework(name).click();
  }
}
