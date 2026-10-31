// Smart Context Router — step 2: map a classification to a destination and build its URL.
// One table (DESTINATIONS) drives both the context menu and the suggested action, so adding
// a tool is one entry here. Only tools that exist on tools.zerethon.com / Zerethon IDE.
//
// Transfer: selected text goes in the URL *fragment* (`#input=<url-safe base64>&mode=…`),
// which browsers never send to a server; only `ref`/`src` attribution stays in the query.
// tools.zerethon.com decodes it in resources/js/app.js (zrDecodePrefill), Zerethon IDE in
// resources/js/ide/handoff.js. Too-large selections are never truncated: the tool opens
// with `#prefill=too_large` and says so.

import { BASE_URL, IDE_URL } from './config.js';
import { classify } from './classifier.js';

export const MAX_PREFILL_BYTES = 100 * 1024;
// Largest payload a QR code can hold (version 40, byte mode, error correction L).
export const QR_MAX_BYTES = 2953;

export const SMART_MENU_ID = 'zt-smart';

/**
 * kind: 'tool' (tools.zerethon.com/<slug>), 'ide' (Zerethon IDE) or 'home' (all tools).
 * menu: shown as a manual context-menu entry (in this order). Entries without `menu`
 * are reachable only as a suggestion. Existing 0.2.0 menu ids are kept.
 */
export const DESTINATIONS = [
  { id: 'zt-qr', kind: 'tool', slug: 'qr-code-generator', titleKey: 'ctx_create_qr', menu: true },
  { id: 'zt-ide', kind: 'ide', titleKey: 'ctx_open_ide', menu: true },
  { id: 'zt-json', kind: 'tool', slug: 'json-formatter', titleKey: 'ctx_format_json', menu: true },
  { id: 'zt-b64enc', kind: 'tool', slug: 'base64-encoder', titleKey: 'ctx_b64_encode', extra: { mode: 'encode' }, menu: true },
  { id: 'zt-b64dec', kind: 'tool', slug: 'base64-encoder', titleKey: 'ctx_b64_decode', extra: { mode: 'decode' }, menu: true },
  { id: 'zt-hash', kind: 'tool', slug: 'hash-generator', titleKey: 'ctx_hash_sha256', menu: true },
  { id: 'zt-case', kind: 'tool', slug: 'text-case-converter', titleKey: 'ctx_case_convert', menu: true },
  { id: 'zt-url', kind: 'tool', slug: 'url-parser', titleKey: 'ctx_parse_url', menu: true },
  { id: 'zt-html', kind: 'tool', slug: 'html-formatter' },
  { id: 'zt-css', kind: 'tool', slug: 'css-formatter' },
  { id: 'zt-csharp', kind: 'tool', slug: 'csharp-formatter' },
  { id: 'zt-all', kind: 'home', titleKey: 'ctx_all_tools', menu: true },
];

// Languages Zerethon IDE can open (and run) — ids from the IDE's config/languages.php.
export const IDE_LANGUAGES = new Set(['python', 'javascript', 'typescript', 'java', 'c', 'cpp', 'php', 'go', 'rust', 'sql', 'bash']);
// Detected languages the IDE has no runtime for, but a tools.zerethon.com formatter handles.
const FORMATTER_FOR = { html: 'zt-html', css: 'zt-css', csharp: 'zt-csharp' };
const QR_MODES = new Set(['url', 'email', 'phone']);

export function destination(id) {
  return DESTINATIONS.find((d) => d.id === id) || null;
}

/** The single suggested destination for a classification. Never null. */
export function suggest(detection, text) {
  switch (detection.type) {
    case 'url':
    case 'email':
    case 'phone':
      return destination('zt-qr');
    case 'json':
      return destination('zt-json');
    case 'base64':
      return destination('zt-b64dec');
    case 'source_code':
      if (detection.language && FORMATTER_FOR[detection.language]) return destination(FORMATTER_FOR[detection.language]);
      return destination('zt-ide'); // known language, or `auto` and the IDE asks
    case 'text':
      return utf8Length(text) <= QR_MAX_BYTES ? destination('zt-qr') : destination('zt-all');
    default:
      return destination('zt-all');
  }
}

/**
 * Where a context-menu click goes: the suggested destination for the smart entry, the
 * chosen one otherwise. Classification also picks the QR mode and IDE language for manual picks.
 */
export function resolveMenuClick(menuId, text) {
  const detection = classify(text);
  const dest = menuId === SMART_MENU_ID ? suggest(detection, text) : destination(menuId);
  if (!dest) return null;
  return { dest, detection, url: urlFor(dest, text, detection) };
}

export function urlFor(dest, text, detection, src = 'ctx') {
  if (dest.kind === 'home') return `${BASE_URL}/?ref=ext&src=${src}`;
  if (dest.kind === 'ide') {
    const language = detection?.type === 'source_code' && IDE_LANGUAGES.has(detection.language) ? detection.language : 'auto';
    return buildIdeUrl(text, language);
  }
  const extra = { ...dest.extra };
  if (dest.slug === 'qr-code-generator') extra.mode = QR_MODES.has(detection?.type) ? detection.type : 'text';
  return buildToolUrl(dest.slug, text, extra, src);
}

export function buildToolUrl(slug, text, extra = {}, src = 'ext') {
  const url = new URL(`${BASE_URL}/${slug}`);
  url.searchParams.set('ref', 'ext');
  url.searchParams.set('src', src);
  url.hash = fragment(text, extra, 'input');
  return url.toString();
}

export function buildIdeUrl(text, language = 'auto') {
  const url = new URL(`${IDE_URL}/`);
  url.hash = fragment(text, { language, source: 'extension' }, 'code');
  return url.toString();
}

function fragment(text, extra, key) {
  const params = new URLSearchParams();
  if (text) {
    if (utf8Length(text) <= MAX_PREFILL_BYTES) params.set(key, encodeBase64Url(text));
    else params.set('prefill', 'too_large');
  }
  for (const [k, v] of Object.entries(extra || {})) params.set(k, String(v));
  const s = params.toString();
  return s ? `#${s}` : '';
}

/** UTF-8 → base64 → URL-safe alphabet, no padding (decoded by the tools site and the IDE). */
export function encodeBase64Url(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function utf8Length(text) {
  return new TextEncoder().encode(String(text ?? '')).byteLength;
}
