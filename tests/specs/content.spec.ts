import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from '../fixtures';

const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
const read = (path: string) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n').trim();

function listFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? listFiles(full) : [full.replace(/\\/g, '/')];
  });
}

test.describe('content', () => {
  test('every Playwright assertion shown on the page passes', async ({ home, page }) => {
    void home;
    const keys = await page.locator('[data-assert]').evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.assert!));
    expect(keys.length).toBeGreaterThan(0);
    for (const key of keys) {
      const source = await page.evaluate((k) => window.portfolio.assertions[k].playwright, key);
      await test.step(source, () => new AsyncFunction('page', 'expect', source)(page, expect));
    }
  });

  test('hero spec matches tests/specs/recruiter.spec.ts', async ({ home, page }) => {
    void home;
    const shown = await page.evaluate(() => window.portfolio.heroSpec.playwright);
    expect(shown).toBe(read('tests/specs/recruiter.spec.ts'));
  });

  test('POM excerpt matches tests/pages/HomePage.ts', async ({ home, page }) => {
    void home;
    const shown = await page.getByTestId('pom-excerpt').textContent();
    expect(shown!.trim()).toBe(read('tests/pages/HomePage.ts'));
  });

  test('folder tree matches the tests/ directory', async ({ home, page }) => {
    void home;
    const lines = (await page.getByTestId('test-tree').textContent())!.split('\n');
    const stack: string[] = [];
    const shown: string[] = [];
    for (const line of lines) {
      const name = line.replace(/^[│├└─\s]+/, '');
      const depth = (line.length - name.length) / 4;
      stack.length = depth;
      stack.push(name.replace(/\/$/, ''));
      if (!name.endsWith('/')) shown.push(stack.join('/'));
    }
    expect(shown.sort()).toEqual(listFiles('tests').sort());
  });

  test('external links open safely and email is valid', async ({ home, page }) => {
    for (const link of await page.locator('a[target="_blank"]').all()) {
      await expect(link).toHaveAttribute('rel', /noopener/);
    }
    await expect(home.contact.emailLink).toHaveAttribute('href', /^mailto:[^\s@[\]]+@[^\s@[\]]+\.[a-z]{2,}$/i);
  });

  test('résumé download serves a PDF', async ({ home, page }) => {
    void home;
    const href = await page.getByRole('link', { name: 'Download résumé' }).getAttribute('href');
    const response = await page.request.get(href!);
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('application/pdf');
  });

  test('résumé and site agree on key facts', async ({ home, page }) => {
    void home;
    const resume = read('resume/resume.html');
    const site = (await page.locator('main').textContent())!;
    for (const fact of ['500+ test cases', 'Jun 2026 – Present', 'Nov 2025 – Mar 2026', 'Vértere Global Solutions', 'ieeexplore.ieee.org/document/10913257']) {
      expect(resume, `résumé mentions ${fact}`).toContain(fact);
      expect(site + (await page.content()), `site mentions ${fact}`).toContain(fact);
    }
  });

  test('profile photo loads', async ({ home, page }) => {
    void home;
    const photo = page.getByRole('img', { name: 'Bryle Elys N. Lim' });
    await expect(photo).toBeVisible();
    expect(await photo.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  });

  // Fails on purpose until every [[placeholder]] is replaced with approved content.
  test('no placeholders left', async ({ home, page }) => {
    void home;
    const found = [...new Set((await page.content()).match(/\[\[[^\]]*\]\]/g) ?? [])];
    expect(found, `Replace these placeholders:\n  ${found.join('\n  ')}\n`).toEqual([]);
  });
});
