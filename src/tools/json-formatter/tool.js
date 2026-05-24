import { $, buildWebUrl, copy, decodePrefill, downloadText, flashSuccess, mountTopbar, toast, toggleFullscreen } from '../_shell/shell.js';
import { iconBtn } from '../_shell/icons.js';

const SLUG = 'json-formatter';
const SAMPLE = `{
  "name": "Zerethon Tools",
  "version": "0.2.0",
  "offline": true,
  "tools": ["json-formatter", "base64-encoder", "hash-generator"],
  "meta": { "created": "2026-05-23", "license": "MIT" }
}`;

const els = {
  input: $('#input'),
  output: $('#output'),
  outputTree: $('#output-tree'),
  err: $('#error'),
  indent: $('#indent'),
  sortKeys: $('#sort-keys'),
  mPretty: $('#m-pretty'),
  mMinify: $('#m-minify'),
  mTree: $('#m-tree'),
  sample: $('#sample'),
  clear: $('#clear'),
  inputMeta: $('#input-meta'),
  inputActions: $('#input-actions'),
  outputActions: $('#output-actions'),
  paneInput: $('#pane-input'),
  paneOutput: $('#pane-output'),
  grid: $('#grid'),
  stats: $('#stats'),
};

let mode = 'pretty';
let parsedStats = null;
let parsedValue = null;

$('#zt-page').prepend(mountTopbar({
  title: 'JSON Formatter',
  slug: SLUG,
  webHrefBuilder: () => buildWebUrl(SLUG, {
    input: els.input.value,
    extras: { view: mode === 'tree' ? 'tree' : undefined },
  }),
}));

/* ---------- pane toolbars ---------- */

els.inputActions.innerHTML = [
  iconBtn({ id: 'in-beautify', iconName: 'bars3BottomLeft', title: 'Beautify input', disabled: true }),
  iconBtn({ id: 'in-minify', iconName: 'bars3', title: 'Minify input', disabled: true }),
  iconBtn({ id: 'in-copy', iconName: 'clipboard', title: 'Copy input', disabled: true }),
  iconBtn({ id: 'in-fs', iconName: 'arrowsPointingOut', title: 'Fullscreen input' }),
].join('');

els.outputActions.innerHTML = [
  iconBtn({ id: 'out-copy', iconName: 'clipboard', title: 'Copy output', disabled: true }),
  iconBtn({ id: 'out-download', iconName: 'arrowDownTray', title: 'Download .json', disabled: true }),
  iconBtn({ id: 'out-fs', iconName: 'arrowsPointingOut', title: 'Fullscreen output' }),
].join('');

const btn = {
  inBeautify: $('#in-beautify'),
  inMinify: $('#in-minify'),
  inCopy: $('#in-copy'),
  inFs: $('#in-fs'),
  outCopy: $('#out-copy'),
  outDownload: $('#out-download'),
  outFs: $('#out-fs'),
};

/* ---------- core ---------- */

function setMode(next) {
  mode = next;
  els.mPretty.classList.toggle('is-on', mode === 'pretty');
  els.mMinify.classList.toggle('is-on', mode === 'minify');
  els.mTree.classList.toggle('is-on', mode === 'tree');
  // Swap which output surface is visible. Textarea for pretty/minify,
  // <div> tree for tree mode.
  els.output.hidden = mode === 'tree';
  els.outputTree.hidden = mode !== 'tree';
  format();
}

function indentValue() {
  const v = els.indent.value;
  return v === 'tab' ? '\t' : Number.parseInt(v, 10);
}

function sortKeysReplacer(_key, value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.keys(value).sort().reduce((acc, k) => (acc[k] = value[k], acc), {});
  }
  return value;
}

function computeStats(parsed) {
  let keys = 0, primitives = 0, depth = 0;
  function walk(v, d) {
    if (d > depth) depth = d;
    if (v == null || typeof v !== 'object') { primitives++; return; }
    if (Array.isArray(v)) { v.forEach((x) => walk(x, d + 1)); return; }
    for (const k of Object.keys(v)) { keys++; walk(v[k], d + 1); }
  }
  walk(parsed, 0);
  const root = Array.isArray(parsed) ? 'array' : (parsed === null ? 'null' : typeof parsed);
  return { root, keys, primitives, depth };
}

function format() {
  const text = els.input.value;
  if (!text.trim()) {
    els.output.value = '';
    els.outputTree.innerHTML = '';
    els.err.hidden = true;
    parsedStats = null;
    parsedValue = null;
    refreshButtons();
    refreshStats();
    return;
  }
  try {
    const replacer = els.sortKeys.checked ? sortKeysReplacer : null;
    const parsed = JSON.parse(text);
    parsedValue = els.sortKeys.checked ? JSON.parse(JSON.stringify(parsed, replacer)) : parsed;
    parsedStats = computeStats(parsedValue);

    if (mode === 'tree') {
      els.output.value = '';                          // textarea hidden anyway
      els.outputTree.innerHTML = renderTree(parsedValue);
    } else {
      els.outputTree.innerHTML = '';
      els.output.value = mode === 'minify'
        ? JSON.stringify(parsedValue)
        : JSON.stringify(parsedValue, null, indentValue());
    }
    els.err.hidden = true;
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
    els.outputTree.innerHTML = '';
    parsedStats = null;
    parsedValue = null;
  }
  refreshButtons();
  refreshStats();
}

/* ---------- tree renderer (native <details> based — zero JS for collapse) ---------- */

function renderTree(value) {
  return `<div>${renderNode(value, null, true)}</div>`;
}

