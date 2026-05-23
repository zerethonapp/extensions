# P0-02 — Verify `zerethon.com` ownership for publisher badge

- **Status**: 🟡 plan
- **Phase**: 0
- **Priority**: P1
- **Estimate**: 30 minutes (mostly DNS propagation wait)
- **Blocks**: —
- **Blocked by**: P0-01 (dev account must exist first)

## Goal
Prove ownership of `zerethon.com` in Google Search Console + Chrome Web Store dashboard so the published listing shows a "by Zerethon" verified-publisher badge and unlocks per-domain analytics.

## Why
- Verified-publisher badge increases install conversion (visible trust signal next to the title)
- Lets the listing claim `tools.zerethon.com` as the official homepage without warning
- Reviewer goodwill: "this isn't an unknown one-person clone of someone else's site"

## Acceptance criteria
- [ ] `zerethon.com` verified in https://search.google.com/search-console (DNS TXT or HTML file method)
- [ ] In Chrome Web Store dashboard → Account → Verified domains: `zerethon.com` listed
- [ ] Listing preview shows "Featured" / "by Zerethon" badge next to the title

## Implementation notes
- DNS TXT method is easier than file upload because we don't need to deploy to `tools.zerethon.com` root
- The Google verification record is one TXT line at `zerethon.com` apex
- Propagation usually < 5 minutes; verification check is instant after that

## Done definition
- [ ] Listing-preview screenshot showing the badge attached to dashboard updates
- [ ] Dashboard updated to 🟢 done

## Updates
- 2026-05-23: created
