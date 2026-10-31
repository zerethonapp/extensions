# Store Listing Copy

Paste-ready text for Chrome Web Store and Microsoft Edge Add-ons dashboards.

---

## Title (≤ 75 chars)
> Zerethon Tools — Offline JSON, Base64, Hash + Launcher for 109 More

## Short summary / tagline (≤ 132 chars)
> Right-click any selection → the right tool: QR code, JSON, Base64, hash, IDE. 3 offline tools + launcher. No AI, no analytics.

## Category
- Chrome: Developer Tools
- Edge: Developer tools

## Languages
- English (en) — default
- Vietnamese (vi)

## Full description (paste verbatim — plain text, line breaks preserved)

```
Zerethon Tools is a privacy-first toolkit + launcher for 113 free dev,
creator, and web3 utilities. Three of the most-used tools run FULLY OFFLINE
inside the extension — no network access, no data leaves your device.

THREE TOOLS RUN OFFLINE (no internet required)
• JSON Formatter — pretty / minify, indent control, sort keys, line+column
  error reporting.
• Base64 Encoder & Decoder — UTF-8 safe, URL-safe variant, swap input↔output
  in one click.
• Hash Generator — SHA-1 / SHA-256 / SHA-384 / SHA-512 via the browser's
  Web Crypto API. Hex (lower/upper), Base64, or Base64 URL-safe output.

Open these from the launcher — no network call, no log on our server.
Airplane-mode safe.

110 MORE TOOLS — ONE CLICK AWAY
Open as new tabs on tools.zerethon.com. The launcher searches all 113 by
name, slug, or keyword. A few examples:
QR Code Generator · SQL Formatter · UUID Generator · URL Parser · Color Converter · Markdown
to HTML · CSV to JSON · YAML to JSON · Unix Timestamp Converter · UTM
Builder · Regex Data Generator · Password Generator · Lorem Ipsum · Text
Case Converter · Image Compressor · ETH Unit Converter · Wallet Address
Validator · MD5 Hash Generator · …

BROWSER-NATIVE SHORTCUTS
• Right-click selected text → "Zerethon Tools". The first entry opens the
  selection in the best-matching tool, picked by simple rules that run
  locally (no AI, no network): a link, email or phone number → QR Code
  Generator in the right mode; JSON → JSON Formatter; Base64 → decoder;
  source code → Zerethon IDE with the detected language (PHP, JavaScript,
  TypeScript, Python, Java, C, C++, Go, Rust, SQL, Bash); other text → QR
  code. Every tool is also listed by hand: Create QR Code, Open in IDE,
  Format JSON, Encode/Decode Base64, Generate Hash, Convert case, Parse
  URL, All Tools. The text is prefilled on tools.zerethon.com or
  ide.zerethon.com.
• Type "zt" in the address bar → autocomplete any of 113 tools.
• Pin the launcher to Chrome's side panel — keep it visible while browsing.
• Ctrl+Shift+Z (Cmd+Shift+Z on Mac) opens the launcher. Customise the
  shortcut in chrome://extensions/shortcuts.

PRIVACY (READ THIS — IT IS THE WHOLE POINT)
• Zero analytics, zero telemetry, zero third-party SDKs.
• Minimal permissions — storage, contextMenus, sidePanel, activeTab,
  scripting — plus a single host: tools.zerethon.com. No <all_urls>, no
  content scripts. activeTab/scripting only read your selection (with its
  line breaks) on the tab where you click a Zerethon Tools menu entry.
• Favorites and recents are stored on your device only.
• Selected text is never sent to our server: it travels in the URL
  fragment (#…), which browsers do not send to servers, and the
  destination page decodes it in your browser.
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
  context-menu entry on selected text. The text is classified locally,
  encoded into the URL fragment of the destination (tools.zerethon.com or
  ide.zerethon.com) and decoded client-side; it is never stored or
  transmitted to a Zerethon server.

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
| 3 | Right-click a selected URL → "Zerethon Tools" submenu open: "Open “…” in the best tool" first, then the manual entries and All Tools (re-capture for 0.3.0) | Proves browser-native value |
| 4 | Address bar showing "zt json" with omnibox suggestions dropdown (json-formatter + json-diff + …) | Proves keyboard-first UX |
| 5 | chrome://extensions showing Zerethon Tools with 0 warnings, permission list (storage, contextMenus, sidePanel) + single host tools.zerethon.com visible | Reviewer-friendly: shows minimum permissions |

Capture all 5 with real Chrome on a clean profile. Do not use mockups.
Screenshot #2 is the key differentiator — visually proves the "runs offline" claim that the tagline makes.

## Promo tiles
- Small promo tile: 440×280 PNG (required)
- Marquee promo tile: 1400×560 PNG (optional but boosts visibility)
