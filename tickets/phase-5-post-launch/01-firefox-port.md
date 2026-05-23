# P5-01 — Firefox AMO port

- **Status**: ➖ deferred
- **Phase**: 5
- **Priority**: P3
- **Estimate**: 2-3 days
- **Blocks**: —
- **Blocked by**: P4-01 (have Chrome data to justify second-platform investment)

## Goal
Ship a Firefox-compatible build to Mozilla Add-ons (AMO). Same source tree, separate build target.

## Why
- ~3% browser market share globally, higher in some segments (privacy-conscious users, Linux)
- Firefox AMO review is free and largely automated for low-permission extensions
- Same source code; the divergence is in manifest format and a couple of API names

## When to revisit
Trigger this ticket when:
- Chrome + Edge install base ≥ 1,000 users
- Or we get ≥ 5 emails to `support@zerethon.com` asking for Firefox

## Differences from Chrome/Edge MV3
| Feature | Chrome / Edge | Firefox |
|---|---|---|
| Service worker | `background.service_worker` | `background.scripts: [...]` (event page) — Firefox MV3 has partial SW support but event-page is more reliable |
| Side panel | `side_panel` API | `sidebar_action` API (different shape) |
| Storage | `chrome.storage.*` | `browser.storage.*` (alias works if `webextension-polyfill` is loaded — we don't need the polyfill if we drop the `chrome.` prefix or `globalThis.browser ??= chrome`) |
| Omnibox | `chrome.omnibox` | `browser.omnibox` (same shape) |
| Manifest | one file | one file (mostly compatible, but `side_panel` becomes `sidebar_action`) |
| Source code submission | not required | **required** — AMO reviewer reads source; do not obfuscate or minify without sourcemaps |

## Acceptance criteria
- [ ] Add a `--env=firefox-prod` mode to `scripts/build.mjs` that:
  - Rewrites manifest: `background.service_worker` → `background.scripts: ["background.js"]`
  - Replaces `side_panel.default_path` with a `sidebar_action` block (icon, title, panel HTML)
  - Adds `browser_specific_settings.gecko.id` for AMO ID assignment
- [ ] Wrap `chrome.*` calls in a tiny adapter that falls back to `browser.*` if available (Firefox)
- [ ] Mozilla developer account created (free) at https://addons.mozilla.org
- [ ] Source code archive uploaded (tar of `extensions/src/` + build instructions)
- [ ] Submission approved and Public on AMO

## Implementation notes
- Reference: https://extensionworkshop.com/documentation/develop/porting-a-google-chrome-extension/
- Test locally first: Firefox Developer Edition → `about:debugging` → Load Temporary Add-on
- `web-ext` CLI is useful for Firefox-specific lint: `npx web-ext lint --source-dir=dist-firefox/`

## Done definition
- [ ] Listing live and public on AMO
- [ ] Listing URL added to landing page (P2-03)
- [ ] Dashboard updated to 🟢 done

## Updates
- 2026-05-23: created (deferred)
