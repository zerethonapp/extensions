import { $, copy, decodePrefill, mountTopbar } from '../_shell/shell.js';
import { BASE_URL } from '../../lib/config.js';

const SLUG = 'hash-generator';
const SAMPLE = 'The quick brown fox jumps over the lazy dog';

const els = {
  input: $('#input'),
  output: $('#output'),
  copy: $('#copy'),
  algo: $('#algo'),
  algoName: $('#algo-name'),
  encoding: $('#encoding'),
  sample: $('#sample'),
  clear: $('#clear'),
  openMd5: $('#open-md5'),
};

$('#zt-page').prepend(mountTopbar({ title: 'Hash Generator', slug: SLUG }));

function toHex(buf, upper = false) {
  const bytes = new Uint8Array(buf);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, '0');
  return upper ? hex.toUpperCase() : hex;
}

function toBase64(buf) {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function encode(buf, encoding) {
  switch (encoding) {
    case 'hex': return toHex(buf, false);
    case 'hex-upper': return toHex(buf, true);
    case 'base64': return toBase64(buf);
    case 'base64url': return toBase64(buf).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    default: return toHex(buf);
  }
}

let pending = null;

async function run() {
  const text = els.input.value;
  els.algoName.textContent = els.algo.value;
  if (!text) {
    els.output.value = '';
    els.copy.disabled = true;
    return;
  }
  const myToken = (pending = Symbol());
  try {
    const buf = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest(els.algo.value, buf);
    if (myToken !== pending) return; // a newer run superseded us
    els.output.value = encode(digest, els.encoding.value);
    els.copy.disabled = false;
  } catch (e) {
    if (myToken !== pending) return;
    els.output.value = '';
    els.copy.disabled = true;
    console.error(e);
  }
}

els.input.addEventListener('input', run);
els.algo.addEventListener('change', run);
els.encoding.addEventListener('change', run);
els.copy.addEventListener('click', () => copy(els.output.value));
els.sample.addEventListener('click', () => { els.input.value = SAMPLE; run(); });
els.clear.addEventListener('click', () => { els.input.value = ''; run(); els.input.focus(); });

els.openMd5.addEventListener('click', (e) => {
  e.preventDefault();
  window.open(`${BASE_URL}/md5-hash-generator?ref=ext&src=bundled-fallback`, '_blank', 'noopener');
});

// Context-menu / omnibox prefill
const prefill = decodePrefill();
if (prefill) {
  els.input.value = prefill;
  run();
}
