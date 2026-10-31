# Permission Justifications

Paste the text below verbatim into the Chrome Web Store dashboard
(`Privacy practices → Permission justification`) and the Edge Add-ons equivalent.
Each block is well under the 1000-character limit per field.

---

## `storage`
Stores the user's list of recently-used tools and starred favorites locally on
their device. Recents use chrome.storage.local (device-only). Favorites use
chrome.storage.sync so they roam across the user's signed-in Chrome devices.
No data is transmitted to any server.

## `contextMenus`
Adds a "Zerethon Tools" right-click submenu when the user has text selected.
Its first entry opens the selection in the best-matching tool, chosen by
deterministic rules that run locally inside the extension (no AI, no network
request); the other entries let the user pick a tool by hand: Create QR Code,
Open in IDE, Format JSON, Encode/Decode Base64, Generate Hash, Convert case,
Parse URL, All Tools. Selecting one opens that tool on tools.zerethon.com (or
Zerethon IDE at ide.zerethon.com) in a new tab, with the selected text in the
URL fragment so the page's client-side JavaScript can prefill its input. URL
fragments are never sent to servers; the text is not stored or logged.

## `sidePanel`
Lets the user open the tool launcher in Chrome's side panel so they can keep
the search list visible while browsing other tabs. The side panel only shows
extension UI; it never reads, modifies, or interacts with the page in the
main tab.

## `host_permissions: https://tools.zerethon.com/*`
Two uses, both initiated by explicit user action:
1. The launcher fetches the public catalog of 111 tools from
   https://tools.zerethon.com/api/internal/tools.json (once per day, cached)
   so the in-extension list stays current as new tools ship.
2. Every tool click opens that tool on tools.zerethon.com in a new tab.
"Open in IDE" opens ide.zerethon.com in a new tab — a normal navigation that
needs no host permission. No other domain is accessed by the extension.
