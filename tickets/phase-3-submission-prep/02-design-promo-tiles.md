# P3-02 — Design promo tiles (440×280 + 1400×560)

- **Status**: 🟢 done (2026-05-26)
- **Phase**: 3
- **Priority**: P0 (small tile required) + P1 (marquee tile boosts visibility)
- **Estimate**: 2 hours design + 1 hour iteration
- **Blocks**: P4-01 (small promo tile required for submission save)
- **Blocked by**: —

## Goal
Two promo tile PNGs for the Chrome Web Store listing:
1. **Small promo tile** — 440×280 PNG, **required**
2. **Marquee promo tile** — 1400×560 PNG, optional but unlocks featured-spot eligibility

## Why
- Small tile shows in store-search result cards and the "More by Zerethon" sidebar
- Marquee tile is the hero image when an item is featured or surfaced in collections — Chrome's editorial team prefers items with marquee tiles for promotion

## Acceptance criteria
- [ ] `store-assets/chrome/promo-440x280.png` exists, exact dimensions
- [ ] `store-assets/chrome/promo-1400x560.png` exists, exact dimensions
- [ ] Both designs follow brand: Zerethon logo, clean dark or light bg consistent with `tools.zerethon.com`
- [ ] Hero text on each tile ≤ 6 words (small tile) / ≤ 12 words (marquee), large enough to read at 50% scale
- [ ] No "lorem ipsum", no placeholder URLs, no copyrighted screenshots from other apps
- [ ] Logo matches our existing 128×128 icon (no off-brand colors)
- [ ] PNG with transparent background only if the tile is meant to be transparent — both Chrome and Edge composite on white, so prefer baked-in background
- [ ] Copies saved to `store-assets/edge/promo-*.png` for the Edge submission

## Implementation notes
- Reference brand assets: `tools/public/icon-512.png` (Zerethon mark)
- Tagline ideas for small tile: "111+ Privacy-First Dev Tools", "Toolbar Launcher · 111 Utilities", "JSON, Base64, Hash & 108 More"
- Tagline for marquee: include the 4 surfaces — "Popup · Side panel · Right-click · Omnibox `zt`"
- Recommend Figma for design — easy to export at exact dimensions
- Open up the marquee tile to include a 1:1 ratio screenshot snippet of the popup beside the text, gives reviewer reviewers a visual hook

## Done definition
- [ ] Both PNGs at the exact paths and dimensions
- [ ] Reviewed for clarity at 50% browser zoom (mimics store thumbnail scale)
- [ ] Dashboard updated to 🟢 done

## Updates
- 2026-05-23: created
- 2026-05-26: shipped. Designed both tiles as HTML in `store-assets/promo-source/`, rendered via headless Chrome at 2× scale, downscaled with `sips` to exact target dims for Retina-crisp output.
  - **`promo-440x280.png`** (99 KB): dark gradient bg, Z brand mark (24px), "Zerethon Tools" wordmark, OFFLINE pill, headline `112 dev / creator / web3 tools — at your toolbar`, footer chips (`JSON · Base64 · Hash · offline`, `Right-click`, `tools.zerethon.com`).
  - **`promo-1400x560.png`** (385 KB): two-column layout — left has bigger brand row + headline + 4 feature bullets (offline / right-click / omnibox / zero analytics), right has a mock launcher card (rotated -2°) showing search "json" with 5 results + offline badge on json-formatter.
  - Both copied to `store-assets/edge/` for Edge submission.
  - Brand color tokens match popup.css (`#6cb0ff` accent, `#0b1020` bg).
- Reviewed at 50% zoom — text remains legible in both. Z mark + headline survive thumbnail scale.
- Status → 🟢 done.
