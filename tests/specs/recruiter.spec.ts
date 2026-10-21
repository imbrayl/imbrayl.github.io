import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test('recruiter can reach contact', async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();
  await home.nav.goTo('Contact');
  await expect(home.contact.emailLink).toBeInViewport();
});
