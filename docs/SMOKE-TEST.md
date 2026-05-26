# Pre-submission Smoke Test

Run this **once on a clean Chrome profile** before clicking Submit in P4-01.
Every box that doesn't tick is a potential rejection reason.

```bash
# Fresh profile (no other extensions, no bookmarks, default theme)
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --user-data-dir=/tmp/zr-smoke --new-window
```

Then `chrome://extensions` → Developer Mode → Load Unpacked → pick `extensions/dist/`.

Make sure it's the **prod build**:
```bash
cd /Users/leeseawuyhs/MyData/MyProject/Social/extensions
npm run verify && npm run build:prod
```

---

## 1 — Install state (the chrome://extensions card)

- [ ] Card shows: **Zerethon Tools**, version **0.2.0**, source **Loaded unpacked**
- [ ] **0 errors**, **0 warnings** (no orange "Errors" button)
- [ ] Permissions list visible after Details: **storage**, **contextMenus**, **sidePanel**
- [ ] Site access: **On specific sites** → only `tools.zerethon.com`
- [ ] Toolbar icon renders crisply at 16×16 on a Retina display

## 2 — Popup launcher (click toolbar icon)

- [ ] Opens within ~200 ms, no visible spinner / flash of unstyled content
- [ ] Search input is auto-focused
- [ ] Type `json` → list filters to ~7 results
- [ ] Counter shows `7 / 112` (or whatever the registry currently has)
- [ ] `JSON Formatter` row shows the blue **offline** badge
- [ ] Other JSON tools (`JSON Diff`, `JSON to CSV`, …) show the `↗ web` badge
- [ ] Click ★ on a tool → row stays put with star filled
- [ ] Re-open popup → tool appears in **Favorites** section
- [ ] Click a tool → opens correct URL in a new tab:
  - Bundled: `chrome-extension://<id>/tools/<slug>/index.html?src=launcher`
  - Link-out: `https://tools.zerethon.com/<slug>?ref=ext&src=launcher`
- [ ] Popup auto-closes after click
- [ ] After opening 3 different tools, reopen popup → all 3 appear in **Recent**
- [ ] Empty search shows category groupings: **Developer / Creator / Web3**
- [ ] Clear search → favorites + recents reappear on top
- [ ] No tool shows a wrong badge (only the 3 bundled slugs should say offline)

## 3 — Bundled offline tools (the v0.2 differentiator)

For each of **json-formatter / base64-encoder / hash-generator**:

- [ ] Top bar shows **Z brand mark + "Zerethon Tools" + tool name + OFFLINE pill + "Open on web ↗"**
- [ ] Brand link opens `tools.zerethon.com` in new tab when clicked
- [ ] Settings bar present (Indent / Mode toggle / Sort keys / etc. as appropriate)
- [ ] Both panes have toolbars with icon buttons (Copy / Fullscreen / etc.)
- [ ] Click the icon button(s) → action works (copy → green flash, fullscreen → fills viewport)
- [ ] **Esc** exits fullscreen
- [ ] Click **Open on web ↗** with content in input → destination URL has `?input=<base64>` (right-click the link → "Copy link address" to verify)

### Specific to JSON Formatter
- [ ] Click `Sample` → loads sample JSON, immediately formats
- [ ] Switch `Indent` 2 → 4 → Tab → output reformats
- [ ] Toggle `Sort keys` → keys sort recursively
- [ ] Switch `Pretty` → `Minified` → output collapses to one line
- [ ] Switch to `Tree` → tree renders **inside the same pane** (not pushed below), nodes collapse via `▾` click
- [ ] Type invalid JSON (e.g. `{"a": }`) → red error banner shows `line N, column M`, **line N is highlighted red in the input gutter**
- [ ] Stats strip shows `Root / Keys / Depth / Values` for valid JSON
- [ ] **Cmd+Enter** re-formats; **Esc** exits fullscreen
- [ ] **Airplane-mode test**: DevTools → Network tab → tick **Offline** → keep formatting JSON → still works, no failed requests

### Specific to Base64 Encoder
- [ ] Encode "hello" → `aGVsbG8=`; Decode `aGVsbG8=` → "hello"
- [ ] URL-safe checkbox flips `+`/`/` to `-`/`_`
- [ ] **Swap** button swaps input ↔ output and flips Encode/Decode
- [ ] Input label flips "Plain text" ↔ "Base64" with mode
- [ ] UTF-8 / emoji round-trip cleanly: encode "🚀 hôm nay" → decode → identical

