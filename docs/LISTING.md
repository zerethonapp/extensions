# Store Listing Copy

Paste-ready text for Chrome Web Store and Microsoft Edge Add-ons dashboards.

---

## Title (≤ 75 chars)
> Zerethon Tools — Offline JSON, Base64, Hash + Launcher for 109 More

## Short summary / tagline (≤ 132 chars)
> 3 tools run offline (JSON / Base64 / Hash) + a launcher for 109 more. Right-click prefill, omnibox keyword zt, no analytics.

## Category
- Chrome: Developer Tools
- Edge: Developer tools

## Languages
- English (en) — default
- Vietnamese (vi)

## Full description (paste verbatim — plain text, line breaks preserved)

```
Zerethon Tools is a privacy-first toolkit + launcher for 112 free dev,
creator, and web3 utilities. Three of the most-used tools run FULLY OFFLINE
inside the extension — no network access, no data leaves your device.

THREE TOOLS RUN OFFLINE (no internet required)
• JSON Formatter — pretty / minify, indent control, sort keys, line+column
  error reporting.
• Base64 Encoder & Decoder — UTF-8 safe, URL-safe variant, swap input↔output
  in one click.
• Hash Generator — SHA-1 / SHA-256 / SHA-384 / SHA-512 via the browser's
  Web Crypto API. Hex (lower/upper), Base64, or Base64 URL-safe output.

Open these from the launcher or right-click selected text on any page —
the text is prefilled, ready to format/encode/hash. No network call, no
log on our server. Airplane-mode safe.

109 MORE TOOLS — ONE CLICK AWAY
Open as new tabs on tools.zerethon.com. The launcher searches all 112 by
name, slug, or keyword. A few examples:
SQL Formatter · UUID Generator · URL Parser · Color Converter · Markdown
to HTML · CSV to JSON · YAML to JSON · Unix Timestamp Converter · UTM
Builder · Regex Data Generator · Password Generator · Lorem Ipsum · Text
Case Converter · Image Compressor · ETH Unit Converter · Wallet Address
Validator · MD5 Hash Generator · …

BROWSER-NATIVE SHORTCUTS
• Right-click selected text → "Zerethon: Format as JSON / Decode Base64 /
  Encode Base64 / Hash (SHA-256) / Convert case / Parse URL". For the three
  offline tools the text is prefilled in the extension's own page. For the
  rest, the matching tool opens on tools.zerethon.com.
• Type "zt" in the address bar → autocomplete any of 112 tools.
• Pin the launcher to Chrome's side panel — keep it visible while browsing.
• Ctrl+Shift+Z (Cmd+Shift+Z on Mac) opens the launcher. Customise the
  shortcut in chrome://extensions/shortcuts.

PRIVACY (READ THIS — IT IS THE WHOLE POINT)
• Zero analytics, zero telemetry, zero third-party SDKs.
• Three permissions only — storage, contextMenus, sidePanel — plus a single
  host: tools.zerethon.com. No <all_urls>, no content scripts.
• Favorites and recents are stored on your device only.
• Selected text is never logged on our server. Either it stays inside the
  extension (offline tools) or it travels in a URL query parameter that
  the destination tool decodes client-side.
• Full source MIT-licensed on GitHub. The submitted package is built
  reproducibly from source with `npm run build` — you can audit every
  line and rebuild the same zip locally.

NO ADS. NO PAYWALL. NO SUBSCRIPTION. NO SIGNUP.

Source: https://github.com/zerethonapp/extensions
Privacy policy: https://tools.zerethon.com/extension/privacy
Questions, requests, bug reports: support@zerethon.com
```

## Single purpose declaration (Chrome dashboard, 1 sentence)
> A privacy-first toolkit and launcher for the 112 free utilities at
> tools.zerethon.com — three tools (JSON Formatter, Base64 Encoder, Hash
> Generator) run fully offline inside the extension, and the rest open via
> a searchable popup, side panel, right-click context menu, or omnibox keyword.

## Data Handling Certification (3 tick-boxes)
- [x] I do not sell or transfer user data to third parties, outside of the
      approved use cases.
- [x] I do not use or transfer user data for purposes unrelated to my item's
      single purpose.
- [x] I do not use or transfer user data to determine creditworthiness or for
      lending purposes.

## Data types declared
- **Personally identifiable info**: None
- **Health info**: None
- **Financial info**: None
- **Authentication info**: None
- **Personal communications**: None
- **Location**: None
- **Web history**: None
- **User activity**: None
- **Website content**: YES — only when the user explicitly invokes a
  context-menu entry on selected text. The text is encoded into the
  destination URL and decoded client-side; it is never stored or transmitted
  to a Zerethon server.

## Privacy policy URL
> https://tools.zerethon.com/extension/privacy

## Homepage URL
> https://tools.zerethon.com/extension

## Support email
> support@zerethon.com

---

## Screenshots brief (5 × 1280×800 PNG)

| # | Scene | Why |
|---|---|---|
| 1 | Popup open over any tab, search "json" filtered to ~4 results — json-formatter row shows the blue "offline" badge | First-impression visual + proves bundled-vs-link distinction |
| 2 | The bundled **JSON Formatter** tool open in a new tab with a 50-line payload formatted; Chrome DevTools Network panel visible in background showing "Offline" toggle ON | Proves offline claim demonstrably |
| 3 | Right-click context menu open over a selected base64 string, all 6 "Zerethon: …" entries visible | Proves browser-native value |
| 4 | Address bar showing "zt json" with omnibox suggestions dropdown (json-formatter + json-diff + …) | Proves keyboard-first UX |
| 5 | chrome://extensions showing Zerethon Tools with 0 warnings, permission list (storage, contextMenus, sidePanel) + single host tools.zerethon.com visible | Reviewer-friendly: shows minimum permissions |

Capture all 5 with real Chrome on a clean profile. Do not use mockups.
Screenshot #2 is the key differentiator — visually proves the "runs offline" claim that the tagline makes.

## Promo tiles
- Small promo tile: 440×280 PNG (required)
- Marquee promo tile: 1400×560 PNG (optional but boosts visibility)
