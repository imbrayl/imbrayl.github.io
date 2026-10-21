// Everything that changes when the visitor switches framework.
// The Playwright versions are executed against this page by tests/specs/content.spec.ts.

export const FRAMEWORKS = {
  playwright: { label: 'Playwright', lang: 'ts', brandExt: '.spec.ts', specFile: 'recruiter.spec.ts' },
  cypress: { label: 'Cypress', lang: 'js', brandExt: '.cy.js', specFile: 'recruiter.cy.js' },
  selenium: { label: 'Selenium', lang: 'java', brandExt: 'Test.java', specFile: 'RecruiterTest.java' },
};

const js = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const java = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

function words(s) {
  return s
    .normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/@/g, ' at ')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
}
const pascal = (s) => words(s).map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join('');
const camel = (s) => { const p = pascal(s); return p[0].toLowerCase() + p.slice(1); };

export const labels = {
  open: {
    playwright: (name) => `test.describe('${js(name)}', () => {`,
    cypress: (name) => `describe('${js(name)}', () => {`,
    selenium: (name) => `@Nested @DisplayName("${java(name)}") class ${pascal(name)}Test {`,
  },
  close: {
    playwright: () => '});',
    cypress: () => '});',
    selenium: () => '}',
  },
  step: {
    playwright: (name) => `await test.step('${js(name)}', async () => {`,
    cypress: (name) => `it('${js(name)}', () => {`,
    selenium: (name) => `@Test void ${camel(name)}() {`,
  },
};

export const assertions = {
  heroName: {
    playwright: `await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bryle Elys N. Lim');`,
    cypress: `cy.get('h1').should('have.text', 'Bryle Elys N. Lim');`,
    selenium: `assertEquals("Bryle Elys N. Lim", driver.findElement(By.tagName("h1")).getText());`,
  },
  contactEmail: {
    playwright: `await expect(page.getByRole('link', { name: 'Email me' })).toHaveAttribute('href', /^mailto:/);`,
    cypress: `cy.contains('a', 'Email me').should('have.attr', 'href').and('match', /^mailto:/);`,
    selenium: `assertTrue(driver.findElement(By.linkText("Email me")).getAttribute("href").startsWith("mailto:"));`,
  },
};

// The Playwright version must stay identical to tests/specs/recruiter.spec.ts (checked in CI).
export const heroSpec = {
  playwright: `import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test('recruiter can reach contact', async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();
  await home.nav.goTo('Contact');
  await expect(home.contact.emailLink).toBeInViewport();
});`,
  cypress: `import { HomePage } from '../pages/HomePage';

describe('portfolio', () => {
  it('recruiter can reach contact', () => {
    const home = new HomePage();
    home.visit();
    home.nav.goTo('Contact');
    home.contact.emailLink().should('be.visible');
  });
});`,
  selenium: `class RecruiterTest extends BaseTest {

    @Test
    void recruiterCanReachContact() {
        HomePage home = new HomePage(driver);
        home.open();
        home.nav().goTo("Contact");
        assertTrue(home.contact().emailLink().isDisplayed());
    }
}`,
};
