# P6-02 — Port 5-10 tools to vanilla JS offline

- **Status**: 🟡 plan
- **Phase**: 6
- **Priority**: P2
- **Estimate**: 2-4 days (depends on count)
- **Blocks**: P6-03 (release)
- **Blocked by**: P6-01 (final tool list)

## Goal
Implement the offline versions of the 5-10 tools chosen in P6-01. Each runs entirely inside the extension, no network access required.

## Why
Real offline tools — running with airplane mode on — turn the listing claim "privacy-first" from a promise into a demonstration. Strongest competitive moat vs single-tool extensions.

## Acceptance criteria
For each ported tool:

- [ ] `src/tools/<slug>/index.html` — minimal HTML shell, imports `tool.js` as ES module
- [ ] `src/tools/<slug>/tool.js` — vanilla JS implementation (no Alpine, no external libs)
- [ ] Tool reads `?input=<urlsafe-base64>` query (same algorithm as the website P2-02 partial) for context-menu prefill
- [ ] Tool reads `?mode=…` query for tools that have modes (`base64-encoder`)
- [ ] All output computed locally; no `fetch()` to anything except `tools.zerethon.com` (allowed by CSP `connect-src`)
- [ ] Layout matches the website tool view's UX (don't introduce a new design language)
- [ ] Works with airplane mode on — test by toggling Chrome offline
- [ ] Bundle increases by < 10 KB per tool (the whole extension stays < 100 KB total)

Cross-cutting:

- [ ] `src/tools/_shell/shell.css` — shared minimal styles (one stylesheet, ~3 KB max). Subset of website Tailwind utilities, hand-written.
- [ ] `src/tools/_shell/shell.js` — shared helpers (copy-to-clipboard, toast, prefill decoder reused)
- [ ] `BUNDLED_SLUGS` in `tools-registry.js` lists exactly the ported slugs
- [ ] `build.mjs` `INCLUDE` whitelist updated to ship the `tools/` files
- [ ] `verify-package.mjs` adds a check that for every slug in `BUNDLED_SLUGS`, the corresponding `tools/<slug>/index.html` exists in `src/`
- [ ] All ported tool views are reachable via `chrome.runtime.getURL('tools/<slug>/index.html')` — confirm by opening that URL directly
- [ ] Launcher (popup + side panel) auto-shows "offline" badge for these (already works via runtime BUNDLED_SLUGS lookup since the P1 bugfix)

## Implementation notes
- Source of truth for each tool's algorithm: `tools/resources/js/tools/<slug>.js` (already self-contained Alpine, just translate the math/state to vanilla JS)
- Keep each tool < 200 lines of JS — if it gets bigger, the website version is better and we should NOT port it
- DOM patterns: use a tiny `h(tag, attrs, ...children)` helper instead of innerHTML strings for safety against XSS in prefilled inputs
- For each ported tool, also add a small "Open full version" link at the bottom that points to the website (`tools.zerethon.com/<slug>`) — gives users an escape hatch for advanced features we don't port
- Test order: port one tool first (e.g., `base64-encoder`), iterate the shell + verify lint, then bulk-port the rest using the same template

## Done definition
- [ ] All ported tools open from launcher and produce correct output
- [ ] All work with Chrome network throttled to Offline
- [ ] Context-menu entries work end-to-end with prefill
- [ ] `npm run verify && npm run build:prod` exits 0 and zip stays < 100 KB
- [ ] Dashboard updated to 🟢 done

## Updates
- 2026-05-23: created
