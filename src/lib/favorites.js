// Starred tool slugs, persisted to chrome.storage.sync so they roam
// across the user's signed-in Chrome devices. Cap below storage.sync quotas
// (8KB per item, 100 items, ~100KB total — we use one item of slug strings).

const KEY = 'favorites_v1';
const MAX = 50;

export async function getFavorites() {
  const { [KEY]: list } = await chrome.storage.sync.get(KEY);
  return Array.isArray(list) ? list : [];
}

export async function isFavorite(slug) {
  const list = await getFavorites();
  return list.includes(slug);
}

export async function toggleFavorite(slug) {
  const list = await getFavorites();
  const next = list.includes(slug)
    ? list.filter((s) => s !== slug)
    : [slug, ...list].slice(0, MAX);
  await chrome.storage.sync.set({ [KEY]: next });
  return next;
}

export async function clearFavorites() {
  await chrome.storage.sync.remove(KEY);
}
