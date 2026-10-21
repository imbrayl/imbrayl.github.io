import { test, expect } from '../fixtures';
import type { Locator, Page } from '@playwright/test';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

test.describe('locator inspect mode', () => {
  test('every Playwright locator it shows finds exactly its element', async ({ home, page }) => {
    void home;
    const count = await page.evaluate(() => document.querySelectorAll(window.portfolio.INSPECTABLE).length);
    let checked = 0;

    for (let i = 0; i < count; i++) {
      const source = await page.evaluate((i) => {
        const el = document.querySelectorAll(window.portfolio.INSPECTABLE)[i];
        if (!el.checkVisibility()) return null;
        el.setAttribute('data-under-test', String(i));
        return window.portfolio.locatorFor(el, 'playwright');
      }, i);
      if (!source) continue;

      const locator = new Function('page', `return ${source};`)(page) as Locator;
      await expect(locator, source).toHaveCount(1);
      await expect(locator, source).toHaveAttribute('data-under-test', String(i));
      checked++;
    }
    expect(checked).toBeGreaterThan(15);
  });

  test('hover shows the locator in the active framework', async ({ home, page, isMobile }) => {
    test.skip(isMobile, 'hover needs a mouse');
    const skills = page.getByRole('heading', { name: 'Skills' });

    await home.toolbar.inspectToggle.click();
    await skills.hover();
    await expect(home.toolbar.inspector).toContainText("page.getByRole('heading', { name: 'Skills' })");

    await home.toolbar.selectFramework('Cypress');
    await skills.hover();
    await expect(home.toolbar.inspector).toContainText("cy.contains('h2', 'Skills')");

    await home.toolbar.selectFramework('Selenium');
    await skills.hover();
    await expect(home.toolbar.inspector).toContainText(`By.xpath("//h2[normalize-space()='Skills']")`);
  });

  test('clicking copies the locator instead of navigating', async ({ home, page }) => {
    await home.toolbar.inspectToggle.click();
    await page.getByRole('link', { name: 'See my work' }).click();

    await expect(home.toolbar.inspector).toContainText('Copied!');
    await expect(page).not.toHaveURL(/#work/);
    expect(await clipboard(page)).toBe("page.getByRole('link', { name: 'See my work' })");
  });

  test('Escape leaves inspect mode', async ({ home, page }) => {
    await home.toolbar.inspectToggle.click();
    await expect(home.toolbar.inspectToggle).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Escape');
    await expect(home.toolbar.inspectToggle).toHaveAttribute('aria-pressed', 'false');
    await expect(home.toolbar.inspector).toBeHidden();
  });
});

function clipboard(page: Page) {
  return page.evaluate(() => navigator.clipboard.readText());
}
