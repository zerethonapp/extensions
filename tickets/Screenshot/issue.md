chrome-extension://odbeibomjnkagemmanpoilknnpaipbcm/tools/json-formatter/index.html?src=launcher
-> Cần toolbard giống với live site.
-> Trên offline cho tool này cân tính chiều cao của inout min-height: calc(100vh - top)

Cần review lại ui trên cho các offline khác

---

## Resolved (2026-05-24)

### Topbar match live site
- Added `Z` brand mark (24×24, brand-blue, white "Z") + "Zerethon Tools" text mirroring `tools/resources/views/partials/header.blade.php` lines 8-11.
- Topbar now `position: sticky` + `backdrop-filter: blur(8px)` + translucent background (matches site's `bg-white/80 backdrop-blur` pattern).
- Tool title gets a vertical divider before it (separates brand from page-specific title).
- "Open on web ↗" + OFFLINE pill kept on the right.
- Brand link opens `tools.zerethon.com/?ref=ext&src=bundled-brand` in new tab.

### Textarea fills viewport
- Flex chain: `body` (flex column, min-height 100vh) → `.zt-page` (flex 1, flex column) → `.zt-grid` (flex 1, min-height 0) → `.zt-pane` (flex column, min-height 0) → `.zt-textarea` (flex 1).
- Floor: `min-height: 240px` (so it stays usable on tiny windows).
- Resize handle removed (`resize: none`) since flex layout drives the height.
- `min-height: 0` on intermediate flex children is the critical bit — without it CSS uses default min-content which prevents the textarea from shrinking inside its parent.

### Applied automatically
All 3 bundled tools (`json-formatter`, `base64-encoder`, `hash-generator`) share `_shell/shell.css` + `mountTopbar()` → no per-tool edits needed.

### Build verification
- `npm run verify` → 9/9 ✓
- shell.css 7.4 KB (was 4.5 KB; +3 KB for sticky brand bar + flex chain).
- Total dev zip 40.1 KB (was 39.3 KB; budget 100 KB — comfortable).

Ready to screenshot again.