function renderNode(value, key, isRoot) {
  if (value === null) return wrap(key, `<span class="tt-null">null</span>`, isRoot);
  if (typeof value === 'boolean') return wrap(key, `<span class="tt-bool">${value}</span>`, isRoot);
  if (typeof value === 'number') return wrap(key, `<span class="tt-num">${value}</span>`, isRoot);
  if (typeof value === 'string') return wrap(key, `<span class="tt-str">"${escapeHtml(value)}"</span>`, isRoot);

  if (Array.isArray(value)) {
    if (value.length === 0) return wrap(key, `<span class="tt-bracket">[]</span>`, isRoot);
    const head = `<span class="tt-bracket">[${value.length}]</span>`;
    const items = value.map((v, i) => `<li>${renderNode(v, String(i), false)}</li>`).join('');
    return collapsible(key, head, `<ul>${items}</ul>`, isRoot);
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return wrap(key, `<span class="tt-bracket">{}</span>`, isRoot);
    const head = `<span class="tt-bracket">{${keys.length}}</span>`;
    const items = keys.map((k) => `<li>${renderNode(value[k], k, false)}</li>`).join('');
    return collapsible(key, head, `<ul>${items}</ul>`, isRoot);
  }

  return wrap(key, escapeHtml(String(value)), isRoot);
}

function wrap(key, valueHtml, isRoot) {
  if (isRoot || key === null) return valueHtml;
  // Number keys (array indices) shown without quotes for readability.
  const isIndex = /^\d+$/.test(key);
  const keyHtml = isIndex ? `<span class="tt-key">${key}</span>` : `<span class="tt-key">"${escapeHtml(key)}"</span>`;
  return `${keyHtml}: ${valueHtml}`;
}

function collapsible(key, headHtml, bodyHtml, isRoot) {
  const isIndex = key !== null && /^\d+$/.test(key);
  const keyHtml = isRoot || key === null
    ? ''
    : (isIndex
      ? `<span class="tt-key">${key}</span>: `
      : `<span class="tt-key">"${escapeHtml(key)}"</span>: `);
  return `<details open><summary>${keyHtml}${headHtml}</summary>${bodyHtml}</details>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function refreshButtons() {
  const hasInput = !!els.input.value;
  // In tree mode the textarea is empty by design — gate output buttons on
  // whether we have a parsed value instead, since copy/download produce JSON.
  const hasOutput = mode === 'tree' ? parsedValue !== null : !!els.output.value;
  btn.inBeautify.disabled = !parsedStats;
  btn.inMinify.disabled = !parsedStats;
  btn.inCopy.disabled = !hasInput;
  btn.outCopy.disabled = !hasOutput;
  btn.outDownload.disabled = !hasOutput;
  els.inputMeta.textContent = hasInput ? formatBytes(new Blob([els.input.value]).size) : '';
}

function currentOutputText() {
  if (mode === 'tree' && parsedValue !== null) {
    return JSON.stringify(parsedValue, null, indentValue());
  }
  return els.output.value;
}

function refreshStats() {
  // Rebuild stats strip; keep keyboard-hint span on the right.
  const parts = [];
  if (parsedStats) {
    parts.push(`Root: <strong>${parsedStats.root}</strong>`);
    parts.push(`Keys: <strong>${parsedStats.keys.toLocaleString()}</strong>`);
    parts.push(`Depth: <strong>${parsedStats.depth}</strong>`);
    parts.push(`Values: <strong>${parsedStats.primitives.toLocaleString()}</strong>`);
  }
  els.stats.innerHTML = `
    ${parts.map((p) => `<span>${p}</span>`).join('')}
    <span class="zt-stats-spacer"></span>
    <span><kbd>⌘↵</kbd> format · <kbd>Esc</kbd> exit fullscreen</span>
  `;
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

/* ---------- event wiring ---------- */

els.input.addEventListener('input', format);
els.indent.addEventListener('change', format);
els.sortKeys.addEventListener('change', format);
els.mPretty.addEventListener('click', () => setMode('pretty'));
els.mMinify.addEventListener('click', () => setMode('minify'));
els.mTree.addEventListener('click', () => setMode('tree'));

els.sample.addEventListener('click', () => { els.input.value = SAMPLE; format(); });
els.clear.addEventListener('click', () => { els.input.value = ''; format(); els.input.focus(); });

btn.inBeautify.addEventListener('click', () => {
  if (!parsedStats) return;
  els.input.value = JSON.stringify(JSON.parse(els.input.value), null, indentValue());
  format();
});
btn.inMinify.addEventListener('click', () => {
  if (!parsedStats) return;
  els.input.value = JSON.stringify(JSON.parse(els.input.value));
  format();
});
btn.inCopy.addEventListener('click', async () => {
  if (await copy(els.input.value)) flashSuccess(btn.inCopy);
});
btn.outCopy.addEventListener('click', async () => {
  const text = currentOutputText();
  if (text && await copy(text)) flashSuccess(btn.outCopy);
});
btn.outDownload.addEventListener('click', () => {
  const text = currentOutputText();
  if (!text) return;
  downloadText('formatted.json', text, 'application/json');
  toast('Downloaded', 'success');
});

// Fullscreen + Esc to exit
btn.inFs.addEventListener('click', () => toggleFullscreen(els.paneInput, els.grid));
btn.outFs.addEventListener('click', () => toggleFullscreen(els.paneOutput, els.grid));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.querySelector('.zt-pane.is-fullscreen')) {
    document.querySelectorAll('.zt-pane.is-fullscreen').forEach((p) => p.classList.remove('is-fullscreen'));
    els.grid.classList.remove('has-fullscreen');
  }
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); format(); }
});

// Context-menu / omnibox prefill
const prefill = decodePrefill();
if (prefill) {
  els.input.value = prefill;
  format();
} else {
  refreshStats();
}
