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
Adds six entries to the right-click menu when the user has text selected:
"Format as JSON", "Decode Base64", "Encode Base64", "Hash (SHA-256)",
"Convert case…", and "Parse URL". Selecting one opens the corresponding tool
page at tools.zerethon.com in a new tab, with the selected text passed as a
URL-safe base64 query parameter so the tool's existing client-side JavaScript
can prefill its input box. The selected text is never sent to our servers —
the tool decodes the query string entirely in the browser.

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
No other domain is accessed by the extension under any circumstance.
