import { type Page } from '@playwright/test';
import { NavBar } from './components/NavBar';
import { Toolbar } from './components/Toolbar';
import { HeroSection } from './components/HeroSection';
import { ContactSection } from './components/ContactSection';

export class HomePage {
  readonly nav: NavBar;
  readonly toolbar: Toolbar;
  readonly hero: HeroSection;
  readonly contact: ContactSection;

  constructor(readonly page: Page) {
    this.nav = new NavBar(page);
    this.toolbar = new Toolbar(page);
    this.hero = new HeroSection(page);
    this.contact = new ContactSection(page);
  }

  async goto(query = '') {
    await this.page.goto(`/${query}`);
  }
}
