import { type Locator, type Page } from '@playwright/test';

export class ContactSection {
  readonly root: Locator;
  readonly emailLink: Locator;
  readonly linkedInLink: Locator;
  readonly gitHubLink: Locator;

  constructor(page: Page) {
    this.root = page.locator('#contact');
    this.emailLink = this.root.getByRole('link', { name: 'Email me' });
    this.linkedInLink = this.root.getByRole('link', { name: 'LinkedIn' });
    this.gitHubLink = this.root.getByRole('link', { name: 'GitHub' });
  }
}
