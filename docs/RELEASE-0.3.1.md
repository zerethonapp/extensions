# Release 0.3.1 — Smart Context Router

Status: **Ready to Submit** (not submitted). Upgrade of the existing listing
`mdbcbnalkhjogllppjkenlecankpeomk`. Same item, same ID; no new listing.

Package: `extensions/zerethon-tools-v0.3.1.zip` (built by `npm run build:prod`).

0.3.1 replaces the 0.3.0 package (never published): selected code kept its line breaks only
in tests, not in real Chrome, because `info.selectionText` collapses whitespace. 0.3.1 reads the
real selection on click (`activeTab` + `scripting`), so code, comments and indentation arrive intact.

## Release notes (paste into the dashboard "What's new" if asked)

- New "Zerethon Tools" right-click menu. Its first entry opens your selection in
  the best tool: a link, email address or phone number goes to the QR Code
  Generator in the right mode; JSON to the JSON Formatter; Base64 to the decoder;
  source code to Zerethon IDE with the language detected (PHP, JavaScript,
  TypeScript, Python, Java, C, C++, Go, Rust, SQL, Bash); other text to a QR code.
- New manual entries: Create QR Code, Open in IDE, All Tools. The existing ones
  (Format JSON, Encode/Decode Base64, Hash, Convert case, Parse URL) stay.
- Detection runs locally with simple rules: no AI, no network request.
- Selected text now travels in the URL fragment (`#…`), which browsers never send
  to a server (0.2.0 used the query string).
- Selected code keeps its line breaks, indentation and comments.
- Selections over 100 KB are no longer silently dropped: the tool opens and says
  to paste the text instead.

## Must happen BEFORE submitting

The receiving sites must understand the fragment, or prefill silently stops working
for users who update:

1. Deploy **tools.zerethon.com** with the fragment decoder (`resources/js/app.js`
   `zrDecodePrefill`), QR prefill and updated extension privacy page.
2. Deploy **Zerethon IDE** with the `#code=` hand-off (`resources/js/ide/handoff.js`).
3. Check: `https://tools.zerethon.com/extension/privacy` mentions `#input=…` and
   ide.zerethon.com.

Both sites keep accepting 0.2.0's `?input=` links, so deploying them first is safe.

## Permissions — two added, neither shows a warning

`storage`, `contextMenus`, `sidePanel`, **`activeTab`**, **`scripting`**, host
`https://tools.zerethon.com/*`. Chrome shows no install/update warning for
`activeTab` or `scripting`, so existing users are not disabled on update. Still no
content script and no `<all_urls>`. Why they are needed: Chrome's
`info.selectionText` collapses line breaks; reading `window.getSelection()` in the
clicked tab (only on a menu click) is the only way to get code intact. Opening
ide.zerethon.com is a plain `chrome.tabs.create` navigation.

Dashboard → Privacy practices: replace the `contextMenus` justification and add
the new `activeTab` and `scripting` justifications from [`PERMISSIONS.md`](PERMISSIONS.md).

## Store listing changes

From [`LISTING.md`](LISTING.md): new short summary, the "BROWSER-NATIVE
SHORTCUTS" right-click bullet, the privacy bullet about the URL fragment, and
the "Website content" data-type note. Re-capture screenshot #3 (new submenu).
Manifest description changed (`_locales/*/messages.json` → `ext_description`).

## Backward compatibility

- Storage untouched: `recents_v1` (local) and `favorites_v1` (sync) keep their
  keys and shape; no migration needed.
- Context menus are rebuilt in `onInstalled` (fires on update), so 0.2.0's six
  top-level entries are replaced by the submenu; ids `zt-json`, `zt-b64dec`,
  `zt-b64enc`, `zt-hash`, `zt-case`, `zt-url` keep their meaning.
- Popup, side panel, omnibox, offline tools: no code changes.

## QA report

Automated (run 2026-10-31):

| Check | Result |
|---|---|
| `npm test` — classifier + router + selection (38 tests: real-selection read with fallbacks, CRLF/no-break-space normalization, Collatz starter round-trip, URL/email/phone/JSON/Base64, 14 languages, prose false positives, 1 MB selection < 500 ms, fragment round-trip incl. Vietnamese/emoji, oversize flag, registry coverage) | pass |
| `npm run verify` (10 pre-submission checks) | pass |
| `npm run build:prod` → zip contains manifest 0.3.1, prod `BASE_URL`/`IDE_URL`, permissions as listed above | pass |
| Service worker with stubbed `chrome.*`: menu tree built, smart/manual clicks open the right URLs, omnibox still opens tools | pass |
| tools.zerethon.com: PHPUnit 575 tests, `npm run test:js` 28 tests, `vite build`, Pint | pass |
| Zerethon IDE: `npm run test:js` 29 tests, `vite build`, PHPUnit Release/Locale/Page filters | pass |
| Headless Chromium against local dev sites: QR text (Vietnamese + emoji) and phone prefill select the mode and render the preview; fragment cleared; reload does not re-apply; `#prefill=too_large` toast; IDE opens Python with the code; `language=auto` shows the language picker and opens the chosen runtime; homepage QR box on desktop + 390 px with no horizontal scroll | pass |

Manual, in real Chrome (not done — needs a person with the unpacked build):

- [ ] Fresh install of `dist/`: right-click a selection → submenu shows; each entry opens the right page.
- [ ] Upgrade: install the 0.2.0 zip, star favorites, open some tools, then load 0.3.1 over it (same unpacked folder, "Update") → favorites/recents still there, old top-level entries gone.
- [ ] Multi-line code selection (e.g. the Collatz starter on ide.zerethon.com/research/collatz-conjecture?tab=explore) → Open in IDE keeps every line, indentation and comment.
- [ ] Selection inside a textarea; selection on a chrome:// page (falls back to the collapsed text).
- [ ] Popup, side panel, `zt` omnibox, Ctrl/Cmd+Shift+Z, the three offline tools.
- [ ] `docs/SMOKE-TEST.md` end-to-end on a clean profile.

## Chrome Web Store compliance checklist

- [x] Manifest V3, version bumped 0.2.0 → 0.3.1, same item ID
- [x] Only warning-free permissions added (activeTab, scripting), each justified; no new host, no content scripts
- [x] CSP unchanged (`script-src 'self'`), no remote code, no eval (verify script)
- [x] No AI/LLM/classification API; no network request on menu click besides opening the tab the user asked for
- [x] Selected text not stored, not logged, carried only in the URL fragment
- [x] Privacy policy (site + `docs/PRIVACY.md`) and data-use disclosure updated to say so
- [x] No new third-party dependencies
- [x] Single purpose unchanged (launcher + toolkit for Zerethon tools)

## Submit (manual — no publishing credentials here)

1. Finish "Must happen BEFORE submitting" above.
2. `cd extensions && npm run verify && npm test && npm run build:prod`.
3. https://chrome.google.com/webstore/devconsole → **Zerethon Tools** → Package → **Upload new package** → `zerethon-tools-v0.3.1.zip`. Confirm version 0.3.1 and the 5 permissions (storage, contextMenus, sidePanel, activeTab, scripting) + 1 host.
4. Store listing: apply the changes listed above; upload the new screenshot #3.
5. Privacy practices: paste the new `contextMenus` justification; keep "Website content" declared.
6. **Submit for review.** Status becomes *Pending review*. Do not report it as approved until Google approves it.
7. Edge Add-ons (if the Edge listing exists): same zip via Partner Center.
