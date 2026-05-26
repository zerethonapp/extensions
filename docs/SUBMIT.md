# Chrome Web Store + Edge Add-ons submission walkthrough

Step-by-step for shipping `zerethon-tools-v0.2.0.zip`. Each "Paste" line is
content you copy verbatim from another doc — keep this open in one tab and
the source doc in another.

---

## Pre-flight

- [ ] `npm run verify` exits 0
- [ ] `npm run build:prod` produces `zerethon-tools-v0.2.0.zip`
- [ ] `docs/SMOKE-TEST.md` checklist passed end-to-end on a clean Chrome profile
- [ ] GitHub repo `zerethonapp/extensions` is **public** (flip via Settings → Danger Zone if still private — see ticket P0-03)
- [ ] `https://tools.zerethon.com/extension/privacy` returns 200
- [ ] `https://tools.zerethon.com/extension` returns 200

If any item fails — STOP, fix, retest before resuming.

---

## Part A — Chrome Web Store

Dashboard: https://chrome.google.com/webstore/devconsole

### A.1 Select the item

- [ ] Sign in with the publisher account (the one that paid the $5 fee in P0-01)
- [ ] Open the existing **Zerethon Tools** item created during P0-01
- [ ] Top tab → **Package** → click **Upload new package**
- [ ] Upload `extensions/zerethon-tools-v0.2.0.zip`
- [ ] Dashboard auto-parses `manifest.json` → confirms version `0.2.0`, 3 permissions, 1 host

### A.2 Store listing tab

Use [`docs/LISTING.md`](LISTING.md) as source.

| Field | Paste from |
|---|---|
| Item title | `## Title` |
| Short description | `## Short summary / tagline` |
| Detailed description | Entire block under `## Full description (paste verbatim …)` — **strip the triple-backticks** |
| Category | Developer Tools |
| Language | English (default). Add Vietnamese under "Additional languages" if dashboard offers it — translations live in `_locales/vi`. |
| Official URL | `https://tools.zerethon.com/extension` |
| Homepage URL | `https://tools.zerethon.com/extension` |
| Support email | `support@zerethon.com` |

#### Graphic assets

Upload from `extensions/store-assets/chrome/`:

- [ ] **Store icon** (128×128 PNG) — Chrome generates this from `manifest.json icons.128`; usually auto-filled. If asked, upload `src/icons/icon128.png`
- [ ] **Small promo tile** (440×280 PNG, required) — upload `promo-440x280.png`
- [ ] **Marquee promo tile** (1400×560 PNG, optional but ⚠ unlocks Featured eligibility) — upload `promo-1400x560.png`
- [ ] **Screenshots** (1280×800 PNG, 1–5 allowed, **upload all 5 in order**):
  - `screenshots/01-popup-launcher.png`
  - `screenshots/02-offline-json-tool.png`
  - `screenshots/03-context-menu.png`
  - `screenshots/04-omnibox-suggestions.png`
  - `screenshots/05-extensions-card.png`

Drag-and-drop to reorder if needed — #2 (offline JSON tool) is the strongest visual and should be the first or second slot.

### A.3 Privacy practices tab

| Field | Value |
|---|---|
| Single purpose | Paste from `## Single purpose declaration` in `LISTING.md` |
| Privacy policy URL | `https://tools.zerethon.com/extension/privacy` |

#### Permission justifications

For each permission listed, paste from [`docs/PERMISSIONS.md`](PERMISSIONS.md):

- [ ] **storage** → paste the block under `## storage`
- [ ] **contextMenus** → paste the block under `## contextMenus`
- [ ] **sidePanel** → paste the block under `## sidePanel`
- [ ] **Host permissions** → paste the block under `## host_permissions: …`
- [ ] **Remote code use** → select **No** (we bundle everything; no remote scripts)

#### Data Handling Certification

