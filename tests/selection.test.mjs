import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeSelection, pageSelection, readSelection } from '../src/lib/selection.js';
import { classify } from '../src/lib/classifier.js';
import { SMART_MENU_ID, resolveMenuClick } from '../src/lib/router.js';

const collatz = readFileSync(new URL('./fixtures/collatz.py', import.meta.url), 'utf8');
// What Chrome's info.selectionText gives for the same selection: whitespace collapsed.
const collapsed = collatz.replace(/\s+/g, ' ').trim();

const fakeChrome = (executeScript) => ({ scripting: { executeScript } });
const decodeCode = (url) => {
  let s = new URLSearchParams(new URL(url).hash.slice(1)).get('code').replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return new TextDecoder().decode(Uint8Array.from(atob(s), (c) => c.charCodeAt(0)));
};

test('the real page selection replaces the collapsed selectionText', async () => {
  let target;
  globalThis.chrome = fakeChrome(async (opts) => { target = opts.target; return [{ result: collatz }]; });
  const text = await readSelection({ selectionText: collapsed, frameId: 3 }, { id: 7 });
  assert.equal(text, collatz);
  assert.deepEqual(target, { tabId: 7, frameIds: [3] });
});

test('falls back to selectionText where scripts cannot run or nothing comes back', async () => {
  globalThis.chrome = fakeChrome(async () => { throw new Error('Cannot access a chrome:// URL'); });
  assert.equal(await readSelection({ selectionText: 'abc' }, { id: 1 }), 'abc');
  globalThis.chrome = fakeChrome(async () => [{ result: '   ' }]);
  assert.equal(await readSelection({ selectionText: 'abc' }, { id: 1 }), 'abc');
  globalThis.chrome = {};
  assert.equal(await readSelection({ selectionText: 'abc' }, { id: 1 }), 'abc');
  assert.equal(await readSelection({ selectionText: 'abc' }, undefined), 'abc');
});

test('a selection inside a textarea is read from the field', () => {
  const value = 'xx\n  def f():\n    pass\nyy';
  globalThis.document = { activeElement: { tagName: 'TEXTAREA', value, selectionStart: 2, selectionEnd: value.indexOf('yy') } };
  globalThis.window = { getSelection: () => 'wrong' };
  assert.equal(pageSelection(), '\n  def f():\n    pass\n');
  globalThis.document = { activeElement: { tagName: 'BODY' } };
  assert.equal(pageSelection(), 'wrong');
});

test('normalize keeps formatting, fixes line endings and no-break spaces', () => {
  assert.equal(normalizeSelection('a\r\nb\rc\n\n\td'), 'a\nb\nc\n\n\td');
  assert.equal(normalizeSelection('if x:\n\u00a0\u00a0\u00a0\u00a0pass # comment'), 'if x:\n    pass # comment');
  assert.equal(normalizeSelection(collatz), collatz);
});

test('Collatz starter (docstring, comments, blank lines) reaches the IDE byte for byte as Python', () => {
  assert.equal(classify(collatz).language, 'python');
  const { dest, url } = resolveMenuClick(SMART_MENU_ID, normalizeSelection(collatz));
  assert.equal(dest.id, 'zt-ide');
  assert.equal(new URLSearchParams(new URL(url).hash.slice(1)).get('language'), 'python');
  assert.equal(decodeCode(url), collatz);
});

test('code copied from a web code block with no-break-space indentation', () => {
  const web = 'function add(a, b) {\n\u00a0\u00a0return a + b; // sum\n}\n\nconst total = add(1, 2);\nconsole.log(total);';
  const { url } = resolveMenuClick('zt-ide', normalizeSelection(web));
  assert.equal(decodeCode(url), web.replace(/\u00a0/g, ' '));
  assert.equal(new URLSearchParams(new URL(url).hash.slice(1)).get('language'), 'javascript');
});
