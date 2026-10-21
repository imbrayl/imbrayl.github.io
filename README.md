# Bryle Lim — QA Analyst Portfolio

**Live:** https://imbrayl.github.io (after first deploy)

A portfolio that rewrites itself in **Playwright, Cypress or Selenium** syntax, lets visitors **inspect any element's locator**, and is covered by its own **Playwright + TypeScript + Page Object Model** suite. GitHub Actions deploys only when every test passes.

Built by applying Anthropic's **4D AI Fluency framework** (Claude Academy).

---

## Features

| Feature | What it shows |
|---|---|
| **Framework switcher** (dock at the bottom) | Section labels, assertions and the hero spec re-render in Playwright (TS), Cypress (JS) or Selenium (Java). Shareable via `?fw=cypress`. |
| **Locator inspect mode** | Hover/tap any heading, link or button to see its locator in the active framework; click to copy. |
| **Live snippets** | The Playwright assertions shown on the page are executed against it in CI. |
| **Live CI badge** | The hero shows the real pass count and links to the published Playwright HTML report at `/report`. |
| **No-drift checks** | Code excerpts on the page must match the real files in `tests/`. |

## Project structure

```
site/                  ← deployed as-is (no build step)
  index.html  styles.css
  js/app.js            framework switcher, theme, tabs, CI badge
  js/snippets.js       every snippet in all three frameworks
  js/inspector.js      locator inspect mode
  js/highlight.js      tiny syntax highlighter
  ci/summary.json      overwritten by CI with live results
tests/                 Playwright + TypeScript + POM
  fixtures.ts          `home` fixture + auto-fail on console errors
  pages/               HomePage + section components
  specs/               accessibility, content, framework-switcher, inspect-mode, layout, recruiter
scripts/serve.mjs      zero-dependency static server
scripts/ci-summary.mjs JSON report → site/ci/summary.json
.github/workflows/deploy.yml   test → deploy to GitHub Pages
```

## Running locally

```bash
npm install
npx playwright install chromium
npm start            # http://localhost:4173
npm test             # desktop Chrome + emulated Pixel 7
npm run typecheck
npm run report       # open the last HTML report
```

## Deploying (GitHub Pages, free)

1. On your **personal** GitHub account (`imbrayl`), create a **public** repo named exactly `imbrayl.github.io`.
2. Push this folder:
   ```bash
   git init -b main
   git add .
   git commit -m "Initial portfolio"
   git remote add origin https://github.com/imbrayl/imbrayl.github.io.git
   git push -u origin main
   ```
3. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Every push to `main` runs the tests; the site deploys only if they all pass.

---

## The 4D brief

### 1. Delegation — who does what
| Task | Owner |
|---|---|
| Design, code, test suite, CI pipeline | AI (Claude Code), reviewed by Bryle |
| Every fact and claim: bio, bullets, skills status, case studies, training | **Bryle** |
| Approving wording before it goes in | **Bryle** |
| Publishing | **Bryle** |

### 2. Description — the product
- **Audience:** recruiters (30-second skim) and QA/engineering leads (dig into how I test).
- **Concept:** one page, three frameworks. Code is the *skin*; content stays plain English.
- **Constraints:** static, no build step, free hosting, WCAG 2.1 AA, works on a 320px phone.

### 3. Discernment — how quality is judged
Automated (`npm test`): axe-core in light/dark × 3 frameworks, every inspector locator resolves to exactly its element, shown assertions pass, excerpts match source, no horizontal scroll at 320px, no console errors in any test, keyboard support for tabs, switcher and skip link.

Human review (tests can't judge these):
- [ ] Does the hero tell a recruiter what I do in one glance?
- [ ] Is every claim true and explainable in an interview?
- [ ] Are skills marked honestly (real projects / training / learning)?
- [ ] Do the sample artifacts contain zero employer or client data?

### 4. Diligence — responsibility
- **No fabrication.** Content placeholders are `[[double brackets]]`; the `no placeholders left` test blocks deployment until all are replaced with approved wording.
- **Honest status.** Skills are labelled *used on real projects*, *hands-on training* or *currently learning*.
- **Confidentiality.** Nothing from Vértere client work appears here; sample artifacts are fictional.
- **Transparency.** Built with AI assistance (Claude Code); content and expertise are mine.
- **Ownership.** I can explain every line of the test suite.
