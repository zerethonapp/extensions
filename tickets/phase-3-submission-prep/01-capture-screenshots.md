# P3-01 — Capture 5 screenshots (1280×800) from real Chrome

- **Status**: 🟡 plan
- **Phase**: 3 (submission prep)
- **Priority**: P0
- **Estimate**: 2-3 hours
- **Blocks**: P4-01 (Chrome submission form requires ≥1 screenshot; we ship 5)
- **Blocked by**: —

## Goal
Five 1280×800 PNG screenshots from a real Chrome window (clean profile, default Chrome theme) demonstrating the extension's value surfaces. No mockups — reviewers spot them.

## Why
Listing screenshots are the single biggest install-conversion driver in store search results. They also visually prove the extension's value-beyond-bookmark argument (context menu, side panel, omnibox) to reviewers reading the submission.

## Acceptance criteria
Five PNG files saved at `store-assets/chrome/screenshots/0{1..5}-1280x800.png`:

- [ ] **01** — Popup open over a Stack Overflow tab, search "json" filtered to 4 results. Shows real-world launcher use.
- [ ] **02** — Side panel docked right, tool list visible, main tab is a GitHub PR or similar. Shows side-panel UX.
- [ ] **03** — Right-click context menu open over a selected base64 string on a webpage, all 6 "Zerethon: …" entries visible.
- [ ] **04** — Address bar showing "zt regex" with omnibox suggestions dropdown rendering ~5 matching tools.
- [ ] **05** — `chrome://extensions` showing Zerethon Tools card with **0 warnings**, permission list visible (only 3 perms).

Each screenshot:
- [ ] Exactly 1280×800 (not 1280×802 — Chrome submission rejects off-by-one)
- [ ] PNG, RGBA, no metadata cruft (strip with `exiftool -all=` or `oxipng -strip all`)
- [ ] Captured from a clean Chrome profile (no other extensions, no bookmark bar clutter)
- [ ] No personal data visible (use anonymous sample text, no real emails / tokens)
- [ ] No dark-mode + light-mode mix — pick one (recommend light for store consistency)

## Implementation notes
- Use `Cmd+Shift+5` on macOS for region capture, then crop with Preview or Sips to exact 1280×800
- Or use `chrome --window-size=1280,800 --new-window` + Cmd+Shift+4 (Spacebar) for window capture
- Need real prod extension build OR local build with same UI — either works
- For #5, build prod, install, take screenshot; the warning-free state is what reviewers want to see
- Save in `store-assets/chrome/screenshots/` (already gitignored from zip)

## Done definition
- [ ] All 5 files at the exact path + dimensions
- [ ] Each visually proves the corresponding surface
- [ ] Saved a copy in `store-assets/edge/screenshots/` too (same files work for Edge listing)
- [ ] Dashboard updated to 🟢 done

## Updates
- 2026-05-23: created
