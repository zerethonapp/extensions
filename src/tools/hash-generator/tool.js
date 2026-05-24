import { $, copy, decodePrefill, flashSuccess, mountTopbar, toggleFullscreen } from '../_shell/shell.js';
import { iconBtn } from '../_shell/icons.js';
import { BASE_URL } from '../../lib/config.js';

const SLUG = 'hash-generator';
const SAMPLE = 'The quick brown fox jumps over the lazy dog';

const els = {
  input: $('#input'),
  output: $('#output'),
  algo: $('#algo'),
  algoName: $('#algo-name'),
  encoding: $('#encoding'),
  sample: $('#sample'),
  clear: $('#clear'),
  openMd5: $('#open-md5'),
  inputActions: $('#input-actions'),
  outputActions: $('#output-actions'),
  paneInput: $('#pane-input'),
  paneOutput: $('#pane-output'),
  grid: $('#grid'),
};

$('#zt-page').prepend(mountTopbar({ title: 'Hash Generator', slug: SLUG }));

els.inputActions.innerHTML = [
  iconBtn({ id: 'in-copy', iconName: 'clipboard', title: 'Copy input', disabled: true }),
  iconBtn({ id: 'in-fs', iconName: 'arrowsPointingOut', title: 'Fullscreen input' }),
].join('');
els.outputActions.innerHTML = [
  iconBtn({ id: 'out-copy', iconName: 'clipboard', title: 'Copy hash', disabled: true }),
  iconBtn({ id: 'out-fs', iconName: 'arrowsPointingOut', title: 'Fullscreen output' }),
].join('');

const btn = {
  inCopy: $('#in-copy'),
  inFs: $('#in-fs'),
  outCopy: $('#out-copy'),
  outFs: $('#out-fs'),
};

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
    refreshButtons();
    return;
  }
  const myToken = (pending = Symbol());
  try {
    const buf = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest(els.algo.value, buf);
    if (myToken !== pending) return;
    els.output.value = encode(digest, els.encoding.value);
  } catch (e) {
    if (myToken !== pending) return;
    els.output.value = '';
    console.error(e);
  }
  refreshButtons();
}

function refreshButtons() {
  btn.inCopy.disabled = !els.input.value;
  btn.outCopy.disabled = !els.output.value;
}

els.input.addEventListener('input', run);
els.algo.addEventListener('change', run);
els.encoding.addEventListener('change', run);
els.sample.addEventListener('click', () => { els.input.value = SAMPLE; run(); });
els.clear.addEventListener('click', () => { els.input.value = ''; run(); els.input.focus(); });

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
