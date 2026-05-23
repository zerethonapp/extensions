# P4-02 — Edge Add-ons submit (same zip as Chrome)

- **Status**: 🟡 plan
- **Phase**: 4
- **Priority**: P1
- **Estimate**: 45 minutes submit + 1-3 day review
- **Blocks**: —
- **Blocked by**: P4-01 (use the same approved zip)

## Goal
Submit the byte-identical `zerethon-tools-v0.1.0.zip` to Microsoft Edge Add-ons (Partner Center). Edge accepts Chrome MV3 packages 1:1.

## Why
- Edge has ~5% browser market share globally, higher in enterprise. Free distribution channel.
- Reuses the entire submission package — no extra build or code work.
- Edge's review is faster and less strict than Chrome — usually approved within 1-3 days.

## Acceptance criteria
- [ ] Microsoft Partner Center account created (free registration, separate from any Microsoft Store account)
- [ ] New extension item created, upload `zerethon-tools-v0.1.0.zip` (same file as P4-01)
- [ ] Store listing filled — paste from `docs/LISTING.md` (Edge dashboard does not import from Chrome; manual entry)
- [ ] Screenshots uploaded — paths `store-assets/edge/screenshots/` (same images as Chrome by default)
- [ ] Promo tiles uploaded — same files as Chrome
- [ ] Permission justifications pasted from `docs/PERMISSIONS.md` (Edge has the same fields)
- [ ] Privacy policy URL: `https://tools.zerethon.com/extension/privacy`
- [ ] Submit for review
- [ ] Approval received within 7 days; if pending > 7, send a polite poke via support form
- [ ] Listing URL added to landing page CTAs (P2-03)

## Implementation notes
- Edge listing URL format: `https://microsoftedge.microsoft.com/addons/detail/<slug>/<id>`
- Edge offers a "Promote to other browsers" feature that lists the Chrome version of the same extension — enable this once both are approved
- Microsoft sometimes flags icons that look like Microsoft / Windows logos; ours doesn't, but worth knowing
- No $19 publisher fee any more (waived in 2022); registration is free

## Done definition
- [ ] Listing live and public on Edge Add-ons
- [ ] Listing URL recorded in this ticket
- [ ] Landing page (P2-03) and `docs/LISTING.md` updated with the Edge URL
- [ ] Dashboard updated to 🟢 done

## Updates
- 2026-05-23: created
