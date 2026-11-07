// Builds the page stylesheets from the approved reference site's own CSS (legacy/, see snapshot-reference.mjs).
//
// The reference loads a different set of CSS files on each page type, plus a large page-specific <style>
// block, and the same class names (.header, .why-section, .faq-section…) are styled differently from page to
// page. To reproduce each page faithfully, every bundle is the exact cascade one reference page uses, with:
//   - every selector scoped under a wrapper class (.ref-<bundle>), html/body/:root mapped onto the wrapper;
//   - @import inlined, keyframes renamed per bundle, Font Awesome dropped (icons are inline SVG);
//   - font names mapped to the next/font variables, marble backgrounds pointed at local assets;
//   - rules whose classes/ids never occur in that page's HTML or scripts removed.
// Output: styles/ref/<bundle>.css (imported by the page that renders <div class="ref-<bundle>">).
// Usage: node scripts/build-ref-styles.mjs
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const LEGACY = path.join(ROOT, 'legacy');
const OUT = path.join(ROOT, 'styles', 'ref');

/** bundle name -> reference page whose cascade it reproduces (+ pages sharing it, for class harvesting). */
const BUNDLES = {
  home: ['index'],
  about: ['about'],
  projects: ['projects'],
  contact: ['contact'],
  'thank-you': ['thank-you'],
  landscaping: ['landscaping'],
  'flooring-executions': ['flooring-executions'],
  'stone-art-installations': ['stone-art-installations'],
  installations: ['installations'],
  // Every product, hub and overview page links the same files and has no inline CSS.
  product: fs
    .readdirSync(LEGACY)
    .filter((f) => f.endsWith('.html'))
    .map((f) => f.replace('.html', ''))
    .filter((p) => {
      const s = fs.readFileSync(path.join(LEGACY, `${p}.html`), 'utf8');
      return s.includes('class="product-grid-section"') || s.includes('class="products-page');
    }),
};

const read = (p) => fs.readFileSync(path.join(LEGACY, p), 'utf8');

