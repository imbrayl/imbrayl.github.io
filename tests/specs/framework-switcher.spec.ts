import { test, expect } from '../fixtures';

const frameworks = [
  { name: 'Playwright', id: 'playwright', file: 'recruiter.spec.ts', marker: 'await expect(' },
  { name: 'Cypress', id: 'cypress', file: 'recruiter.cy.js', marker: "should('be.visible')" },
  { name: 'Selenium', id: 'selenium', file: 'RecruiterTest.java', marker: 'void recruiterCanReachContact()' },
] as const;

test.describe('framework switcher', () => {
  for (const fw of frameworks) {
    test(`${fw.name} rewrites the page in its syntax`, async ({ home, page }) => {
      await home.toolbar.selectFramework(fw.name);

      await expect(home.toolbar.framework(fw.name)).toHaveAttribute('aria-checked', 'true');
      await expect(page.locator('html')).toHaveAttribute('data-fw', fw.id);
      await expect(home.hero.specFile).toHaveText(fw.file);
      await expect(home.hero.specCode).toContainText(fw.marker);
      await expect(page).toHaveURL(new RegExp(`[?&]fw=${fw.id}`));
    });
  }

  test('section labels follow the framework', async ({ home, page }) => {
    const label = page.locator('#skills .code-label').first();
    await expect(label).toHaveText("test.describe('Skills', () => {");
    await home.toolbar.selectFramework('Cypress');
    await expect(label).toHaveText("describe('Skills', () => {");
    await home.toolbar.selectFramework('Selenium');
    await expect(label).toHaveText('@Nested @DisplayName("Skills") class SkillsTest {');
  });

  test('choice survives a reload', async ({ home, page }) => {
    await home.toolbar.selectFramework('Cypress');
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-fw', 'cypress');
    await expect(home.toolbar.framework('Cypress')).toHaveAttribute('aria-checked', 'true');
  });

  test('?fw= deep link opens that framework', async ({ home, page }) => {
    await home.goto('?fw=selenium');
    await expect(page.locator('html')).toHaveAttribute('data-fw', 'selenium');
    await expect(home.hero.specFile).toHaveText('RecruiterTest.java');
  });

  test('unknown ?fw= falls back to Playwright', async ({ home, page }) => {
    await home.goto('?fw=jest');
    await expect(page.locator('html')).toHaveAttribute('data-fw', 'playwright');
  });

  test('arrow keys move between frameworks', async ({ home }) => {
    await home.toolbar.framework('Playwright').focus();
    await home.toolbar.framework('Playwright').press('ArrowRight');
    await expect(home.toolbar.framework('Selenium')).toBeFocused();
    await expect(home.toolbar.framework('Selenium')).toHaveAttribute('aria-checked', 'true');
    await home.toolbar.framework('Selenium').press('ArrowLeft');
    await home.toolbar.framework('Playwright').press('ArrowLeft');
    await expect(home.toolbar.framework('Cypress')).toHaveAttribute('aria-checked', 'true');
  });

  test('switcher order is Playwright, Selenium, Cypress', async ({ home }) => {
    await expect(home.toolbar.frameworkGroup.getByRole('radio')).toHaveText(['Playwright', 'Selenium', 'Cypress']);
  });
});
