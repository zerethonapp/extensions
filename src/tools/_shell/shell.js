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

/* ---------- top-bar markup factory ---------- */

export function mountTopbar({ title, slug }) {
  const bar = document.createElement('header');
  bar.className = 'zt-topbar';
  bar.innerHTML = `
    <h1>${escapeHtml(title)}</h1>
    <span class="zt-offline-pill" title="Runs inside the extension — no network">offline</span>
    <a href="${escapeHtml(BASE_URL)}/${encodeURIComponent(slug)}?ref=ext&src=bundled" target="_blank" rel="noopener">
      Open on web ↗
    </a>
  `;
  return bar;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
