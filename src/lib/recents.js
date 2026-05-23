// MRU list of tool slugs, persisted to chrome.storage.local.
// Stays on-device — never synced, never transmitted.

const KEY = 'recents_v1';
const MAX = 8;

export async function getRecents() {
  const { [KEY]: list } = await chrome.storage.local.get(KEY);
  return Array.isArray(list) ? list : [];
}

export async function pushRecent(slug) {
  if (!slug) return;
  const list = await getRecents();
  const next = [slug, ...list.filter((s) => s !== slug)].slice(0, MAX);
  await chrome.storage.local.set({ [KEY]: next });
  return next;
}

export async function clearRecents() {
  await chrome.storage.local.remove(KEY);
}
