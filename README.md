# Zerethon Tools Extension

Browser-extension companion for [tools.zerethon.com](https://tools.zerethon.com).
Manifest V3. Chrome + Edge. Vanilla JS, no runtime dependencies.

## Links

### 🟢 Production (real, public)
- **Landing page** — https://tools.zerethon.com/extension
- **Privacy policy** — https://tools.zerethon.com/extension/privacy
- **Tools catalog (BE)** — https://tools.zerethon.com (111+ free utilities)
- **Source code** — https://github.com/zerethonapp/extensions
- **Chrome Web Store** — _TBD (P4-01 submission pending)_
- **Microsoft Edge Add-ons** — _TBD (P4-02 submission pending)_
- **Support** — support@zerethon.com

### 🟠 Local dev (NOT public — only on your machine)
- **Local BE** — `https://tools.zerethon.local:7890` (default; configurable in [`scripts/build.mjs`](scripts/build.mjs) → `ENVS.local.baseUrl`)
- **Built by**: `npm run build:local`
- **Recognise it in Chrome**: extension name has " (DEV)" suffix + popup shows an orange DEV bar at top

> **Mode: Option A — Companion Launcher.**
> Every tool opens in a new tab on the website. No tools run offline inside
> the extension yet. v0.2 will bundle the most-used tools based on real
> usage data. See [`PLAN.md`](PLAN.md) for the rationale.

## What it does
- Popup launcher (`Ctrl+Shift+Z` / `Cmd+Shift+Z`) — search 111 tools, pin
  favorites, see recents.
- Side panel — same launcher, docked to the right of your tabs.
- Context menu on selected text — six "Zerethon: …" entries (Format as
  JSON, Decode/Encode Base64, SHA-256 Hash, Convert case…, Parse URL).
  The selected text is URL-safe-base64-encoded into `?input=…` on the
  destination tool URL.
- Omnibox keyword `zt` — type `zt json` in the address bar, press Enter,
  the matching tool opens.

## What it does NOT do
- No content scripts.
- No analytics, no telemetry, no third-party SDKs.
- No `<all_urls>` host permission. The only host is `tools.zerethon.com`.

## Repo layout
```
src/                     # ships to the store (whitelist in scripts/build.mjs)
  manifest.json
  background.js          # context menus, omnibox, message router
  popup/                 # 380×560 launcher
  sidepanel/             # full-height launcher
  lib/                   # shared modules (registry, recents, favorites, launcher view)
  tools/                 # reserved for v0.2 bundled offline tools (empty today)
  icons/                 # 16/48/128 PNG
  _locales/en, /vi       # i18n
scripts/                 # build, verify, sync — dev-only, never shipped
docs/                    # PERMISSIONS, PRIVACY, LISTING — source for store dashboard
store-assets/            # screenshots + promo tiles for store submission
PLAN.md                  # publishing strategy + anti-rejection checklist
```

## Build modes
The extension points at either production or your local dev BE. Source
defaults to production so loading `src/` unpacked Just Works against the live
site without a build step.

```bash
npm run build:prod       # → dist/  + zerethon-tools-vX.Y.Z.zip       (prod: https://tools.zerethon.com)
npm run build:local      # → dist/  + zerethon-tools-vX.Y.Z-dev.zip   (dev:  https://tools.zerethon.local:7890)
npm run build            # alias for build:prod
npm run verify           # 8-point pre-submission lint (run before any submit)
npm run sync             # refresh src/lib/tools-registry.js from live BE (always prod)
npm run clean            # rm -rf dist *.zip
```

What `--env=local` changes inside `dist/`:
- `manifest.json` — `host_permissions`, `content_security_policy.connect-src` rewritten to the local origin
- `lib/config.js` — `BASE_URL` set to the local origin, `IS_DEV = true`
- `_locales/*/messages.json` — `ext_name` gets " (DEV)" suffix so you can tell
  the dev install apart from the prod one in the toolbar
- The popup/sidepanel renders an orange "DEV · tools.zerethon.local:7890" bar
  at the top so you always know which BE the launcher is talking to

## Load it in Chrome
```
chrome://extensions  →  Developer Mode (top-right toggle)  →  Load Unpacked
  •  for live editing:        choose  extensions/src/
  •  to test the dev build:   npm run build:local  →  choose  extensions/dist/
  •  to test the prod build:  npm run build:prod   →  choose  extensions/dist/
```

To switch between dev and prod installs, install both — Chrome treats them as
different extensions (different host permissions). The " (DEV)" suffix in the
name and the orange bar make them easy to tell apart.

### Connecting the dev build to your local BE

The dev build defaults to `https://tools.zerethon.local:7890` — it is **not** a
public URL, it only resolves on your machine. If your local BE listens
elsewhere, change `ENVS.local.baseUrl` in [`scripts/build.mjs`](scripts/build.mjs)
and rebuild.

1. Make sure the host resolves (hosts file or mDNS) and the BE is serving HTTPS
   on the configured port.
2. If using a self-signed cert: open the local URL in a regular tab first and
   accept the cert. The extension can then connect.
3. The BE must have the prefill route shipped (`?input=<urlsafe-base64>` on
   the 5 supported tools) for context-menu UX to feel complete — see
   [`PLAN.md`](PLAN.md) §13 item 4.

## Submitting
1. Bump `version` in `src/manifest.json` (semver `MAJOR.MINOR.PATCH`).
2. `npm run verify && npm run build`.
3. Upload `zerethon-tools-vX.Y.Z.zip` to the Chrome Web Store dashboard.
4. Paste justifications from [`docs/PERMISSIONS.md`](docs/PERMISSIONS.md) into
   the privacy practices form.
5. Paste listing copy from [`docs/LISTING.md`](docs/LISTING.md) into the
   store-listing form.
6. Privacy policy URL: `https://tools.zerethon.com/extension/privacy`.
7. Submit. Edge gets the same zip (Microsoft Partner Center).

## License
MIT — see [`LICENSE`](LICENSE).
