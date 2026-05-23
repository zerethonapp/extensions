# P4-03 — Monitor first 7 days reviews + crash reports

- **Status**: 🟡 plan
- **Phase**: 4
- **Priority**: P1
- **Estimate**: 15-30 minutes/day for 7 days
- **Blocks**: —
- **Blocked by**: P4-01 (need a live listing to monitor)

## Goal
For 7 days after the listing flips to Public, check the Chrome Web Store + Edge Add-ons dashboards daily for:
- User reviews (especially 1-2 star)
- Crash reports / install errors
- Sudden drops in install rate
- Any policy emails from Google / Microsoft

## Why
The first week post-launch is when 90% of "this is broken on my machine" issues surface. Fast response to a 1-star review with a follow-up reply often turns it into 4-5 stars later.

## Acceptance criteria
- [ ] Day 1-7 daily check of Chrome dashboard → Items → Zerethon Tools → Reviews
- [ ] Day 1-7 daily check of Edge dashboard equivalent
- [ ] Respond to every review (positive or negative) within 24 hours — Chrome surfaces response rate publicly
- [ ] Any 1-star review with a fixable bug → file a bug ticket in `tickets/phase-5-post-launch/`, fix, bump version, resubmit
- [ ] Track install count / DAU / WAU in a private note for v0.2 trigger evaluation
- [ ] Watch `support@zerethon.com` inbox for direct user reports
- [ ] Day 7: write a brief retrospective in this ticket's Updates section (installs, MAU, top issues)

## Implementation notes
- Chrome Web Store: dashboard → Items → click your item → **Reviews** tab + **Statistics** tab
- Edge Add-ons: Partner Center → Microsoft Edge program → your item → Reviews + Performance
- Crash reports rarely fire for content-script-less extensions (we have none), but service-worker errors can appear in `chrome://extensions` "Errors" button
- If a Google policy email arrives ("Your item has been flagged"), DO NOT panic — read the cited policy, respond in the form, almost all are reversible

## Done definition
- [ ] 7 daily checks completed
- [ ] All reviews replied to
- [ ] Day-7 retrospective filled in Updates section
- [ ] If install count > 500: P6-01 (offline ports decision) becomes actionable
- [ ] Dashboard updated to 🟢 done

## Updates
- 2026-05-23: created