### Specific to Hash Generator
- [ ] SHA-256 of "abc" → `ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad`
- [ ] Switch algorithm SHA-1 / SHA-384 / SHA-512 → output recomputes
- [ ] Output encoding `hex (lower)` / `hex (upper)` / `base64` / `base64 url-safe` all work
- [ ] Click `Open MD5 on web ↗` → opens `tools.zerethon.com/md5-hash-generator?…&input=<base64>` (with current input prefilled)

## 4 — Side panel

- [ ] Right-click toolbar icon → menu has **Open side panel**
- [ ] Side panel opens on the right edge, persists while switching tabs
- [ ] Same launcher UI as popup but full height
- [ ] Search / favorites / recents all work in side panel

## 5 — Context menu (6 entries)

Open https://en.wikipedia.org/wiki/JSON, select some text (e.g. `{"name": "value"}`).

Right-click → there should be a **Zerethon Tools** submenu with exactly 6 entries:

- [ ] **Zerethon: Format as JSON** → opens `tools.zerethon.com/json-formatter` with selected text decoded into input box (P2-02 prefill)
- [ ] **Zerethon: Decode Base64** → base64-encoder with `?mode=decode`
- [ ] **Zerethon: Encode Base64** → base64-encoder with `?mode=encode`
- [ ] **Zerethon: Hash (SHA-256)** → hash-generator
- [ ] **Zerethon: Convert case…** → text-case-converter
- [ ] **Zerethon: Parse URL** → url-parser

For each: verify the input box on the destination page is **prefilled** with the text you selected.

Edge cases:
- [ ] Select multi-byte UTF-8 (emoji, CJK) → prefill renders correctly without mojibake
- [ ] Select > 100 KB text → tool opens **without** `?input=` (size capped), no errors in console
- [ ] Right-click with **no selection** → no Zerethon entries (these are selection-context only)

## 6 — Omnibox keyword

- [ ] Click address bar, type `zt` + space → dropdown changes to "Search Zerethon Tools — type a tool name, press Enter to open"
- [ ] Continue typing `zt regex` → ≤ 8 live suggestions appear, each showing **tool name — category** (and `· offline` if bundled)
- [ ] Press **Enter** on the highlighted suggestion → opens that tool with `?src=omnibox`
- [ ] Enter on a query with no match (e.g. `zt zzz`) → opens `tools.zerethon.com/?ref=ext&q=zzz`

## 7 — Keyboard shortcut

- [ ] **Cmd+Shift+Z** (Mac) / **Ctrl+Shift+Z** (Win/Linux) → popup opens
- [ ] `chrome://extensions/shortcuts` → shortcut configurable

## 8 — Locale switching

- [ ] Set Chrome language → Vietnamese (Settings → Languages → move Tiếng Việt to top → relaunch)
- [ ] Reopen popup → all strings render in Vietnamese:
  - Search placeholder
  - Section titles (Yêu thích / Mới dùng / Kết quả)
  - Badge tooltips
  - Footer hint
  - Context-menu entries (right-click selection again)

## 9 — Privacy / network audit

- [ ] `chrome://extensions` → click **service worker** under "Inspect views" → DevTools opens for the SW
- [ ] DevTools → Network tab → leave it open while you click around in popup
- [ ] **No requests fire on launcher use**. Only request you should see is the daily `GET https://tools.zerethon.com/api/internal/tools.json` (or nothing if cached)
- [ ] Open the popup HTML in a new tab via `chrome-extension://<id>/popup/popup.html` → Sources tab → confirm **no third-party scripts** loaded (no GA, no Mixpanel, no Sentry, no fonts.googleapis, nothing)
- [ ] Open `https://tools.zerethon.com/extension/privacy` → returns 200 with the privacy policy content (matches `docs/PRIVACY.md`)

## 10 — Build artefact

- [ ] `npm run build:prod` produces `zerethon-tools-v0.2.0.zip`
- [ ] Zip is **< 100 KB** (current ~48 KB)
- [ ] Unzip into a temp dir and inspect — no `.DS_Store`, no `node_modules`, no `.git`, no `docs/`, no `tickets/`, no `*.md` (other than implicit MIT license)
- [ ] manifest.json shows `version: "0.2.0"`, 3 permissions, 1 host, locked CSP

---

## After this passes

Move to P4-01 — paste-ready walkthrough is in [`docs/SUBMIT.md`](SUBMIT.md).
