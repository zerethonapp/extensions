// Pre-submission lint — fails fast on the patterns that get Chrome reviews
// rejected. Run before every zip + submission.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

const CHECKS = [
  ['manifest valid + semver version', checkManifest],
  ['no banned permissions', checkPermissions],
  ['no remote script tags or http:// URLs', checkRemoteCode],
  ['no eval / Function / inline handlers', checkUnsafeCode],
  ['CSP allows neither unsafe-eval nor unsafe-inline', checkCsp],
  ['all icons present at 16/48/128', checkIcons],
  ['en locale has every __MSG_*__ key used by manifest', checkLocaleCoverage],
  ['locales other than en match the en key set', checkLocaleParity],
  ['every BUNDLED_SLUGS entry has a tool page in src/tools/', checkBundledTools],
];

const fails = [];

for (const [name, fn] of CHECKS) {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (e) {
    fails.push(name);
    console.error(`✗ ${name}\n   ${e.message}`);
  }
}

if (fails.length) {
  console.error(`\n${fails.length} check(s) failed. Fix before submitting.`);
  process.exit(1);
}
console.log('\nAll checks passed. Safe to zip and submit.');

// ---------- checks ----------

async function checkManifest() {
  const m = JSON.parse(await fs.readFile(path.join(SRC, 'manifest.json'), 'utf8'));
  if (m.manifest_version !== 3) throw new Error('manifest_version must be 3');
  if (!/^\d+\.\d+\.\d+$/.test(m.version)) throw new Error(`version "${m.version}" is not semver MAJOR.MINOR.PATCH`);
  if (!m.default_locale) throw new Error('default_locale required when using __MSG_*__ keys');
}

async function checkPermissions() {
  const m = JSON.parse(await fs.readFile(path.join(SRC, 'manifest.json'), 'utf8'));
  const banned = ['tabs', 'activeTab', 'scripting', 'webRequest', 'cookies', 'history', 'bookmarks', 'downloads', 'declarativeNetRequest'];
  const offenders = (m.permissions || []).filter((p) => banned.includes(p));
  if (offenders.length) throw new Error(`disallowed permissions: ${offenders.join(', ')}`);
  const hostsAll = (m.host_permissions || []).filter((h) => h === '<all_urls>' || h.includes('://*/*'));
  if (hostsAll.length) throw new Error(`<all_urls> / wildcard host permission disallowed: ${hostsAll.join(', ')}`);
}

async function checkRemoteCode() {
  for await (const f of walk(SRC, ['.js', '.html'])) {
    const text = await fs.readFile(f, 'utf8');
    if (/<script\s+[^>]*src=["']https?:\/\//i.test(text)) {
      throw new Error(`${path.relative(ROOT, f)} loads remote script (banned by MV3)`);
    }
    if (/import\s+[^'"`]+["'`]https?:\/\//.test(text)) {
      throw new Error(`${path.relative(ROOT, f)} imports remote module (banned by MV3)`);
    }
  }
}

async function checkUnsafeCode() {
  for await (const f of walk(SRC, ['.js'])) {
    const text = await fs.readFile(f, 'utf8');
    const stripped = text
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/[^\n]*/g, '');
    if (/\beval\s*\(/.test(stripped)) throw new Error(`${path.relative(ROOT, f)}: eval() found`);
    if (/new\s+Function\s*\(/.test(stripped)) throw new Error(`${path.relative(ROOT, f)}: new Function() found`);
  }
  for await (const f of walk(SRC, ['.html'])) {
    const text = await fs.readFile(f, 'utf8');
    if (/\son[a-z]+\s*=\s*["']/i.test(text)) {
      throw new Error(`${path.relative(ROOT, f)}: inline event handler (onclick=, onload=, …) — banned by CSP`);
    }
    if (/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?[A-Za-z][\s\S]*?<\/script>/i.test(text)) {
      throw new Error(`${path.relative(ROOT, f)}: inline <script> body — banned by CSP`);
    }
  }
}

async function checkCsp() {
  const m = JSON.parse(await fs.readFile(path.join(SRC, 'manifest.json'), 'utf8'));
  const csp = m.content_security_policy?.extension_pages || '';
  if (/unsafe-eval|unsafe-inline/.test(csp)) throw new Error(`CSP must not contain unsafe-eval or unsafe-inline: "${csp}"`);
}

async function checkIcons() {
  for (const size of [16, 48, 128]) {
    const p = path.join(SRC, 'icons', `icon${size}.png`);
    const stat = await fs.stat(p).catch(() => null);
    if (!stat || stat.size === 0) throw new Error(`missing or empty icon: icons/icon${size}.png`);
  }
}

async function checkLocaleCoverage() {
  const enPath = path.join(SRC, '_locales', 'en', 'messages.json');
  const en = JSON.parse(await fs.readFile(enPath, 'utf8'));
  const manifest = await fs.readFile(path.join(SRC, 'manifest.json'), 'utf8');
  const used = new Set(Array.from(manifest.matchAll(/__MSG_([a-zA-Z0-9_]+)__/g), (m) => m[1]));
  const missing = [...used].filter((k) => !en[k]);
  if (missing.length) throw new Error(`en locale missing keys used by manifest: ${missing.join(', ')}`);
}

async function checkLocaleParity() {
  const enPath = path.join(SRC, '_locales', 'en', 'messages.json');
  const en = JSON.parse(await fs.readFile(enPath, 'utf8'));
  const localesDir = path.join(SRC, '_locales');
  const entries = await fs.readdir(localesDir, { withFileTypes: true });
  for (const e of entries) {
    if (!e.isDirectory() || e.name === 'en') continue;
    const other = JSON.parse(await fs.readFile(path.join(localesDir, e.name, 'messages.json'), 'utf8'));
    const missing = Object.keys(en).filter((k) => !other[k]);
    if (missing.length) throw new Error(`locale ${e.name} missing keys: ${missing.join(', ')}`);
  }
}

async function checkBundledTools() {
  // Avoid importing the registry module directly (would execute chrome.* checks etc.).
  // Parse the slug literals out of the file with a regex — good enough since the
  // file is generated and follows a fixed shape.
  const registrySrc = await fs.readFile(path.join(SRC, 'lib/tools-registry.js'), 'utf8');
  const setMatch = registrySrc.match(/BUNDLED_SLUGS\s*=\s*new\s+Set\(\s*\[([^\]]*)\]/);
  if (!setMatch) throw new Error('could not locate BUNDLED_SLUGS in tools-registry.js');
  const slugs = Array.from(setMatch[1].matchAll(/'([a-z0-9-]+)'|"([a-z0-9-]+)"/g), (m) => m[1] || m[2]);
  for (const slug of slugs) {
    const html = path.join(SRC, 'tools', slug, 'index.html');
    const js = path.join(SRC, 'tools', slug, 'tool.js');
    if (!(await fs.stat(html).catch(() => null))) throw new Error(`BUNDLED_SLUGS has "${slug}" but tools/${slug}/index.html is missing`);
    if (!(await fs.stat(js).catch(() => null))) throw new Error(`BUNDLED_SLUGS has "${slug}" but tools/${slug}/tool.js is missing`);
  }
}

async function* walk(dir, exts) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full, exts);
    else if (exts.some((x) => entry.name.endsWith(x))) yield full;
  }
}
