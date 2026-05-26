# P3-03 — Final QA smoke test (every surface, both i18n locales)

- **Status**: 🟡 plan — paste-ready 10-section checklist in [`docs/SMOKE-TEST.md`](../../docs/SMOKE-TEST.md). Run through it once on a clean Chrome profile before submitting.
- **Phase**: 3
- **Priority**: P0
- **Estimate**: 2 hours
- **Blocks**: P4-01 (do not submit until this passes)
- **Blocked by**: P2-01, P2-02 (context-menu UX value requires prefill to land)

## Goal
End-to-end smoke test the prod build (`npm run build:prod` → load `dist/`) on a clean Chrome profile, verifying every surface in both EN and VI locales, against the live `tools.zerethon.com` BE.

## Why
Reviewers occasionally test on a clean profile — anything broken on first install gets rejected as "non-functional". This also catches any regression introduced after the v0.1 ship (e.g., the badge bug we caught post-install).

## Acceptance criteria
Run on a fresh Chrome profile (`chrome --user-data-dir=/tmp/zr-test-profile`) with default settings, default theme. Install the v0.1.0 prod zip. Then verify:

### Install
- [ ] `chrome://extensions` card shows: 0 warnings, 0 errors, version 0.1.0, only 3 permissions listed, only `tools.zerethon.com` under "Site access"
- [ ] Toolbar icon renders (16×16) and is crisp on a Retina display

### Popup launcher
- [ ] Opens on icon click in ≤ 200 ms (subjective; no spinner)
- [ ] Search input is auto-focused
- [ ] Typing "json" filters to ~5 results
- [ ] Counter at top right shows `5 / 112` (or whatever total registry has)
- [ ] Click a tool → opens in new tab → URL is `https://tools.zerethon.com/<slug>?ref=ext&src=launcher`
- [ ] Popup closes automatically on tool open
- [ ] Click ★ on a tool → row stays put with star filled; reopen popup → tool appears in "Favorites" section
- [ ] After opening 3 different tools, reopen popup → all 3 appear in "Recent" section in MRU order
- [ ] Empty search shows category groupings: Developer / Creator / Web3
- [ ] No tool has a "offline" badge (Option A — all should be `↗ web`)

### Side panel
- [ ] Right-click icon → "Open side panel" works
- [ ] Side panel renders identically to popup but full height
- [ ] Same search / favorites / recents work in side panel
- [ ] Side panel persists when switching tabs

### Context menu
- [ ] Select text "hello world" on any webpage → right-click → 6 "Zerethon: …" entries visible:
  - Format as JSON
  - Decode Base64
  - Encode Base64
  - Hash (SHA-256)
  - Convert case…
  - Parse URL
- [ ] Each opens the correct tool on `tools.zerethon.com/<slug>?…&input=<base64>&src=ctx`
- [ ] **After P2-02 lands**: each tool's input box is pre-filled with the selected text
- [ ] Selecting multi-byte UTF-8 (`hôm nay 🚀`) → tool prefill renders correctly without mojibake
- [ ] Selecting >100 KB text → tool opens without `?input=` (dropped); no errors

### Omnibox
- [ ] Type `zt ` in address bar → default suggestion "Search Zerethon Tools…"
- [ ] Type `zt regex` → ≤ 8 live suggestions, each showing name + category
- [ ] Press Enter on a suggestion → opens that tool with `?src=omnibox`
- [ ] Enter on no-match keyword → opens `tools.zerethon.com/?ref=ext&q=<query>`

### Keyboard shortcut
- [ ] Cmd+Shift+Z (Mac) / Ctrl+Shift+Z (Win/Linux) → popup opens
- [ ] Shortcut configurable in `chrome://extensions/shortcuts`

### Locale switching
- [ ] Set Chrome browser language to Vietnamese, restart Chrome, reopen popup
- [ ] All UI strings render in Vietnamese (search placeholder, section titles, badge tooltips, footer hint, context-menu entries)

### Privacy / network
- [ ] Open `chrome://extensions` → click "service worker" inspect → Network tab → no requests to anywhere except `tools.zerethon.com` (and only when extension explicitly fetches the catalog)
- [ ] Inspect popup → no analytics SDK scripts, no third-party requests
- [ ] Privacy policy URL `https://tools.zerethon.com/extension/privacy` returns 200 (P2-01 dependency)

## Done definition
- [ ] All checks above passed
- [ ] Any failure → file a bug ticket and fix before resuming
- [ ] Dashboard updated to 🟢 done
- [ ] QA pass timestamp + build version recorded in this ticket's Updates section

## Updates
- 2026-05-23: created
