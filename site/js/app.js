import { FRAMEWORKS, labels, assertions, heroSpec } from './snippets.js';
import { highlight } from './highlight.js';
import { INSPECTABLE, initInspector, locatorFor } from './inspector.js';

const root = document.documentElement;
const store = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* private mode */ } },
};

const currentFw = () => (root.dataset.fw in FRAMEWORKS ? root.dataset.fw : 'playwright');

// ---------- Framework switcher ----------

const asLines = (html) =>
  html.split('\n').map((line, i) => `<span class="line" style="--i:${i}">${line || ' '}</span>`).join('');

function renderFramework(fw) {
  const { lang, brandExt, specFile } = FRAMEWORKS[fw];
  root.dataset.fw = fw;

  document.querySelectorAll('[data-open]').forEach((el) => {
    el.innerHTML = highlight(labels.open[fw](el.dataset.open), lang);
  });
  document.querySelectorAll('[data-close]').forEach((el) => {
    el.innerHTML = highlight(labels.close[fw](), lang);
  });
  document.querySelectorAll('[data-step]').forEach((el) => {
    el.innerHTML = highlight(labels.step[fw](el.dataset.step), lang);
  });
  document.querySelectorAll('[data-assert]').forEach((el) => {
    el.innerHTML = `<span class="assert-mark">✓</span> ${highlight(assertions[el.dataset.assert][fw], lang)}`;
  });

  document.querySelector('[data-brand-ext]').textContent = brandExt;
  document.querySelector('[data-testid="spec-file"]').textContent = specFile;
  const code = document.querySelector('[data-testid="spec-code"]');
  code.innerHTML = asLines(highlight(heroSpec[fw], lang));
  code.classList.remove('typing');
  void code.offsetWidth; // restart the line-by-line reveal
  code.classList.add('typing');

  document.querySelectorAll('[data-fw-option]').forEach((btn) => {
    const on = btn.dataset.fwOption === fw;
    btn.setAttribute('aria-checked', String(on));
    btn.tabIndex = on ? 0 : -1;
  });

  renderCi();
}

function selectFramework(fw) {
  store.set('fw', fw);
  const url = new URL(location.href);
  url.searchParams.set('fw', fw);
  history.replaceState(null, '', url);
  renderFramework(fw);
  inspector.refresh();
}

const options = [...document.querySelectorAll('[data-fw-option]')];
options.forEach((btn, i) => {
  btn.addEventListener('click', () => selectFramework(btn.dataset.fwOption));
  btn.addEventListener('keydown', (e) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = options[(i + step + options.length) % options.length];
    next.focus();
    selectFramework(next.dataset.fwOption);
  });
});

// ---------- Live CI status (site/ci/summary.json is written by the deploy workflow) ----------

let ci = null;

function renderCi() {
  const el = document.querySelector('[data-testid="ci-status"]');
  const text = el.querySelector('.ci-text');
  const portNote = currentFw() === 'playwright' ? '' : ' · Cypress & Selenium ports in progress';

  if (!ci || ci.status === 'pending') {
    el.dataset.state = 'pending';
    text.textContent = `Live CI results appear here after the first deploy${portNote}`;
    return;
  }
  const date = new Date(ci.finishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  el.dataset.state = ci.status;
  text.innerHTML =
    `<strong>${ci.passed} Playwright tests passed</strong> · ${(ci.durationMs / 1000).toFixed(1)}s · ${date}` +
    ` · <a href="report/index.html">View report</a>${portNote}`;
}

fetch('ci/summary.json', { cache: 'no-store' })
  .then((r) => (r.ok ? r.json() : null))
  .then((data) => { ci = data; renderCi(); })
  .catch(() => renderCi());

// ---------- Theme ----------

document.querySelector('.theme-toggle').addEventListener('click', () => {
  const dark = root.dataset.theme
    ? root.dataset.theme === 'dark'
    : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  store.set('theme', root.dataset.theme);
});

// ---------- Mobile menu ----------

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('primary-nav');

function setMenu(open) {
  nav.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}
menuToggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });

// ---------- Artifact tabs (WAI-ARIA tabs pattern) ----------

document.querySelectorAll('[data-tabs]').forEach((tabsEl) => {
  const tabs = [...tabsEl.querySelectorAll('[role="tab"]')];
  const select = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    tab.focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      const target = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (target === undefined) return;
      e.preventDefault();
      select(tabs[(target + tabs.length) % tabs.length]);
    });
  });
});

// ---------- Static snippets & boot ----------

document.querySelectorAll('code[data-lang]').forEach((el) => {
  el.innerHTML = highlight(el.textContent, el.dataset.lang);
});
document.querySelector('[data-year]').textContent = new Date().getFullYear();

const inspector = initInspector(currentFw);
renderFramework(currentFw());

// Test hooks used by the Playwright suite
window.portfolio = { INSPECTABLE, locatorFor, assertions, heroSpec, framework: currentFw };
