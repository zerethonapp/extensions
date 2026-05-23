# P4-01 — Chrome Web Store submit (Unlisted → Public)

- **Status**: 🟡 plan
- **Phase**: 4
- **Priority**: P0
- **Estimate**: 1 hour to submit + 3-7 day review wait + 3 day smoke-test as Unlisted
- **Blocks**: P4-02 (Edge submission reuses approved package), P4-03 (monitor)
- **Blocked by**: P0-01, P0-02, P2-01, P2-02, P3-01, P3-02, P3-03, P3-04

## Goal
Submit `zerethon-tools-v0.2.0.zip` to the Chrome Web Store. Initially **Unlisted** for 3 days of internal smoke-testing, then flip to **Public**.

> **2026-05-23 — Path A chosen**: skipping a v0.1-only submit. The initial public release IS v0.2.0, which includes 3 offline-bundled tools (json-formatter, base64-encoder, hash-generator) in addition to the launcher for 109 more. Stronger first-impression listing, no resubmit needed.

## Why
End goal of the whole project. Unlisted-first lets us catch any "works on my machine but not on a stranger's clean install" issues before exposing to the open store.

## Acceptance criteria
### Pre-submit verify
- [ ] `npm run verify` exits 0
- [ ] `npm run build:prod` produces the exact zip we upload
- [ ] All P3 tickets complete (screenshots, promo tiles, QA, copy review)
- [ ] All P2 blockers complete (privacy URL returns 200, context-menu prefill working)
- [ ] All P0 admin done (dev account, domain verified, repo public)

### Upload + fill dashboard
- [ ] Sign in to https://chrome.google.com/webstore/devconsole as the publisher account from P0-01
- [ ] Upload `zerethon-tools-v0.2.0.zip` to the stub item created in P0-01
- [ ] **Store listing**:
  - Title from `docs/LISTING.md`
  - Short summary from `docs/LISTING.md`
  - Detailed description from `docs/LISTING.md`
  - Category: Developer Tools
  - Language: English (default)
  - Upload 5 screenshots from `store-assets/chrome/screenshots/`
  - Upload promo tiles from `store-assets/chrome/promo-*.png`
  - Homepage URL: `https://tools.zerethon.com/extension`
  - Support email: `support@zerethon.com`
- [ ] **Privacy practices**:
  - Single purpose declaration from `docs/LISTING.md` (one sentence)
  - Data usage disclosures per `docs/LISTING.md` (only "Website content" ticked, with the selected-text justification)
  - Privacy policy URL: `https://tools.zerethon.com/extension/privacy`
  - All 3 certifications ticked truthfully
- [ ] **Permissions justifications**: paste from `docs/PERMISSIONS.md` per permission (`storage`, `contextMenus`, `sidePanel`, `host_permissions`)
- [ ] **Distribution**: Visibility = Unlisted (initially)
- [ ] **Save draft** → re-check all forms for typos → **Submit for review**

### Post-submit
- [ ] Save the submission timestamp + reviewer-facing item URL
- [ ] Wait for review (Chrome notifies via email; 3-7 days typical for clean MV3 with low perms)
- [ ] **If rejected**: read the rejection email, fix exactly the cited issue, resubmit. Do not over-edit other parts.
- [ ] **If approved**: install the published Unlisted URL on ≥3 personal devices, smoke-test for 3 days
- [ ] After 3 days no-issue → switch Visibility from Unlisted to **Public**
- [ ] Bump `version` to 0.1.1 in `src/manifest.json` only if any post-approval fix is needed (Chrome blocks reusing version numbers)

## Implementation notes
- **Common rejection reasons mapped to mitigations in [`PLAN.md`](../../PLAN.md) §8** — re-read before submitting
- Save every dashboard form field as a draft first; the form does not auto-save and a tab close loses everything
- Do NOT tick "Family-friendly" or any unrelated optional flag — only fill what's required + privacy fields
- Don't link to the Edge listing from inside the Chrome listing (and vice versa) — some reviewers flag cross-platform promotion

## Done definition
- [ ] Listing is Public at `https://chrome.google.com/webstore/detail/<item-id>`
- [ ] Item URL recorded in this ticket Updates section
- [ ] Landing page CTAs (P2-03) updated with the real Chrome URL
- [ ] Dashboard updated to 🟢 done

## Updates
- 2026-05-23: created
