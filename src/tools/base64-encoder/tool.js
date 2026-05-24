import { $, buildWebUrl, copy, decodePrefill, flashSuccess, mountTopbar, queryParam, toggleFullscreen } from '../_shell/shell.js';
import { iconBtn } from '../_shell/icons.js';

const SLUG = 'base64-encoder';
const SAMPLE_ENCODE = 'Hello, Zerethon! 🚀';
const SAMPLE_DECODE = 'SGVsbG8sIFplcmV0aG9uISDwn5qA';

const els = {
  input: $('#input'),
  output: $('#output'),
  err: $('#error'),
  inputLabel: $('#input-label'),
  urlSafe: $('#url-safe'),
  mEncode: $('#m-encode'),
  mDecode: $('#m-decode'),
  sample: $('#sample'),
  clear: $('#clear'),
  inputActions: $('#input-actions'),
  outputActions: $('#output-actions'),
  paneInput: $('#pane-input'),
  paneOutput: $('#pane-output'),
  grid: $('#grid'),
};

let mode = 'encode';

$('#zt-page').prepend(mountTopbar({
  title: 'Base64 Encoder & Decoder',
  slug: SLUG,
  webHrefBuilder: () => buildWebUrl(SLUG, {
    input: els.input.value,
    extras: { mode, 'url-safe': els.urlSafe.checked ? '1' : undefined },
  }),
}));

els.inputActions.innerHTML = [
  iconBtn({ id: 'in-swap', iconName: 'arrowsLeftRight', title: 'Swap input ↔ output' }),
  iconBtn({ id: 'in-copy', iconName: 'clipboard', title: 'Copy input', disabled: true }),
  iconBtn({ id: 'in-fs', iconName: 'arrowsPointingOut', title: 'Fullscreen input' }),
].join('');
els.outputActions.innerHTML = [
  iconBtn({ id: 'out-copy', iconName: 'clipboard', title: 'Copy output', disabled: true }),
  iconBtn({ id: 'out-fs', iconName: 'arrowsPointingOut', title: 'Fullscreen output' }),
].join('');

const btn = {
  inSwap: $('#in-swap'),
  inCopy: $('#in-copy'),
  inFs: $('#in-fs'),
  outCopy: $('#out-copy'),
  outFs: $('#out-fs'),
};

function toBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
function fromBase64(b64) {
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}
function toUrlSafe(b64) { return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function fromUrlSafe(b64) {
  let s = b64.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return s;
}

function setMode(next) {
  mode = next;
  els.mEncode.classList.toggle('is-on', mode === 'encode');
  els.mDecode.classList.toggle('is-on', mode === 'decode');
  els.inputLabel.textContent = mode === 'encode' ? 'Plain text' : 'Base64';
  els.input.placeholder = mode === 'encode' ? 'Paste text to encode…' : 'Paste Base64 to decode…';
  run();
}

function run() {
  const raw = els.input.value;
  if (!raw) {
    els.output.value = '';
    els.err.hidden = true;
    refreshButtons();
    return;
  }
  try {
    if (mode === 'encode') {
      const b64 = toBase64(raw);
      els.output.value = els.urlSafe.checked ? toUrlSafe(b64) : b64;
    } else {
      const trimmed = raw.trim();
      const b64 = els.urlSafe.checked ? fromUrlSafe(trimmed) : trimmed;
      els.output.value = fromBase64(b64);
    }
    els.err.hidden = true;
  } catch (e) {
    els.err.textContent = e?.message || 'Invalid Base64';
    els.err.hidden = false;
    els.output.value = '';
  }
  refreshButtons();
}

function refreshButtons() {
  btn.inCopy.disabled = !els.input.value;
  btn.outCopy.disabled = !els.output.value;
}

function swap() {
  if (!els.output.value && !els.input.value) return;
  const tmp = els.input.value;
  els.input.value = els.output.value || tmp;
  setMode(mode === 'encode' ? 'decode' : 'encode');
  if (!els.input.value) els.input.value = tmp;
}

els.input.addEventListener('input', run);
els.urlSafe.addEventListener('change', run);
els.mEncode.addEventListener('click', () => setMode('encode'));
els.mDecode.addEventListener('click', () => setMode('decode'));
els.sample.addEventListener('click', () => {
  els.input.value = mode === 'encode' ? SAMPLE_ENCODE : SAMPLE_DECODE;
  run();
});
els.clear.addEventListener('click', () => { els.input.value = ''; run(); els.input.focus(); });

btn.inSwap.addEventListener('click', swap);
btn.inCopy.addEventListener('click', async () => {
  if (await copy(els.input.value)) flashSuccess(btn.inCopy);
});
btn.outCopy.addEventListener('click', async () => {
  if (await copy(els.output.value)) flashSuccess(btn.outCopy);
});
btn.inFs.addEventListener('click', () => toggleFullscreen(els.paneInput, els.grid));
btn.outFs.addEventListener('click', () => toggleFullscreen(els.paneOutput, els.grid));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.querySelector('.zt-pane.is-fullscreen')) {
    document.querySelectorAll('.zt-pane.is-fullscreen').forEach((p) => p.classList.remove('is-fullscreen'));
    els.grid.classList.remove('has-fullscreen');
  }
});

// Context-menu / omnibox prefill
const modeParam = queryParam('mode');
if (modeParam === 'encode' || modeParam === 'decode') setMode(modeParam);

const prefill = decodePrefill();
if (prefill) {
  els.input.value = prefill;
  run();
}
