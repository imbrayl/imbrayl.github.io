import { test, expect } from '../fixtures';
import type { Framework } from '../pages/components/Toolbar';

test.describe('layout', () => {
  for (const fw of ['Playwright', 'Cypress', 'Selenium'] as Framework[]) {
    test(`no horizontal scroll at 320px — ${fw}`, async ({ home, page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await home.toolbar.selectFramework(fw);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test('every nav link points to a real section', async ({ home, page }) => {
    const hrefs = await home.nav.links.evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
    expect(hrefs.length).toBeGreaterThan(5);
    for (const href of hrefs) await expect(page.locator(href), href).toHaveCount(1);
  });

  test('mobile menu closes after navigating', async ({ home, isMobile }) => {
    test.skip(!isMobile, 'menu is collapsed only on small screens');
    await expect(home.nav.links.first()).toBeHidden();
    await home.nav.goTo('Skills');
    await expect(home.nav.menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(home.nav.links.first()).toBeHidden();
  });

  test('theme toggle switches and persists', async ({ home, page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await home.toolbar.themeToggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await home.toolbar.themeToggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('CI status badge renders', async ({ home }) => {
    await expect(home.hero.ciStatus).not.toContainText('Checking');
  });
});
