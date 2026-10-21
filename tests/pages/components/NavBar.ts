import { type Locator, type Page } from '@playwright/test';

export class NavBar {
  readonly root: Locator;
  readonly links: Locator;
  readonly menuButton: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('navigation', { name: 'Primary', includeHidden: true });
    this.links = this.root.getByRole('link', { includeHidden: true });
    this.menuButton = page.getByRole('button', { name: /menu/i });
  }

  link(name: string): Locator {
    return this.root.getByRole('link', { name, exact: true });
  }

  /** Opens the mobile menu first when the nav is collapsed. */
  async goTo(name: string) {
    if (await this.menuButton.isVisible()) await this.menuButton.click();
    await this.link(name).click();
  }
}
