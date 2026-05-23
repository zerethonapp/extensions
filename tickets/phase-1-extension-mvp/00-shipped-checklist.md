# P1-00 — Extension MVP shipped (retrospective)

- **Status**: 🟢 done
- **Phase**: 1
- **Priority**: P0
- **Shipped**: 2026-05-23
- **Build artifact**: `zerethon-tools-v0.1.0.zip` (~30 KB, 18 files)
- **Verify**: `npm run verify` exits 0 (8/8 checks pass)

## What shipped (Option A — Companion Launcher)

### Code
- [x] Repo scaffold + `.gitignore` + `package.json` (no runtime deps)
- [x] `src/manifest.json` — Manifest V3, 3 permissions (`storage`, `contextMenus`, `sidePanel`), 1 host (`tools.zerethon.com`), CSP locked
- [x] `src/background.js` — service worker: 6 context-menu entries with URL-safe base64 prefill via `buildToolUrl()`, omnibox suggestions, message router
- [x] `src/popup/` (380×560 → bumped to 400×560 by user post-ship) + `src/sidepanel/` — share `lib/launcher.js` (vanilla JS view)
- [x] `src/lib/tools-registry.js` — all 112 live tools, regenerable via `npm run sync`
- [x] `src/lib/recents.js` (chrome.storage.local, max 8)
- [x] `src/lib/favorites.js` (chrome.storage.sync, max 50)
- [x] `src/lib/config.js` — build-time BASE_URL + IS_DEV toggle
- [x] `src/_locales/en/messages.json` + `src/_locales/vi/messages.json`
- [x] `src/icons/{16,48,128}.png` — resized from `tools.zerethon.com/icon-512.png`

### Browser-native UX surfaces (the "not a wrapper" proof)
- [x] Popup launcher with search, favorites★, recents, category grouping
- [x] Side panel (Chrome 114+) — same launcher, full height
- [x] Context menu — 6 entries on selected text (json-formatter, base64 encode/decode, hash, text-case, url-parser)
- [x] Omnibox keyword `zt` with live suggestions
- [x] Keyboard shortcut Ctrl+Shift+Z / Cmd+Shift+Z
- [x] DEV banner in launcher when `IS_DEV = true`

### Build pipeline
- [x] `scripts/build.mjs` — whitelist copy `src/` → `dist/` + zip; supports `--env=prod|local`
- [x] `scripts/verify-package.mjs` — 8-point pre-submission lint
- [x] `scripts/sync-tools-registry.mjs` — refresh registry from live BE
- [x] `npm run build:prod` → prod zip
- [x] `npm run build:local` → local-BE zip with " (DEV)" suffix in name + orange DEV bar

### Docs (paste-ready for store dashboard)
- [x] `docs/PERMISSIONS.md` — per-permission justification text
- [x] `docs/PRIVACY.md` — source for hosted privacy policy
- [x] `docs/LISTING.md` — title / tagline / description / screenshots brief / data-handling certification
- [x] `README.md` — install + dev loop + build modes
- [x] `PLAN.md` — strategy, anti-rejection checklist, BE work blockers, timeline

### Bugfix post-install
- [x] Badge driven from `BUNDLED_SLUGS.has(slug)` (runtime truth), not `t.bundled` flag (registry hint) — fixes the "fake offline" badge for the 15 v0.2 candidates

## What was deliberately NOT built (vs original PLAN draft)
- ❌ Bundling 15 tools offline → pivoted to Option A (per market analysis). Candidate list preserved in PLAN §2.1, set picked from real usage data in Phase 6.
- ❌ Alpine dependency → not needed without bundled tools. Eliminates CSP risk entirely.
- ❌ Tool shell helpers (`src/tools/_shell/`) → reserved for v0.2.

## Validation
- ✅ `npm run verify` 8/8 green
- ✅ `npm run build:prod` produces 29.9 KB zip
- ✅ `npm run build:local` produces 29.9 KB zip with DEV suffix
- ✅ User installed local build in Chrome and confirmed launcher renders, search filters, favorites/recents work, badge bug fixed

## Reference
- [PLAN.md](../../PLAN.md) §1-16 — full strategy
- [docs/PERMISSIONS.md](../../docs/PERMISSIONS.md) — submission text
- [src/manifest.json](../../src/manifest.json)
