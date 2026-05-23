# Zerethon Tools Extension — Publishing Plan

> Goal: ship a Chrome / Edge extension that complements **tools.zerethon.com** and **passes store review on first submission**. v0.1 = MVP launcher; v0.2+ = selective offline ports if usage data justifies.

---

## v0.1 STATUS (2026-05-23) — Option A (Companion Launcher) shipped scope

After market analysis (single-tool extensions like Callum Locke's JSON Formatter already hit 900k+ users; multi-tool aggregators have a clear gap; cannibalization risk if our extension does too much offline) we **pivoted from Option C (full port) to Option A (companion launcher)** before any tool ports were written. Build state:

| Component | Status |
|---|---|
| Manifest V3, 3 permissions, 1 host | ✅ ship |
| Popup launcher (380×560) + side panel | ✅ ship |
| Background SW: context menu (6 entries) + omnibox `zt` + Ctrl+Shift+Z | ✅ ship |
| Tools registry (111 tools, regenerable from `/api/internal/tools.json`) | ✅ ship |
| Recents (local) + Favorites (sync) | ✅ ship |
| i18n: en + vi | ✅ ship |
| Bundled offline tools | ❌ deferred to v0.2 — context menu opens tools on the website with `?input=<base64>&ref=ext-ctx` prefill instead |
| Privacy policy at `tools.zerethon.com/extension/privacy` | 🟡 BE ticket needed |
| Landing page `tools.zerethon.com/extension` + waitlist | 🟡 BE ticket needed |
| Screenshots + promo tiles | 🟡 capture pre-submission |

**Build output**: ~30 KB zip, 17 files, 0 verify warnings.

---

## TL;DR — The Strategy (Option A)

Chrome Web Store rejects most pure "launcher" / "wrapper" extensions on the **Spam & Placement → Functionality** policy. We avoid this rejection by adding **four browser-native surfaces that a bookmark cannot provide**:

1. **Searchable launcher** (popup + side panel) with favorites + recents
2. **Context menu** on selected text (6 entries that prefill the destination tool)
3. **Omnibox keyword** `zt` for keyboard-first access
4. **Keyboard shortcut** `Ctrl+Shift+Z`

These are demonstrably real value — they exist in every tab and need no website visit to activate. With minimal permissions (`storage`, `contextMenus`, `sidePanel`, and one host) and full source published on GitHub, reviewers have nothing to flag.

We chose to NOT bundle offline tools in v0.1 because:
- **Faster validation**: 1-2 weeks to ship vs 3-4 weeks for 15 bundled tools.
- **Avoid cannibalization**: every tool open = real pageview on the website = SEO signal.
- **Data-driven v0.2**: usage analytics (recents frequency) will tell us which 5-10 tools deserve offline ports based on real user behavior, not guesses.

---

## Section 1 — Architecture Decision: 4 Models Compared

| Model | Description | Reject risk | Effort | Verdict |
|---|---|---|---|---|
| **A. Iframe wrapper** | Popup is `<iframe src="tools.zerethon.com">` | **HIGH** — violates "wrapper" policy | 1 day | ❌ Reject magnet |
| **B. Companion launcher** (popup + side panel + context menu + omnibox + shortcut) | Search/grid that opens tools on the website; context menu prefills via `?input=<base64>` | **LOW** — 4 browser-native surfaces are concrete value beyond a bookmark | 1-2 weeks | ✅ **v0.1 — SHIPPED** |
| **C. Hybrid (bundled tools + link-out)** | 5-15 most-used tools run inside extension; rest link out | **LOW** | 3-4 weeks | 🔜 v0.2 if usage data justifies |
| **D. Full port (all 111 tools)** | Every tool ported into extension | LOW | 8+ weeks | ❌ Scope killer — cannibalizes website traffic |

**Chosen: Model B.** Ship fast, validate demand, drive measurable traffic back to the website. v0.2 can layer C on top of B without breaking anything (the registry's `bundled` flag is already wired).

---

## Section 2 — What Ships in v0.1 (Companion Launcher)

> ⚠️ Strategy pivoted from "15 bundled tools" to "0 bundled tools" before any port work was done. The original 15-tool list below is preserved as the v0.2 candidate set, ranked by suitability for offline porting. Final v0.2 picks will be driven by usage data (top tools by `recents` frequency) from the first ~500 installs.

### 2.0 v0.1 actual scope
- Launcher (popup + side panel) over the full 111-tool catalog — each tool opens at `https://tools.zerethon.com/<slug>?ref=ext`
- Context menu with 6 prefill entries; selected text travels as URL-safe base64 in `?input=…` (max 100 KB) and is decoded entirely client-side by the destination tool view
- Omnibox keyword `zt` + Ctrl+Shift+Z keyboard shortcut
- Recents (chrome.storage.local, max 8) + Favorites (chrome.storage.sync, max 50)
- i18n: en (default) + vi

### 2.1 v0.2 candidate offline tools (NOT in v0.1)
Picked for: (a) self-contained JS already exists, (b) most-used per category, (c) zero external dependency.

| Slug | Category | Why bundled |
|---|---|---|
| `json-formatter` | dev | #1 most-used dev tool universally |
| `base64-encoder` | dev | Pure JS already, common context-menu use |
| `url-parser` | dev | Pairs perfectly with context menu on selected URL |
| `jwt-decoder` | dev | Privacy-critical — must run offline |
| `hash-generator` | dev | Uses SubtleCrypto, fully browser-native |
| `uuid-generator` | dev | Trivial, common request |
| `timestamp-converter` | dev | One-shot quick lookup |
| `regex-tester` | dev | Iterative, perfect for side panel |
| `color-converter` | creator | Visual, side-panel friendly |
| `markdown-to-html` | creator | Pairs with context-menu on selection |
| `lorem-ipsum` | creator | One-click generate |
| `qr-generator` | creator | Browser-only (canvas) |
| `yaml-to-json` | dev | Common pair tool |
| `text-case-converter` | creator | Context-menu killer feature |
| `eth-unit-converter` | web3 | Pure math, fast |

For v0.2, the porting recipe will be: lift each tool's JS from `tools/resources/js/tools/<slug>.js`, rewrite the small Alpine-bound surface in vanilla JS (skip Alpine — eliminates the CSP risk of its `Function()` evaluator), recreate the form layout in plain HTML + a tiny shared `shell.css`. Bundle size budget: < 100 KB total.

### 2.2 Link-out behaviour (all 111 tools in v0.1)
- Shown in popup/sidepanel grid with `↗ web` badge.
- Click → `chrome.tabs.create({ url: 'https://tools.zerethon.com/<slug>?ref=ext&src=launcher' })`
- Omnibox `zt` enter → same URL with `src=omnibox`
- Context menu → same URL with `src=ctx&input=<base64>` (+ `mode=encode|decode` for base64 tool)
- `ref=ext` lets the website measure extension-driven traffic via existing analytics — no permission needed in the extension.

### 2.3 Browser-native UX surfaces (the "not a wrapper" proof)
1. **Popup** (`action.default_popup`, 380×560) — search + grid + favorites + recents. Click opens the matching tool on the website in a new tab.
2. **Side panel** (Chrome 114+) — same launcher, full-height, docked beside browsing tabs.
3. **Context menus** on selected text — 6 entries (all open the destination tool on the website with `?input=<base64>` prefill):
   - "Zerethon: Format as JSON" → json-formatter
   - "Zerethon: Decode Base64" → base64-encoder (`?mode=decode`)
   - "Zerethon: Encode Base64" → base64-encoder (`?mode=encode`)
   - "Zerethon: Hash (SHA-256)" → hash-generator
   - "Zerethon: Convert case…" → text-case-converter
   - "Zerethon: Parse URL" → url-parser
4. **Omnibox** keyword `zt` — type `zt json` in the address bar → live suggestions → Enter opens that tool.
5. **Keyboard shortcut** (`chrome.commands`) — `Ctrl+Shift+Z` / `Cmd+Shift+Z` opens the popup launcher. User-configurable in `chrome://extensions/shortcuts`.

These 5 surfaces are the **single strongest argument** in the permission-justification text (see [`docs/PERMISSIONS.md`](docs/PERMISSIONS.md)) that this is not a wrapper. Reviewers see context menus and omnibox keyword bindings that cannot exist for a bookmarked website.

---

## Section 3 — Repo Structure (as built)

```
extensions/
├── PLAN.md                            ← this file
├── README.md                          ← dev setup, install, submit instructions
├── LICENSE
├── package.json                       ← build/verify/sync scripts (no runtime deps)
├── .gitignore
├── src/                               ← whitelist-copied into dist/ by build script
│   ├── manifest.json                  ← MV3, 3 perms, 1 host, CSP locked
│   ├── background.js                  ← context menus, omnibox, buildToolUrl()
│   ├── popup/                         ← popup.html · popup.js · popup.css
│   ├── sidepanel/                     ← sidepanel.html · sidepanel.js · sidepanel.css
│   ├── lib/
│   │   ├── tools-registry.js          ← 111 tools (synced from /api/internal/tools.json)
│   │   ├── launcher.js                ← shared search/grid view (popup + side panel)
│   │   ├── recents.js                 ← chrome.storage.local
│   │   └── favorites.js               ← chrome.storage.sync
│   ├── tools/                         ← reserved for v0.2 bundled offline tools (empty)
│   ├── icons/                         ← icon16.png · icon48.png · icon128.png
│   └── _locales/
│       ├── en/messages.json           ← default locale (manifest keys + UI strings)
│       └── vi/messages.json
├── scripts/
│   ├── build.mjs                      ← whitelist-copy src/ → dist/ → zip
│   ├── verify-package.mjs             ← 8-point pre-submission lint
│   └── sync-tools-registry.mjs        ← refresh registry from live BE
├── docs/
│   ├── PERMISSIONS.md                 ← paste-ready dashboard justifications
│   ├── PRIVACY.md                     ← source for tools.zerethon.com/extension/privacy
│   └── LISTING.md                     ← paste-ready store listing copy
└── store-assets/                      ← screenshots + promo tiles (capture pre-submit)
    ├── chrome/screenshots/
    └── edge/screenshots/
```

**Excluded from the shipped zip** (build script enforces whitelist):
`.git`, `node_modules`, `PLAN.md`, `README.md`, `docs/`, `scripts/`, `store-assets/`, `dist/`, `*.md`, `*.zip`, `.DS_Store`.

---

## Section 4 — Manifest V3 (final shape)

```jsonc
{
  "manifest_version": 3,
  "name": "__MSG_ext_name__",
  "description": "__MSG_ext_description__",
  "version": "0.1.0",
  "default_locale": "en",
  "author": "Zerethon",
  "homepage_url": "https://tools.zerethon.com/extension",
  "icons": { "16": "icons/icon16.png", "48": "icons/icon48.png", "128": "icons/icon128.png" },
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": { "16": "icons/icon16.png", "48": "icons/icon48.png", "128": "icons/icon128.png" }
  },
  "side_panel": { "default_path": "sidepanel/sidepanel.html" },
  "background": { "service_worker": "background.js", "type": "module" },
  "permissions": ["storage", "contextMenus", "sidePanel"],
  "host_permissions": ["https://tools.zerethon.com/*"],
  "omnibox": { "keyword": "zt" },
  "commands": {
    "_execute_action": { "suggested_key": { "default": "Ctrl+Shift+Z", "mac": "Command+Shift+Z" } }
  },
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'; connect-src 'self' https://tools.zerethon.com"
  }
}
```

**Deliberate omissions** (each one cuts a review-question risk):
- ❌ `tabs` — `chrome.tabs.create()` works without it
- ❌ `activeTab` — we never inject into the active page
- ❌ `scripting` — no content scripts at all
- ❌ `<all_urls>` host permission — only our own domain
- ❌ `webRequest` / `cookies` / `notifications` — none needed
- ❌ Remote scripts — no runtime deps at all (vanilla JS)
- ❌ `key` field — only used for forced ext ID during dev

---

## Section 5 — Permission justifications

Paste-ready text lives in [`docs/PERMISSIONS.md`](docs/PERMISSIONS.md). Each block is under the 1000-char dashboard limit. Reviewers reject vague justifications like "needed for extension to work" — every block in PERMISSIONS.md names the exact API used and the exact user action that triggers it.

---

## Section 6 — Single Purpose declaration (one sentence)

> A launcher for the 111+ free utilities at tools.zerethon.com — searchable popup, side panel, right-click context menu on selected text, and an address-bar omnibox keyword that opens any tool in one Enter.

---

## Section 7 — Privacy & Data Handling Disclosures

### What we collect (be honest — under-disclosure = fast rejection)
- **Personally identifiable info**: NONE
- **Health / financial / authentication / location / web history / personal communications**: NONE
- **User activity**: NONE (no analytics SDK, no event pings, no telemetry)
- **Website content**: ONLY when the user explicitly invokes a context-menu entry on selected text. That text is URL-safe base64-encoded into the `?input=…` query parameter on the destination tool URL and decoded entirely in the user's browser by the tool's existing client-side JavaScript. Maximum 100 KB; longer selections are dropped.

### Privacy Policy URL (mandatory if any data is declared, even local-only)
- **Host at**: `https://tools.zerethon.com/extension/privacy`
- **Source content**: [`docs/PRIVACY.md`](docs/PRIVACY.md) — paste into Blade view
- **BE work**: add route in `tools/routes/web.php` + `LegalController@extensionPrivacy` + `resources/views/legal/extension-privacy.blade.php`

### Three certification tick-boxes (all three TICKED truthfully)
- [x] "I do not sell or transfer user data to third parties..."
- [x] "I do not use or transfer user data for purposes unrelated to my item's single purpose"
- [x] "I do not use or transfer user data to determine creditworthiness..."

---

## Section 8 — The Anti-Rejection Checklist

Eight specific failure modes the review team hits hardest. Each one has a concrete mitigation.

| # | Rejection reason | Why we're safe |
|---|---|---|
| 1 | "Functionality wrapper around a website" | Four browser-native surfaces a bookmark cannot replicate: 6-entry context menu with selection prefill, omnibox keyword `zt` with live suggestions, side panel, keyboard shortcut. Each is named explicitly in the permission justification. |
| 2 | "Permissions broader than necessary" | Only 3 permissions + 1 host. No `<all_urls>`, no `tabs`, no `activeTab`, no `scripting`. `verify-package.mjs` greps for any banned permission and fails the build. Justifications paste-ready in [`docs/PERMISSIONS.md`](docs/PERMISSIONS.md). |
| 3 | "Single purpose violation" | One sentence in Section 6 + [`docs/LISTING.md`](docs/LISTING.md). No unrelated bundled features. |
| 4 | "Remote code execution" | Zero runtime deps (vanilla JS — Alpine deferred to v0.2 if needed, and a CSP-safe build then). CSP locked to `script-src 'self'; object-src 'self'`. `verify-package.mjs` greps for `eval(`, `new Function(`, `<script src="http`, inline `<script>` bodies, and inline `on*=` handlers. |
| 5 | "Missing privacy policy / undeclared data use" | Privacy policy URL hosted on owned domain. Disclosures in Section 7 are exhaustive — selected-text base64 transit is explicitly named. |
| 6 | "Trademark / impersonation" | We own `zerethon.com` (verified publisher). Icon resized from official `tools.zerethon.com/icon-512.png`. Name does not impersonate Google / Chrome / other vendors. |
| 7 | "Listing quality (vague description, no screenshots, keyword stuffing)" | [`docs/LISTING.md`](docs/LISTING.md) has the exact title/tagline/description. 5 real 1280×800 screenshots planned (Section 12), captured from real Chrome, not mockups. |
| 8 | "Broken on install / placeholder UI" | Manual smoke test post-build: load `dist/`, popup opens, search filters, click opens new tab to correct slug. Pre-submission verify (`npm run verify`) catches manifest / CSP / permission / locale parity regressions before zip. |

---

## Section 9 — Build Pipeline (as built)

No bundler. Vanilla ES modules served as-is. No `npm install` required for the v0.1 build.

### 9.1 Local dev (no build step needed)
```bash
# In Chrome: chrome://extensions → Developer Mode → Load Unpacked → select src/
# Edit files in src/ and click reload on the extension card.
# src/ defaults to BASE_URL = https://tools.zerethon.com (prod).
```

### 9.2 Build modes (prod vs local BE)
The extension is environment-agnostic at source level — `src/lib/config.js`
defines `BASE_URL` and the build script rewrites it in `dist/` based on
`--env=local|prod`. The same source produces both binaries; nothing in the
shipped code branches on env at runtime.

```bash
npm run build:prod             # → dist/ pointing at https://tools.zerethon.com
                               #   → zerethon-tools-vX.Y.Z.zip
                               #   This is what gets submitted to the stores.

npm run build:local            # → dist/ pointing at https://tools.zerethon.local:7890
                               #   → zerethon-tools-vX.Y.Z-dev.zip
                               #   ext_name suffixed with " (DEV)"
                               #   IS_DEV = true → orange dev bar at top of launcher
                               #   Load this build (or src/ tweaked manually) when
                               #   developing against a local Laravel BE.

npm run build                  # alias for build:prod
```

Loading `src/` straight into Chrome works against prod without ever running
the build script. Run `build:local` only when you need to point at a local BE.

### 9.3 Sync tools registry from BE
```bash
npm run sync                   # GET https://tools.zerethon.com/api/internal/tools.json
                               # → rewrites src/lib/tools-registry.js
                               # Always pulls from prod (catalog is shared).
                               # Run before each release; commit the diff.
```

### 9.4 Verify before submission
```bash
npm run verify                 # 8-point pre-submission lint:
                               #   1. manifest valid + version semver
                               #   2. no banned permissions / wildcard hosts
                               #   3. no remote script tags or http:// URLs
                               #   4. no eval / new Function / inline on*= / inline <script>
                               #   5. CSP forbids unsafe-eval and unsafe-inline
                               #   6. icons 16/48/128 present and non-empty
                               #   7. en locale has every __MSG_*__ used by manifest
                               #   8. non-en locales match en's key set
```

### 9.5 What goes into the zip
**Included** (whitelisted in `scripts/build.mjs`): `manifest.json`, `background.js`, `popup/*`, `sidepanel/*`, `lib/*` (including `config.js`), `icons/icon{16,48,128}.png`, `_locales/{en,vi}/messages.json`. Current shipped size: ~30 KB, 18 files.
**Excluded**: `.git`, `node_modules`, `PLAN.md`, `docs/`, `scripts/`, `store-assets/`, `*.map`, `*.md`, `.DS_Store`

`scripts/build.mjs` enforces the include-list (whitelist, not blacklist — safer).

---

## Section 10 — Submission Sequence

### Order matters: Chrome first, then Edge (port), defer Firefox.

#### Step 0 — Reserve the listing name NOW (do not wait for code)
Pay the **$5 Chrome Web Store dev fee** and create a stub item titled "Zerethon Tools" today, even if you upload a placeholder zip with `status: hidden`. Reason: extension names are first-come — a copycat squatting "Zerethon Tools" would force a trademark dispute. Cost: $5 once. Time: 15 minutes.

#### Step 1 — Chrome Web Store
1. Verify `zerethon.com` ownership in Search Console → unlocks "by Zerethon" verified-publisher badge.
2. Upload `zerethon-tools-v0.1.0.zip` (built earlier).
3. **Store listing**: paste verbatim from [`docs/LISTING.md`](docs/LISTING.md).
4. **Privacy practices**: tick the 3 certifications and declare data types per [`docs/LISTING.md`](docs/LISTING.md#data-types-declared).
5. **Permission justifications**: paste from [`docs/PERMISSIONS.md`](docs/PERMISSIONS.md) per permission.
6. Choose visibility: **Unlisted** first (smoke-test with 5-10 internal users for 3 days), then flip to **Public**.
7. Submit. Review queue: 3-7 days typical for clean MV3 with low permissions.

#### Step 2 — Edge Add-ons (week 4, after Chrome approves)
1. Microsoft Partner Center → free registration
2. Upload **same** zip — Edge accepts Chrome MV3 packages 1:1
3. Re-fill listing (no copy-paste from Chrome dashboard, has to re-enter)
4. Submit → review 1-3 days, less strict

#### Step 3 — Firefox AMO (later)
1. Defer. Firefox needs `background.scripts` (not `service_worker`) and `sidebar_action` (not `side_panel`). Requires a separate manifest or build target. Re-evaluate after we have install-base data from Chrome+Edge.

---

## Section 11 — Store Listing Copy

Paste-ready text lives in [`docs/LISTING.md`](docs/LISTING.md). Title, tagline, full description, single-purpose declaration, data-type disclosures, category, support email — all there.

---

## Section 12 — Screenshots Brief

Brief in [`docs/LISTING.md`](docs/LISTING.md#screenshots-brief-5--1280800-png). 5 × 1280×800 PNG, all captured from a real Chrome on a clean profile (reviewers spot mockups).

---

## Section 13 — Backend Work in `tools/` repo (BLOCKING)

Tracked separately from this extension repo. Items 1 & 4 are blockers for store submission; 2 & 3 are launch-conversion enablers.

1. **Privacy policy page (BLOCKER — Chrome submission requires the URL to 200)**
   - `Route::get('/extension/privacy', [LegalController::class, 'extensionPrivacy'])->name('legal.extension-privacy')`
   - `app/Http/Controllers/LegalController.php@extensionPrivacy`
   - `resources/views/legal/extension-privacy.blade.php` — paste content from [`docs/PRIVACY.md`](docs/PRIVACY.md)

2. **Extension landing page** (recommended — increases install conversion)
   - `Route::get('/extension', [ExtensionLandingController::class, 'show'])->name('extension.landing')`
   - View with "Add to Chrome" / "Add to Edge" buttons (links populated post-publish)
   - Add to footer / glossary nav so it's discoverable
   - **Bonus**: include an email waitlist CTA ("Get notified when v0.1 ships") — gives us 100-500 install-day users which materially helps Chrome Store ranking

3. **Tools JSON — cache headers**
   - `/api/internal/tools.json` should send `Cache-Control: public, max-age=3600` so the extension's daily fetch doesn't hammer the origin.

4. **Context-menu prefill support (BLOCKER for context menu UX value)**
   - 5 tool views need to read `?input=<urlsafe-base64>` from the URL and prefill their input box on page load:
     - `json-formatter`, `base64-encoder` (also honors `?mode=encode|decode`), `hash-generator`, `text-case-converter`, `url-parser`
   - Decode in client-side JS only — never decode on the server.
   - Add a small Alpine `init()` snippet to each of the 5 Blade views, or factor into a shared `_prefill.blade.php` partial that each view includes.
   - Without this, the context menu still works (opens the tool) but the user has to paste the text themselves — half the value.

---

## Section 14 — Risks & Open Questions

### Real risks
1. **"Wrapper" rejection** despite our four browser-native surfaces. → Mitigation in [`docs/PERMISSIONS.md`](docs/PERMISSIONS.md): every permission justification names a concrete extension-only API used and the user action that triggers it. If rejected, appeal citing Single Purpose + the 4 surfaces.
2. **`?ref=ext` query param on link-out** — Chrome reviewers occasionally flag URL augmentation as "modifying user navigation". → Acceptable: only added when the user explicitly clicks inside our UI. Documented in `host_permissions` justification.
3. **Selected-text size in context menu** — pasting >100KB into a URL would break it. → Already handled: `buildToolUrl` drops the prefill if the encoded text exceeds `MAX_PREFILL_BYTES = 100 KB`.
4. **Reduced perceived value vs single-purpose extensions** — JSON Formatter (Callum Locke) has 900k installs because users search for "JSON formatter extension" specifically. → Mitigation: title includes "JSON, Base64, Hash, Color & More" so we match the same keyword searches as single-tool extensions while offering 111 tools.

### v0.2 decision triggers (when to add bundled offline tools)
Bundle a tool's offline version when **either** is true:
- It appears in the top 5 of users' `recents` lists across the install base (proxy for "this is what people use the extension for")
- It involves sensitive data the user wouldn't want to send over the wire (JWT decoder is a clear case once we add it to tools.zerethon.com — currently not in the catalog)

### Resolved decisions
- **Repo location**: standalone `extensions/` repo (current state). Submodule from `Social/` root if discoverability needed.
- **`?ref=ext`**: ship it.
- **Cross-browser**: Chrome first, then Edge with the same zip. Firefox deferred until v0.2.
- **Open source**: yes — push to `github.com/zerethon/extensions` at v0.1 launch.

---

## Section 15 — Revised Timeline

| Week | Deliverable | Status |
|---|---|---|
| **W0** | Reserve Chrome Web Store listing name (pay $5 fee) | ⏳ do now |
| **W1** | Extension scaffold, popup, side panel, context menu, omnibox, build/verify scripts, docs | ✅ DONE 2026-05-23 |
| **W1.5** | BE work in `tools/`: `/extension/privacy` route + Blade view; `?input=` prefill on 5 tool views | ⏳ next |
| **W2** | Capture 5 real screenshots (1280×800) + 440×280 promo tile. Smoke-test on clean Chrome profile. | ⏳ |
| **W2.5** | Submit to Chrome Web Store as **Unlisted** with email waitlist signups invited to test. 3-7 day review. | ⏳ |
| **W3** | After approval: flip to **Public**. Submit to Edge Add-ons (same zip). Monitor reviews + analytics. | ⏳ |
| **+30 days** | First read of `recents` frequency from analytics — decide v0.2 bundled tools list | ⏳ |

---

## Section 16 — Done Definition for "publishable"

A submission is ready to push when **all** of these pass:

- [x] `npm run verify` exits 0 (8-point lint passes — verified 2026-05-23)
- [x] `npm run build` produces a clean zip (~30 KB, 17 files — verified 2026-05-23)
- [ ] `chrome://extensions` shows 0 warnings, 0 errors when the unpacked build is loaded
- [ ] All 6 context-menu entries open the correct tool URL with the selected text decoded into the input box
- [ ] Omnibox `zt <query>` returns suggestions and Enter opens the right tool
- [ ] Side panel opens and the launcher is fully usable inside it
- [ ] Privacy policy at `https://tools.zerethon.com/extension/privacy` returns 200 and matches [`docs/PRIVACY.md`](docs/PRIVACY.md)
- [ ] All 5 screenshots captured at 1280×800 from a real Chrome, no mockups
- [ ] Listing copy in [`docs/LISTING.md`](docs/LISTING.md) reviewed by one non-author for keyword-stuffing / vagueness
- [ ] Section 8 anti-rejection checklist re-read line by line, no item unaddressed