Tick **all three** (they're truthful — see `LISTING.md` for the certification text):

- [ ] I do not sell or transfer user data to third parties…
- [ ] I do not use or transfer user data for purposes unrelated to my item's single purpose
- [ ] I do not use or transfer user data to determine creditworthiness or for lending purposes

#### Data types collected / used

Use the `## Data types declared` table in `LISTING.md` as the source of truth:

- [ ] **Personally identifiable info** — Not collected
- [ ] **Health info** — Not collected
- [ ] **Financial and payment info** — Not collected
- [ ] **Authentication info** — Not collected
- [ ] **Personal communications** — Not collected
- [ ] **Location** — Not collected
- [ ] **Web history** — Not collected
- [ ] **User activity** — Not collected
- [ ] **Website content** — **Collected** → justification:
  > Selected text is sent to the destination tool **only** when the user
  > explicitly invokes a context-menu entry. The text is URL-safe base64
  > encoded into the tool's `?input=` query string and decoded entirely
  > client-side by the tool page on tools.zerethon.com — it is never
  > logged on a Zerethon server. Maximum 100 KB; longer selections are
  > dropped. Three bundled offline tools decode the value locally inside
  > the extension and never touch the network.

### A.4 Distribution tab

- [ ] Visibility → **Unlisted** (initial 3-day smoke test with internal users)
- [ ] Regions → All regions
- [ ] Pricing → Free

### A.5 Submit

- [ ] Re-read each tab from top to bottom — look for typos in the description, dangling backticks, broken links
- [ ] Click **Save draft** (do this FIRST — dashboard does not auto-save and a tab close loses everything)
- [ ] Click **Submit for review**
- [ ] Save the submission timestamp + the reviewer-facing item URL into ticket `P4-01` Updates section

### A.6 Review wait

- 3–7 days typical for clean Manifest V3 with low permissions
- Email arrives at the publisher account when status changes
- **If rejected**: read the rejection email — Google cites the exact policy section. Fix exactly the cited issue (do not over-edit other parts), bump version to `0.2.1`, rebuild, resubmit. Do not argue in the appeals form unless the rejection is plainly wrong.

### A.7 Unlisted soak (3 days)

- [ ] Install the published Unlisted URL on ≥ 3 personal devices (different OSes if possible)
- [ ] Walk through smoke-test again
- [ ] Watch the dashboard for any flagged reviews

### A.8 Flip to Public

- [ ] Distribution tab → Visibility → **Public** → Save → Submit (Chrome treats visibility change as a re-submission, takes ~1 hour)
- [ ] Update landing page CTAs in `tools/` repo:
  - `.env`: `EXT_CHROME_STORE_URL=https://chrome.google.com/webstore/detail/<id>`
  - Redeploy
- [ ] Email the waitlist (`extension_waitlist_subscribers` table) with the install link
- [ ] Tweet / announce on owned channels

---

## Part B — Microsoft Edge Add-ons

Dashboard: https://partner.microsoft.com/dashboard/microsoftedge/overview

Wait until Chrome status = **Published** before doing Edge — Edge submission is much smoother once Chrome has approved (no risk of conflicting changes).

### B.1 Create new extension

- [ ] Sign in to Partner Center (free, separate from any Microsoft Store seller account)
- [ ] **+ New extension** → upload `zerethon-tools-v0.2.0.zip` (identical to Chrome)
- [ ] Edge parses manifest → no Edge-specific changes needed (Edge accepts Chrome MV3 1:1)

### B.2 Availability + Properties

- [ ] Availability → **Public**
- [ ] Markets → all markets
- [ ] Properties → Category → Developer Tools
- [ ] Properties → Website URL → `https://tools.zerethon.com/extension`
- [ ] Properties → Support URL → `https://tools.zerethon.com/extension`
- [ ] Properties → Privacy policy URL → `https://tools.zerethon.com/extension/privacy`
- [ ] Properties → Mature content → No
- [ ] Properties → Accept terms

### B.3 Store listing

Edge dashboard does **not** import from Chrome — re-enter all metadata:

- [ ] Description → paste full description from `LISTING.md`
- [ ] Short description → paste tagline from `LISTING.md`
- [ ] Screenshots → upload from `extensions/store-assets/edge/screenshots/` (same files as Chrome)
- [ ] Promo tile → `extensions/store-assets/edge/promo-440x280.png`
- [ ] Search terms (Edge-specific, comma-separated, max 7) → `JSON formatter, base64 encoder, hash generator, developer tools, offline tools, privacy-first, dev utilities`

### B.4 Submit

- [ ] Review the summary page
- [ ] Click **Publish**
- [ ] Edge review: 1–3 days typical, almost always passes if Chrome passed
- [ ] Save the submission URL into ticket `P4-02`

### B.5 Post-approval

- [ ] Update landing page CTAs (`EXT_EDGE_STORE_URL` env in `tools/` repo)
- [ ] Update `docs/LISTING.md` and `README.md` with the live Edge URL

---

## Part C — After both go Public

Move to ticket **P4-03 — Monitor first 7 days**. Daily 15-30 min:

- [ ] Check Chrome dashboard Reviews tab — reply to every review within 24h
- [ ] Check Edge dashboard Reviews tab — same
- [ ] Watch `support@zerethon.com` inbox
- [ ] If any 1-star review names a fixable bug → bump 0.2.1, fix, resubmit
- [ ] Day 7 — record install count + MAU in ticket Updates section

If install count > 500 at Day 7 → P6-01 (offline-port decision) becomes actionable. Otherwise iterate listing copy / promo tile based on what users say.

---

## Common rejection reasons (read once, ignore if not flagged)

| Reason | Why we should be safe | Action if flagged |
|---|---|---|
| Functionality wrapper around a website | 4 browser-native surfaces (popup, side panel, context menu, omnibox) + 3 offline tools | Cite `docs/PERMISSIONS.md` justifications in the appeals form |
| Permissions broader than necessary | Only 3 + 1 host; no `<all_urls>` | Verify pre-submission with `npm run verify` (does this check automatically) |
| Single purpose violation | One sentence in `LISTING.md` covers both halves coherently | Should not happen unless reviewer misreads — appeal with the same sentence |
| Remote code execution | Zero runtime deps; bundled Alpine deferred to v0.3+ | We literally don't have this; if flagged it's a false positive — point reviewer at the source repo |
| Missing privacy policy / undeclared data use | Policy URL returns 200; Website content declared with full justification | Should not happen |
| Listing quality | `LISTING.md` was strict-reviewed (P3-04 done) | Iterate after rejection only — don't pre-edit |
