// Shared helpers for bundled offline tools.
// Plain ES module — each tool imports the pieces it needs.

import { BASE_URL } from '../../lib/config.js';

const I18N = (k, fallback) => (chrome?.i18n?.getMessage?.(k) || fallback || k);

/* ---------- prefill from context menu / omnibox ---------- */

const PREFILL_CAP_BYTES = 200 * 1024;

export function decodePrefill(paramName = 'input') {
  try {
    const raw = new URLSearchParams(location.search).get(paramName);
    if (!raw) return '';
    let b64 = raw.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const bin = atob(b64);
    if (bin.length > PREFILL_CAP_BYTES) return '';
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  } catch {
    return '';
  }
}

export function queryParam(name) {
  try { return new URLSearchParams(location.search).get(name); }
  catch { return null; }
}

/* Encode text to URL-safe base64 for ?input= params.
   Inverse of decodePrefill(). Used when navigating off-extension so the
   destination tool page on tools.zerethon.com prefills the input box. */
export function toUrlSafeBase64(str) {
  if (!str) return '';
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/* Build the canonical "open this tool on the website" URL with optional
   prefill + extra params. ref/src defaulted so we can measure ext-driven traffic. */
export function buildWebUrl(slug, { input = '', extras = {}, src = 'bundled-link' } = {}) {
  const u = new URL(`${BASE_URL}/${slug}`);
  u.searchParams.set('ref', 'ext');
  u.searchParams.set('src', src);
  for (const [k, v] of Object.entries(extras)) {
    if (v != null && v !== '') u.searchParams.set(k, String(v));
  }
  if (input) u.searchParams.set('input', toUrlSafeBase64(input));
  return u.toString();
}

/* ---------- clipboard + toast ---------- */

let toastEl = null;
let toastTimer = null;

function ensureToast() {
  if (toastEl) return toastEl;
  toastEl = document.createElement('div');
  toastEl.className = 'zt-toast';
  document.body.appendChild(toastEl);
  return toastEl;
}

export function toast(message, kind = 'info', ttl = 2000) {
  const el = ensureToast();
  el.className = `zt-toast is-${kind}`;
  el.textContent = message;
  requestAnimationFrame(() => el.classList.add('is-visible'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), ttl);
}

export async function copy(text) {
  if (text == null || text === '') return false;
  try {
    await navigator.clipboard.writeText(String(text));
    toast('Copied', 'success');
    return true;
  } catch {
    toast('Copy failed — clipboard blocked', 'error');
    return false;
  }
}

/* ---------- DOM helpers ---------- */

export function $(sel, root = document) { return root.querySelector(sel); }
export function $$(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

/* ---------- top-bar markup factory ----------
   Mirrors the live-site header in spirit: Z brand mark + name on the left,
   tool title in the middle, OFFLINE pill + "Open on web" on the right.
   Sticky + backdrop-blur is in shell.css.

   The `webHrefBuilder` callback (optional) is invoked at click time on the
   "Open on web" link so the destination URL carries the user's current input
   as a ?input=<urlsafe-base64> param — opening the website with the same
   content already loaded instead of an empty form. */

export function mountTopbar({ title, slug, webHrefBuilder }) {
  const bar = document.createElement('header');
  bar.className = 'zt-topbar';
  const initialHref = webHrefBuilder
    ? webHrefBuilder()
    : `${BASE_URL}/${encodeURIComponent(slug)}?ref=ext&src=bundled`;
  bar.innerHTML = `
    <a class="zt-brand" href="${escapeHtml(BASE_URL)}/?ref=ext&src=bundled-brand" target="_blank" rel="noopener" title="Open tools.zerethon.com">
      <span class="zt-z" aria-hidden="true">Z</span>
      <span class="zt-brand-text">Zerethon Tools</span>
    </a>
    <span class="zt-divider" aria-hidden="true"></span>
    <h1>${escapeHtml(title)}</h1>
    <span class="zt-offline-pill" title="Runs inside the extension — no network">offline</span>
    <a class="zt-web-link" href="${escapeHtml(initialHref)}" target="_blank" rel="noopener">
      Open on web ↗
    </a>
  `;
  if (webHrefBuilder) {
    const link = bar.querySelector('.zt-web-link');
    // Refresh href just before navigation so it always reflects the current input.
    link.addEventListener('mousedown', () => { link.href = webHrefBuilder(); });
    link.addEventListener('auxclick', () => { link.href = webHrefBuilder(); }); // middle-click
    link.addEventListener('contextmenu', () => { link.href = webHrefBuilder(); }); // right-click copy-link
  }
  return bar;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ---------- pane fullscreen toggle + flash ---------- */

export function toggleFullscreen(paneEl, gridEl) {
  if (!paneEl) return;
  const wasOn = paneEl.classList.toggle('is-fullscreen');
  gridEl?.classList.toggle('has-fullscreen', wasOn);
}

export function flashSuccess(btn, ms = 1200) {
  btn.classList.add('is-flashed');
  setTimeout(() => btn.classList.remove('is-flashed'), ms);
}

/* ---------- download blob helper ---------- */

export function downloadText(filename, text, mime = 'text/plain') {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