// ---------- collect a page's cascade in document order ----------
function cascade(page) {
  const html = read(`${page}.html`);
  const parts = [];
  for (const m of html.matchAll(
    /<link[^>]+href=["']([^"']+\.css)(?:\?[^"']*)?["'][^>]*>|<style[^>]*>([\s\S]*?)<\/style>/g,
  )) {
    if (m[1]) {
      if (/font-awesome|fonts\.googleapis/.test(m[1])) continue;
      const file = m[1].replace(/^\//, '');
      parts.push(inlineImports(read(file), path.dirname(file)));
    } else parts.push(inlineImports(m[2], 'css'));
  }
  return parts.join('\n');
}
function inlineImports(css, dir) {
  return css.replace(/@import\s+(?:url\()?["']([^"')]+)["']\)?[^;]*;/g, (_, f) => {
    if (/^https?:/.test(f)) return '';
    const p = path.posix.join(dir, f.replace(/\?.*$/, ''));
    return inlineImports(read(p), path.posix.dirname(p));
  });
}

// ---------- class / id tokens a page can produce (HTML + every script it runs) ----------
function tokens(pages) {
  const set = new Set();
  const add = (s) => s.split(/\s+/).forEach((t) => t && set.add(t));
  for (const page of pages) {
    const html = read(`${page}.html`);
    for (const m of html.matchAll(/\b(?:class|id)=["']([^"']+)["']/g)) add(m[1]);
    const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    for (const m of html.matchAll(/<script[^>]+src=["']([^"'?]+)/g))
      if (!/^https?:/.test(m[1])) scripts.push(read(m[1].replace(/^\//, '')));
    // Any word in a script string may become a class (classList.add('open'), `nav-${x}` prefixes…).
    for (const js of scripts) for (const m of js.matchAll(/[A-Za-z_][\w-]*/g)) set.add(m[0]);
  }
  return set;
}

// ---------- minimal CSS parser (comments, strings, nested at-rules) ----------
function parse(css) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  let i = 0;
  function block() {
    const nodes = [];
    while (i < css.length) {
      while (/\s/.test(css[i] ?? '')) i++;
      if (i >= css.length || css[i] === '}') {
        i++;
        return nodes;
      }
      let start = i;
      let depth = 0;
      let quote = null;
      while (i < css.length) {
        const c = css[i];
        if (quote) {
          if (c === '\\') i++;
          else if (c === quote) quote = null;
        } else if (c === '"' || c === "'") quote = c;
        else if (c === '(') depth++;
        else if (c === ')') depth--;
        else if (depth === 0 && (c === '{' || c === ';' || c === '}')) break;
        i++;
      }
      const head = css.slice(start, i).trim();
      if (css[i] === ';') {
        i++;
        if (head) nodes.push({ type: 'stmt', text: head });
        continue;
      }
      if (css[i] === '}') continue; // stray declaration outside a rule
      i++; // '{'
      if (/^@(media|supports|container|layer)\b/i.test(head))
        nodes.push({ type: 'group', head, nodes: block() });
      else if (head.startsWith('@')) nodes.push({ type: 'raw', head, body: rawBody() });
      else nodes.push({ type: 'rule', selector: head, body: rawBody() });
    }
    return nodes;
  }
  function rawBody() {
    let depth = 1;
    let quote = null;
    const start = i;
    while (i < css.length) {
      const c = css[i];
      if (quote) {
        if (c === '\\') i++;
        else if (c === quote) quote = null;
      } else if (c === '"' || c === "'") quote = c;
      else if (c === '{') depth++;
      else if (c === '}' && --depth === 0) break;
      i++;
    }
    const body = css.slice(start, i);
    i++;
    return body.trim();
  }
  return block();
}

const splitSelectors = (s) => {
  const out = [];
  let depth = 0;
  let cur = '';
  for (const c of s) {
    if (c === '(' || c === '[') depth++;
    if (c === ')' || c === ']') depth--;
    if (c === ',' && depth === 0) {
      out.push(cur.trim());
      cur = '';
    } else cur += c;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
};

// Leading html/:root and body compounds (with their qualifiers) fold onto the wrapper:
// `html:not(.more) body.page-home .x` -> `.ref-home:not(.more).page-home .x`.
const QUAL = String.raw`((?:[.#:[](?:\([^)]*\)|[^\s>+~(])*)*)`;
const HTML_RE = new RegExp(String.raw`^(?:html|:root)${QUAL}(?=$|[\s>+~])`);
const BODY_RE = new RegExp(String.raw`^body${QUAL}(?=$|[\s>+~])`);
// Specificity is preserved exactly: the scope is `:where(.ref-x)` (adds nothing) and a folded html/body
// becomes the wrapper <div> with the same element weight (`div`, or `div:is(div)` for html+body), so
// rule precedence between reference rules is unchanged.
function scope(sel, W) {
  if (/^::-webkit-scrollbar/.test(sel)) return sel; // the page scrollbar, same on every page
  let rest = sel;
  let quals = '';
  let elements = 0;
  const h = rest.match(HTML_RE);
  if (h) {
    quals += h[1];
    rest = rest.slice(h[0].length).replace(/^\s*>?\s*/, '');
    elements++;
  }
  const b = rest.match(BODY_RE);
  if (b) {
    quals += b[1];
    rest = rest.slice(b[0].length);
    elements++;
  }
  if (!elements) return `${W} ${sel}`;
  const root = `div${':is(div)'.repeat(elements - 1)}${W}${quals}`;
  rest = rest.trim();
  return rest ? `${root} ${rest}` : root;
}

function usable(sel, tok) {
  // Inside :not() a missing class never prevents a match; inside :is()/:where() one present alternative is
  // enough — keep those lists whole when any alternative can match, and judge the rest of the selector.
  for (const m of sel.matchAll(/:(?:is|where)\(([^()]*)\)/g))
    if (!m[1].split(',').some((alt) => usable(alt.trim(), tok))) return false;
  const s = sel.replace(/:(?:not|is|where|has)\([^()]*\)/g, '');
  for (const m of s.matchAll(/[.#](-?[_a-zA-Z][\w-]*)/g)) if (!tok.has(m[1])) return false;
  return true;
}

function emit(nodes, ctx, indent = '') {
  let out = '';
  for (const n of nodes) {
    if (n.type === 'stmt') {
      if (!/^@(import|charset)/i.test(n.text)) out += `${indent}${n.text};\n`;
    } else if (n.type === 'group') {
      const inner = emit(n.nodes, ctx, indent + '  ');
      if (inner.trim()) out += `${indent}${n.head} {\n${inner}${indent}}\n`;
    } else if (n.type === 'raw') {
      if (/^@keyframes/i.test(n.head)) {
        const name = n.head.split(/\s+/)[1];
        out += `${indent}@keyframes ${ctx.bundle}--${name} {${n.body}}\n`;
      } else if (/^@font-face/i.test(n.head)) {
        if (!/Font Awesome/i.test(n.body)) out += `${indent}${n.head} {${n.body}}\n`;
      } else out += `${indent}${n.head} {${n.body}}\n`;
    } else {
      const sels = splitSelectors(n.selector).filter((s) => usable(s, ctx.tok));
      if (!sels.length || /Font Awesome/i.test(n.body)) continue;
      out += `${indent}${sels.map((s) => scope(s, ctx.W)).join(',\n' + indent)} {${rewriteBody(n.body, ctx)}}\n`;
    }
  }
  return out;
}

function rewriteBody(body, ctx) {
  return (
    body
      // Lightning CSS (Next's minifier) folds `backdrop-filter` + `-webkit-backdrop-filter` into the prefixed
      // form only, which Chromium ignores. Keep the standard property; the minifier adds prefixes as needed.
      .replace(/-webkit-backdrop-filter\s*:[^;}]*;?/g, '')
      .replace(/'Playfair Display'|"Playfair Display"/g, 'var(--font-playfair)')
      .replace(/'Poppins'|"Poppins"/g, 'var(--font-poppins)')
      .replace(
        /url\(["']?(?:\.\.\/)?images\/(marble-bg-[\w-]+)\.jpg["']?\)/g,
        (_, f) => `url('./assets/${f}.webp')`,
      )
      .replace(
        /\b(animation(?:-name)?\s*:\s*)([^;}]+)/g,
        (_, prop, val) =>
          prop + val.replace(/[A-Za-z_][\w-]*/g, (w) => (ctx.keyframes.has(w) ? `${ctx.bundle}--${w}` : w)),
      )
  );
}

fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
const report = [];
for (const [bundle, pages] of Object.entries(BUNDLES)) {
  const source = cascade(pages[0]);
  const tree = parse(source);
  const keyframes = new Set([...source.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]));
  const ctx = { bundle, W: `:where(.ref-${bundle})`, tok: tokens(pages), keyframes };
  const css =
    `/* GENERATED by scripts/build-ref-styles.mjs from the reference page(s): ${pages.slice(0, 6).join(', ')}${pages.length > 6 ? '…' : ''}.\n   Do not edit by hand — change the generator or the reference snapshot. */\n` +
    emit(tree, ctx);
  fs.writeFileSync(path.join(OUT, `${bundle}.css`), css);
  report.push(
    `${bundle}: ${pages.length} page(s), ${(source.length / 1024).toFixed(0)} KB in -> ${(css.length / 1024).toFixed(0)} KB out`,
  );
}

// Marble backgrounds referenced by the CSS, re-encoded as WebP (same pixels, ~half the bytes).
const sharp = (await import('sharp')).default;
for (const f of ['marble-bg-nero', 'marble-bg-mobile']) {
  await sharp(path.join(LEGACY, 'images', `${f}.jpg`))
    .webp({ quality: 78 })
    .toFile(path.join(OUT, 'assets', `${f}.webp`));
}
console.log(report.join('\n'));
