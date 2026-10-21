// Prints resume/resume.html to PDF with Playwright's Chromium.
//   site/Bryle-Lim-Resume.pdf          public copy served by the site (no phone number)
//   resume/out/Bryle-Lim-Resume.pdf    private copy with the phone number from resume/private.json
import { chromium } from '@playwright/test';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const source = pathToFileURL(resolve('resume/resume.html')).href;
const privateFile = resolve('resume/private.json');
const secrets = existsSync(privateFile) ? JSON.parse(readFileSync(privateFile, 'utf8')) : {};

async function build(page, output, fields) {
  await page.goto(source);
  await page.evaluate((fields) => {
    document.querySelectorAll('[data-private]').forEach((el) => {
      const value = fields[el.dataset.private];
      if (value) el.textContent = value;
      else el.remove();
    });
  }, fields);
  await page.pdf({ path: output, format: 'Letter', printBackground: true, preferCSSPageSize: true });
  console.log(`Wrote ${output}`);
}

const browser = await chromium.launch();
const page = await browser.newPage();
await build(page, 'site/Bryle-Lim-Resume.pdf', {});
if (Object.keys(secrets).length) {
  mkdirSync('resume/out', { recursive: true });
  await build(page, 'resume/out/Bryle-Lim-Resume.pdf', secrets);
}
await browser.close();
