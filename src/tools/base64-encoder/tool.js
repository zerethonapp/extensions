import { $, copy, decodePrefill, mountTopbar, queryParam } from '../_shell/shell.js';

const SLUG = 'base64-encoder';
const SAMPLE_ENCODE = 'Hello, Zerethon! 🚀';
const SAMPLE_DECODE = 'SGVsbG8sIFplcmV0aG9uISDwn5qA';

const els = {
  input: $('#input'),
  output: $('#output'),
  err: $('#error'),
  copy: $('#copy'),
  inputLabel: $('#input-label'),
  urlSafe: $('#url-safe'),
  mEncode: $('#m-encode'),
  mDecode: $('#m-decode'),
  swap: $('#swap'),
  sample: $('#sample'),
  clear: $('#clear'),
};

let mode = 'encode';

$('#zt-page').prepend(mountTopbar({ title: 'Base64 Encoder & Decoder', slug: SLUG }));

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

function toUrlSafe(b64) {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

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
  run();
}

function run() {
  const raw = els.input.value;
  if (!raw) {
    els.output.value = '';
    els.err.hidden = true;
    els.copy.disabled = true;
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
    els.copy.disabled = false;
  } catch (e) {
    els.err.textContent = e?.message || 'Invalid Base64';
    els.err.hidden = false;
    els.output.value = '';
    els.copy.disabled = true;
  }
}

function swap() {
  const tmp = els.input.value;
  els.input.value = els.output.value;
  setMode(mode === 'encode' ? 'decode' : 'encode');
  if (!els.input.value) els.input.value = tmp; // restore if output was empty
}

els.input.addEventListener('input', run);
els.urlSafe.addEventListener('change', run);
els.mEncode.addEventListener('click', () => setMode('encode'));
els.mDecode.addEventListener('click', () => setMode('decode'));
els.copy.addEventListener('click', () => copy(els.output.value));
els.swap.addEventListener('click', swap);
els.sample.addEventListener('click', () => {
  els.input.value = mode === 'encode' ? SAMPLE_ENCODE : SAMPLE_DECODE;
  run();
});
els.clear.addEventListener('click', () => { els.input.value = ''; run(); els.input.focus(); });

// Context-menu / omnibox prefill
const modeParam = queryParam('mode');
if (modeParam === 'encode' || modeParam === 'decode') setMode(modeParam);

const prefill = decodePrefill();
if (prefill) {
  els.input.value = prefill;
  run();
}
