import { test as base, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';

type Fixtures = {
  home: HomePage;
  consoleErrors: string[];
};

export const test = base.extend<Fixtures>({
  // Every test fails if the page logs a console error or throws
  consoleErrors: [async ({ page }, use) => {
    const errors: string[] = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', (err) => errors.push(err.message));
    await use(errors);
    expect(errors, 'console errors').toEqual([]);
  }, { auto: true }],

  home: async ({ page }, use) => {
    const home = new HomePage(page);
    await home.goto();
    await use(home);
  },
});

export { expect };

declare global {
  interface Window {
    portfolio: {
      INSPECTABLE: string;
      locatorFor(el: Element, fw: string): string;
      assertions: Record<string, Record<string, string>>;
      heroSpec: Record<string, string>;
      framework(): string;
    };
  }
}
