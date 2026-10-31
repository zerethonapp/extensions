// Service worker — context menus, omnibox, side panel, install hook.
// MV3 service workers are stateless; never hold state outside chrome.storage.
//
// Option A (Companion Launcher): every tool opens on tools.zerethon.com.
// Context menu (v0.3): a "Zerethon Tools" submenu whose first entry opens the
// selection in the best-matching tool, decided at click time by the local
// rule-based classifier (lib/classifier.js → lib/router.js), followed by every
// manual choice. The selected text is passed in the URL fragment, which never
// reaches a server; it is not logged or stored.
//
// Chrome cannot relabel a menu entry per selection without a content script on
// every site, so the suggested entry's title is fixed ("Open “%s” in the best
// tool") and the routing happens on click. On that click the real selection is
// read from the page (lib/selection.js): selectionText loses line breaks.

import { REGISTRY, BUNDLED_SLUGS, findTool } from './lib/tools-registry.js';
import { BASE_URL } from './lib/config.js';
import { DESTINATIONS, SMART_MENU_ID, buildToolUrl, resolveMenuClick } from './lib/router.js';
import { normalizeSelection, readSelection } from './lib/selection.js';

const ROOT_MENU_ID = 'zt-root';

chrome.runtime.onInstalled.addListener(() => {
  // Recreated on install and on every update, so 0.2.0's top-level entries are replaced.
  chrome.contextMenus.removeAll(() => {
    const add = (props) => chrome.contextMenus.create({ contexts: ['selection'], ...props });
    add({ id: ROOT_MENU_ID, title: chrome.i18n.getMessage('ctx_root') });
    add({ id: SMART_MENU_ID, parentId: ROOT_MENU_ID, title: chrome.i18n.getMessage('ctx_smart') });
    add({ id: 'zt-sep-1', parentId: ROOT_MENU_ID, type: 'separator' });
    for (const dest of DESTINATIONS.filter((d) => d.menu)) {
      if (dest.kind === 'home') add({ id: 'zt-sep-2', parentId: ROOT_MENU_ID, type: 'separator' });
      add({ id: dest.id, parentId: ROOT_MENU_ID, title: chrome.i18n.getMessage(dest.titleKey) });
    }
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!info.selectionText) return;
  const text = normalizeSelection(await readSelection(info, tab));
  const target = resolveMenuClick(info.menuItemId, text);
  if (target) chrome.tabs.create({ url: target.url });
});

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
