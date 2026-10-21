// Tiny syntax highlighter for the three snippet languages. Tokens never span lines,
// so callers can safely split the output on "\n".

const KEYWORDS = {
  ts: ['import', 'from', 'export', 'class', 'const', 'let', 'new', 'async', 'await', 'return', 'readonly', 'type', 'this', 'true', 'false'],
  js: ['import', 'from', 'export', 'class', 'const', 'let', 'new', 'async', 'await', 'return', 'this', 'true', 'false'],
  java: ['class', 'extends', 'void', 'new', 'return', 'public', 'private', 'final', 'this', 'true', 'false'],
};

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const patterns = {};
function patternFor(lang) {
  if (!patterns[lang]) {
    const kw = KEYWORDS[lang].join('|');
    patterns[lang] = new RegExp(
      [
        String.raw`(\/\/[^\n]*)`,                                            // comment
        String.raw`('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|` + '`(?:\\\\.|[^`\\\\\\n])*`)', // string
        String.raw`(\/[^\/\n\s][^\/\n]*\/[gimsuy]*(?=[,)]))`,                // regex literal
        String.raw`(@\w+)`,                                                  // annotation
        String.raw`\b(${kw})\b`,                                             // keyword
        String.raw`\b([A-Z]\w*)\b`,                                          // type
        String.raw`([A-Za-z_$][\w$]*)(?=\()`,                                // function call
      ].join('|'),
      'g',
    );
  }
  return patterns[lang];
}

const CLASSES = [null, 'com', 'str', 're', 'ann', 'kw', 'type', 'fn'];

export function highlight(code, lang) {
  let out = '';
  let last = 0;
  for (const m of code.matchAll(patternFor(lang))) {
    const group = m.findIndex((g, i) => i > 0 && g !== undefined);
    out += escapeHtml(code.slice(last, m.index));
    out += `<span class="tok-${CLASSES[group]}">${escapeHtml(m[0])}</span>`;
    last = m.index + m[0].length;
  }
  return out + escapeHtml(code.slice(last));
}
