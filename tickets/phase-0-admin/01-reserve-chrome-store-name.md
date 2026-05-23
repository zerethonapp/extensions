# P0-01 — Reserve Chrome Web Store listing name

- **Status**: 🟢 done (2026-05-23 — user confirmed extension installed via dev account)
- **Phase**: 0 (pre-launch admin)
- **Priority**: P0
- **Estimate**: 15 minutes + $5 fee
- **Blocks**: P4-01 (cannot submit without dev account)
- **Blocked by**: —

## Goal
Pay the one-time Chrome Web Store $5 developer fee, create a stub item titled "Zerethon Tools" with `status: hidden`, so the name is locked under our account before any copycat squats it.

## Why
Extension names are first-come on the Chrome Web Store. A clone uploaded as "Zerethon Tools" by anyone else would force a trademark dispute (days/weeks of friction). $5 + 15 minutes today prevents that.

## Acceptance criteria
- [ ] Chrome Web Store developer account created and identity-verified (credit card + phone)
- [ ] $5 one-time registration fee paid
- [ ] Stub item titled exactly "Zerethon Tools" created with visibility = **Unlisted** and store status = draft / hidden
- [ ] Stub uploaded `zerethon-tools-v0.1.0.zip` (current build) as the placeholder package
- [ ] Listing item URL saved in P4-01 ticket

## Implementation notes
1. Go to https://chrome.google.com/webstore/devconsole
2. Sign in with the Google account that will own publishing (recommend a dedicated `zerethon-publisher@…` or similar — not a personal account)
3. Pay $5 → Google verifies card + phone (~10 min)
4. **Create item** → upload `extensions/zerethon-tools-v0.1.0.zip`
5. Set **Store listing** → Title: "Zerethon Tools" (matches `_locales/en/messages.json` `ext_name`)
6. Set **Distribution → Visibility**: Unlisted
7. Save as draft. Do not submit for review yet — that happens in P4-01.

## Done definition
- [ ] Acceptance criteria all checked
- [ ] Item URL copied into P4-01 implementation notes
- [ ] Dashboard updated to 🟢 done

## Updates
- 2026-05-23: created
