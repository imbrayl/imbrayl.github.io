// Locator inspect mode: hover (or tap) any heading, link or button to see how
// you'd locate it in the active framework. Click copies the locator.
import { highlight } from './highlight.js';
import { FRAMEWORKS } from './snippets.js';

export const INSPECTABLE = 'h1, h2, h3, h4, a[href], button, img[alt]';
const PASSTHROUGH = '.dock, .topbar-tools'; // tools keep working while inspecting

const js = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const java = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

function roleOf(el) {
  const explicit = el.getAttribute('role');
  if (explicit) return explicit;
  if (/^H\d$/.test(el.tagName)) return 'heading';
  if (el.tagName === 'IMG') return 'img';
  return el.tagName === 'A' ? 'link' : 'button';
}

function nameOf(el) {
  const label = el.getAttribute('aria-label') ?? (el.tagName === 'IMG' ? el.getAttribute('alt') : null);
  return (label ?? el.textContent).replace(/\s+/g, ' ').trim();
}

// Playwright matches names by substring, so ask for an exact match only when
// another visible element with the same role contains this name.
function needsExact(el, role, name) {
  const lower = name.toLowerCase();
  return [...document.querySelectorAll(INSPECTABLE)].some((other) =>
    other !== el && other.checkVisibility() && roleOf(other) === role &&
    nameOf(other).toLowerCase().includes(lower));
}

export function locatorFor(el, fw) {
  const role = roleOf(el);
  const name = nameOf(el);
  const tag = el.tagName.toLowerCase();
  const labelled = el.hasAttribute('aria-label');

  if (fw === 'playwright') {
    const exact = needsExact(el, role, name) ? ', exact: true' : '';
    return `page.getByRole('${role}', { name: '${js(name)}'${exact} })`;
  }
  if (tag === 'img') {
    return fw === 'cypress'
      ? `cy.get('img[alt="${js(name)}"]')`
      : `driver.findElement(By.cssSelector("img[alt='${java(name)}']"))`;
  }
  if (fw === 'cypress') {
    return labelled
      ? `cy.get('[aria-label="${js(name)}"]')`
      : `cy.contains('${tag}', '${js(name)}')`;
  }
  if (labelled) return `driver.findElement(By.cssSelector("[aria-label='${java(name)}']"))`;
  if (tag === 'a') return `driver.findElement(By.linkText("${java(name)}"))`;
  return `driver.findElement(By.xpath("//${tag}[normalize-space()='${java(name)}']"))`;
}

export function initInspector(getFw) {
  const toggle = document.querySelector('.inspect-toggle');
  const tip = document.createElement('div');
  tip.className = 'inspector';
  tip.dataset.testid = 'inspector';
  tip.setAttribute('role', 'status');
  tip.hidden = true;
  document.body.append(tip);

  let active = false;
  let current = null;

  function targetOf(node) {
    const el = node instanceof Element ? node.closest(INSPECTABLE) : null;
    return el && !el.closest('.inspector') ? el : null;
  }

  function render(hint = 'Click to copy') {
    if (!current) return;
    const fw = getFw();
    tip.innerHTML =
      `<span class="inspector-fw">${FRAMEWORKS[fw].label}</span>` +
      `<code>${highlight(locatorFor(current, fw), FRAMEWORKS[fw].lang)}</code>` +
      `<span class="inspector-hint">${hint}</span>`;
    tip.hidden = false;
    position();
  }

  function position() {
    if (!current) return;
    const r = current.getBoundingClientRect();
    const w = tip.offsetWidth;
    const h = tip.offsetHeight;
    const left = Math.max(8, Math.min(r.left, innerWidth - w - 8));
    const below = r.bottom + 8;
    tip.style.left = `${left}px`;
    tip.style.top = `${below + h > innerHeight - 80 ? Math.max(8, r.top - h - 8) : below}px`;
  }

  function show(el) {
    if (current === el) return;
    current?.classList.remove('inspect-target');
    current = el;
    el.classList.add('inspect-target');
    render();
  }

  function setActive(on) {
    active = on;
    toggle.setAttribute('aria-pressed', String(on));
    document.body.classList.toggle('inspecting', on);
    if (!on) {
      current?.classList.remove('inspect-target');
      current = null;
      tip.hidden = true;
    }
  }

  toggle.addEventListener('click', () => setActive(!active));

  const onPoint = (e) => {
    if (!active) return;
    const el = targetOf(e.target);
    if (el) show(el);
  };
  document.addEventListener('mouseover', onPoint);
  document.addEventListener('focusin', onPoint);

  // Capture phase so links don't navigate and tabs don't switch while inspecting
  document.addEventListener('click', async (e) => {
    if (!active) return;
    const el = targetOf(e.target);
    if (!el || el.closest(PASSTHROUGH)) return;
    e.preventDefault();
    e.stopPropagation();
    current = null;
    show(el);
    try {
      await navigator.clipboard.writeText(locatorFor(el, getFw()));
      render('Copied!');
    } catch {
      render('Select and copy manually');
    }
  }, true);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && active) setActive(false);
  });
  addEventListener('scroll', position, { passive: true });
  addEventListener('resize', position);

  return { refresh: () => render() };
}
