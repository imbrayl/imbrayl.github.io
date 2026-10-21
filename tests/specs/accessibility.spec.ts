import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../fixtures';
import type { Framework } from '../pages/components/Toolbar';

const frameworks: Framework[] = ['Playwright', 'Cypress', 'Selenium'];

test.describe('accessibility', () => {
  for (const scheme of ['light', 'dark'] as const) {
    for (const fw of frameworks) {
      test(`no axe violations — ${scheme}, ${fw}`, async ({ home, page }) => {
        await page.emulateMedia({ colorScheme: scheme });
        await home.toolbar.selectFramework(fw);
        await page.waitForTimeout(500); // let the code reveal animation finish

        const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
        expect(violations.map((v) => `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
      });
    }
  }

  test('one h1 and no skipped heading levels', async ({ home, page }) => {
    void home;
    await expect(page.locator('h1')).toHaveCount(1);
    const levels = await page.locator('h1, h2, h3, h4, h5, h6').evaluateAll((hs) =>
      hs.filter((h) => !h.closest('[hidden]')).map((h) => Number(h.tagName[1])));
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i] - levels[i - 1], `h${levels[i - 1]} → h${levels[i]}`).toBeLessThanOrEqual(1);
    }
  });

  test('skip link is the first tab stop', async ({ home, page, isMobile }) => {
    test.skip(isMobile, 'no Tab key on touch devices');
    void home;
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
  });

  test('artifact tabs work with arrow keys', async ({ home, page }) => {
    void home;
    await page.getByRole('tab', { name: 'Bug report' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Test cases' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel', { name: 'Test cases' })).toBeVisible();
    await expect(page.locator('#panel-bug')).toBeHidden();
  });
});
