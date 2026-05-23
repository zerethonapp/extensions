// Service worker — context menus, omnibox, side panel, install hook.
// MV3 service workers are stateless; never hold state outside chrome.storage.
//
// Option A (Companion Launcher): every tool opens on tools.zerethon.com.
// Context-menu invocations base64-encode the selected text into ?input= so the
// receiving tool page can prefill its input box. Selected text never touches
// our servers — the query string is decoded entirely client-side by the
// existing tool view.

import { REGISTRY, BUNDLED_SLUGS, findTool } from './lib/tools-registry.js';
import { BASE_URL } from './lib/config.js';

const CONTEXT_MENU_ITEMS = [
  { id: 'zt-json',   tool: 'json-formatter',      titleKey: 'ctx_format_json' },
  { id: 'zt-b64dec', tool: 'base64-encoder',      titleKey: 'ctx_b64_decode', extra: { mode: 'decode' } },
  { id: 'zt-b64enc', tool: 'base64-encoder',      titleKey: 'ctx_b64_encode', extra: { mode: 'encode' } },
  { id: 'zt-hash',   tool: 'hash-generator',      titleKey: 'ctx_hash_sha256' },
  { id: 'zt-case',   tool: 'text-case-converter', titleKey: 'ctx_case_convert' },
  { id: 'zt-url',    tool: 'url-parser',          titleKey: 'ctx_parse_url' },
];

const MAX_PREFILL_BYTES = 100 * 1024;

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    for (const item of CONTEXT_MENU_ITEMS) {
      chrome.contextMenus.create({
        id: item.id,
        title: chrome.i18n.getMessage(item.titleKey),
        contexts: ['selection'],
      });
    }
  });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  const item = CONTEXT_MENU_ITEMS.find((m) => m.id === info.menuItemId);
  if (!item || !info.selectionText) return;
  chrome.tabs.create({ url: buildToolUrl(item.tool, info.selectionText, item.extra, 'ctx') });
});

export function buildToolUrl(slug, selectionText, extra = {}, src = 'ext') {
  const url = new URL(`${BASE_URL}/${slug}`);
  url.searchParams.set('ref', 'ext');
  url.searchParams.set('src', src);
  if (extra && typeof extra === 'object') {
    for (const [k, v] of Object.entries(extra)) url.searchParams.set(k, String(v));
  }
  if (selectionText) {
    const bytes = new TextEncoder().encode(selectionText);
    if (bytes.byteLength <= MAX_PREFILL_BYTES) {
      let bin = '';
      for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      const b64 = btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      url.searchParams.set('input', b64);
    }
  }
  return url.toString();
}

chrome.omnibox.setDefaultSuggestion({ description: chrome.i18n.getMessage('omnibox_default') });

chrome.omnibox.onInputChanged.addListener((rawInput, suggest) => {
  const query = rawInput.trim().toLowerCase();
  if (!query) return suggest([]);
  const hits = REGISTRY
    .filter((t) => `${t.name} ${t.slug} ${(t.keywords || []).join(' ')}`.toLowerCase().includes(query))
    .slice(0, 8)
    .map((t) => ({
      content: t.slug,
      description: `${escapeXml(t.name)} — ${escapeXml(t.category)}${BUNDLED_SLUGS.has(t.slug) ? ' · offline' : ''}`,
    }));
  suggest(hits);
});

chrome.omnibox.onInputEntered.addListener((text) => {
  const slug = text.trim().toLowerCase();
  const tool = findTool(slug) ?? REGISTRY.find((t) => t.name.toLowerCase().includes(slug));
  if (!tool) {
    chrome.tabs.create({ url: `${BASE_URL}/?ref=ext&q=${encodeURIComponent(slug)}` });
    return;
  }
  openTool(tool);
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === 'OPEN_TOOL') {
    openTool(msg.tool);
    sendResponse({ ok: true });
  }
  if (msg?.type === 'OPEN_SIDEPANEL' && msg.tabId != null) {
    chrome.sidePanel.open({ tabId: msg.tabId }).catch(() => {});
    sendResponse({ ok: true });
  }
  return true;
});

function openTool(tool) {
  if (!tool) return;
  chrome.tabs.create({ url: buildToolUrl(tool.slug, null, {}, 'omnibox') });
}

function escapeXml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
}
