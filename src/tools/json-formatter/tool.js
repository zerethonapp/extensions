import { $, copy, decodePrefill, mountTopbar } from '../_shell/shell.js';

const SLUG = 'json-formatter';
const SAMPLE = `{
  "name": "Zerethon Tools",
  "version": "0.2.0",
  "offline": true,
  "tools": ["json-formatter", "base64-encoder", "hash-generator"],
  "meta": { "created": "2026-05-23" }
}`;

const els = {
  input: $('#input'),
  output: $('#output'),
  err: $('#error'),
  copy: $('#copy'),
  indent: $('#indent'),
  sortKeys: $('#sort-keys'),
  mPretty: $('#m-pretty'),
  mMinify: $('#m-minify'),
  sample: $('#sample'),
  clear: $('#clear'),
};

let mode = 'pretty';

$('#zt-page').prepend(mountTopbar({ title: 'JSON Formatter', slug: SLUG }));

function setMode(next) {
  mode = next;
  els.mPretty.classList.toggle('is-on', mode === 'pretty');
  els.mMinify.classList.toggle('is-on', mode === 'minify');
  format();
}

function indentValue() {
  const v = els.indent.value;
  if (v === 'tab') return '\t';
  return Number.parseInt(v, 10);
}

function sortKeysReplacer(_key, value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.keys(value).sort().reduce((acc, k) => (acc[k] = value[k], acc), {});
  }
  return value;
}

function format() {
  const text = els.input.value;
  if (!text.trim()) {
    els.output.value = '';
    els.err.hidden = true;
    els.copy.disabled = true;
    return;
  }
  try {
    const replacer = els.sortKeys.checked ? sortKeysReplacer : null;
    const parsed = JSON.parse(text);
    const out = mode === 'minify'
      ? JSON.stringify(parsed, replacer)
      : JSON.stringify(parsed, replacer, indentValue());
    els.output.value = out;
    els.err.hidden = true;
    els.copy.disabled = false;
  } catch (e) {
    const msg = e?.message || String(e);
    const m = msg.match(/position (\d+)/);
    let where = '';
    if (m) {
      const pos = Number.parseInt(m[1], 10);
      const before = text.slice(0, pos);
      const line = before.split('\n').length;
      const col = pos - before.lastIndexOf('\n');
      where = ` (line ${line}, column ${col})`;
    }
    els.err.textContent = `Parse error${where}: ${msg}`;
    els.err.hidden = false;
    els.output.value = '';
    els.copy.disabled = true;
  }
}

els.input.addEventListener('input', format);
els.indent.addEventListener('change', format);
els.sortKeys.addEventListener('change', format);
els.mPretty.addEventListener('click', () => setMode('pretty'));
els.mMinify.addEventListener('click', () => setMode('minify'));
els.copy.addEventListener('click', () => copy(els.output.value));
els.sample.addEventListener('click', () => { els.input.value = SAMPLE; format(); });
els.clear.addEventListener('click', () => { els.input.value = ''; format(); els.input.focus(); });

// Context-menu / omnibox prefill
const prefill = decodePrefill();
if (prefill) {
  els.input.value = prefill;
  format();
}
