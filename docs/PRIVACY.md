# Privacy Policy — Zerethon Tools Browser Extension

_Last updated: 2026-05-23 · Version: 0.1.0 · Publisher: Zerethon_

This policy covers the **Zerethon Tools** browser extension (Chrome Web Store
and Microsoft Edge Add-ons). It is published in source form here and mirrored
verbatim at https://tools.zerethon.com/extension/privacy.

## In one sentence
The extension collects no personal data, sends nothing to our servers, and
contains no analytics or tracking SDKs.

## What the extension stores on your device
- **Recently-used tools** — a list of up to 8 tool slugs (e.g. `json-formatter`),
  stored in `chrome.storage.local`. Stays on your device. Not transmitted.
- **Favorite tools** — a list of up to 50 tool slugs, stored in
  `chrome.storage.sync`. This roams across your signed-in Chrome devices via
  Google's sync infrastructure; it does not pass through any Zerethon server.

Both lists are slugs only — no input data, no result data, no URLs you visited.
Clear them at any time from Chrome's site settings or by uninstalling the
extension.

## What the extension sends over the network
- **Once per day**: GET https://tools.zerethon.com/api/internal/tools.json
  to refresh the catalog of available tools. This request carries only the
  standard browser headers (User-Agent, Accept) — no user identifier, no token,
  no telemetry payload.
- **When you open a tool from the launcher, omnibox, or context menu**:
  the extension opens that tool's page on tools.zerethon.com in a new tab.
  This is a normal browser navigation — the destination site sees a referrer
  of `chrome-extension://…` and a `ref=ext` query parameter so we can measure
  how many visits originated from the extension in aggregate.

## What the extension does with selected text
The right-click "Zerethon: …" context-menu entries take the text you have
selected on a webpage and pass it to the corresponding tool by URL-safe
base64-encoding it into an `?input=…` query parameter on the destination URL.
The tool page on tools.zerethon.com decodes that parameter entirely in your
browser using its existing client-side JavaScript — the value is never logged
on our server. Maximum size is 100 KB; longer selections are dropped.

## What the extension does NOT do
- Read or modify any webpage. There are no content scripts.
- Inject ads, affiliate links, or referral parameters into pages you visit.
- Run analytics. There is no Google Analytics, Mixpanel, Segment, Sentry, or
  any other telemetry SDK in the package.
- Access your browsing history, cookies, downloads, or bookmarks.
- Request the `<all_urls>` host permission. The only host permission is
  `https://tools.zerethon.com/*`.

## Permissions used and why
| Permission | Why |
|---|---|
| `storage` | Persist recents (local) and favorites (sync). |
| `contextMenus` | Add the six "Zerethon: …" right-click entries. |
| `sidePanel` | Let the launcher open in Chrome's side panel. |
| `host_permissions: https://tools.zerethon.com/*` | Fetch the tool catalog; open tools in a new tab. |

## Third parties
We do not sell, share, or transfer any user data to third parties. We do not
use user data to determine creditworthiness or for lending purposes. We do not
use user data for purposes unrelated to the extension's single purpose.

## Source
The extension is open-source. You can audit every line at
https://github.com/zerethonapp/extensions (license: MIT). Reproducible builds
(`npm run build`) produce the byte-identical zip submitted to the stores.

## Contact
Questions or requests: support@zerethon.com
