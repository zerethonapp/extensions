import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classify } from '../src/lib/classifier.js';
import {
  DESTINATIONS, MAX_PREFILL_BYTES, QR_MAX_BYTES, SMART_MENU_ID,
  buildToolUrl, encodeBase64Url, resolveMenuClick, suggest,
} from '../src/lib/router.js';
import { REGISTRY } from '../src/lib/tools-registry.js';

// The decoders on tools.zerethon.com (app.js zrDecodePrefill) and in the IDE (handoff.js).
const decode = (b64) => {
  let s = b64.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return new TextDecoder().decode(Uint8Array.from(atob(s), (c) => c.charCodeAt(0)));
};
const fragmentOf = (url) => new URLSearchParams(new URL(url).hash.slice(1));
const smart = (text) => resolveMenuClick(SMART_MENU_ID, text);

test('Suggested action per content type', () => {
  const cases = [
    ['https://example.com/a?b=1', 'zt-qr', 'url'],
    ['name@example.com', 'zt-qr', 'email'],
    ['+84905123456', 'zt-qr', 'phone'],
    ['Xin chào thế giới', 'zt-qr', 'text'],
    ['{"a":1}', 'zt-json'],
    ['SGVsbG8sIFplcmV0aG9uIQ==', 'zt-b64dec'],
    ['<?php\necho "hi";\n$x = 1;', 'zt-ide'],
    ['<!DOCTYPE html>\n<html><body><p>x</p></body></html>', 'zt-html'],
  ];
  for (const [text, id, qrMode] of cases) {
    const { dest, url } = smart(text);
    assert.equal(dest.id, id, text);
    if (qrMode) assert.equal(fragmentOf(url).get('mode'), qrMode, text);
  }
});

test('Selected text travels in the fragment, never in the query string', () => {
  const text = 'Mã QR cho quán cà phê ☕ — https://example.com/?a=1&b=2';
  const url = new URL(buildToolUrl('qr-code-generator', text, { mode: 'text' }, 'ctx'));
  assert.equal(url.origin + url.pathname, 'https://tools.zerethon.com/qr-code-generator');
  assert.equal(url.search, '?ref=ext&src=ctx');
  assert.equal(decode(fragmentOf(url.href).get('input')), text);
  assert.ok(!url.search.includes(encodeBase64Url(text)));
});

test('Open in IDE sends the detected language, or auto', () => {
  const py = new URL(smart('def add(a, b):\n    return a + b\n\nprint(add(1, 2))').url);
  assert.equal(py.origin, 'https://ide.zerethon.com');
  assert.equal(py.search, '');
  assert.equal(fragmentOf(py.href).get('language'), 'python');
  assert.equal(decode(fragmentOf(py.href).get('code')), 'def add(a, b):\n    return a + b\n\nprint(add(1, 2))');

  const unsure = resolveMenuClick('zt-ide', 'x = foo(y);\nz = bar(x);\nreturn z;');
  assert.equal(fragmentOf(unsure.url).get('language'), 'auto');
  // Manual "Open in IDE" on plain text still works: auto.
  assert.equal(fragmentOf(resolveMenuClick('zt-ide', 'hello').url).get('language'), 'auto');
});

test('Manual Create QR Code picks the mode from the content', () => {
  assert.equal(fragmentOf(resolveMenuClick('zt-qr', 'www.example.com').url).get('mode'), 'url');
  assert.equal(fragmentOf(resolveMenuClick('zt-qr', '{"a":1}').url).get('mode'), 'text');
});

test('Existing manual entries keep their tools and modes', () => {
  assert.equal(fragmentOf(resolveMenuClick('zt-b64dec', 'abc').url).get('mode'), 'decode');
  assert.equal(fragmentOf(resolveMenuClick('zt-b64enc', 'abc').url).get('mode'), 'encode');
  assert.match(resolveMenuClick('zt-hash', 'abc').url, /\/hash-generator\?/);
  assert.match(resolveMenuClick('zt-case', 'abc').url, /\/text-case-converter\?/);
  assert.match(resolveMenuClick('zt-url', 'abc').url, /\/url-parser\?/);
  assert.equal(resolveMenuClick('zt-all', 'abc').url, 'https://tools.zerethon.com/?ref=ext&src=ctx');
  assert.equal(resolveMenuClick('zt-nope', 'abc'), null);
});

test('Oversized selections are flagged, never truncated', () => {
  const big = 'a'.repeat(MAX_PREFILL_BYTES + 1);
  const frag = fragmentOf(resolveMenuClick('zt-json', big).url);
  assert.equal(frag.get('input'), null);
  assert.equal(frag.get('prefill'), 'too_large');
  // Long plain text cannot fit a QR code: the suggestion falls back to All Tools.
  assert.equal(suggest(classify('word '.repeat(QR_MAX_BYTES)), 'word '.repeat(QR_MAX_BYTES)).id, 'zt-all');
});

test('Large Unicode payloads round-trip exactly', () => {
  const text = 'Tiếng Việt 🇻🇳 '.repeat(4000); // ~80 KB of UTF-8
  assert.equal(decode(encodeBase64Url(text)), text);
});

test('Every tool destination exists in the tool registry', () => {
  for (const d of DESTINATIONS.filter((x) => x.kind === 'tool')) {
    assert.ok(REGISTRY.some((t) => t.slug === d.slug), d.slug);
  }
  const ids = DESTINATIONS.map((d) => d.id);
  assert.equal(new Set(ids).size, ids.length, 'duplicate menu ids');
});
